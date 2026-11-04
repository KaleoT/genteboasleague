const {randomBytes,randomUUID,createHash}=require('node:crypto');
const bcrypt=require('bcryptjs');
const validator=require('validator');
const GENERIC='Se o e-mail estiver cadastrado, as instruções foram enviadas';
const INVALID='Este link de recuperação é inválido, expirou ou já foi utilizado. Solicite um novo link.';
const hash=token=>createHash('sha256').update(token).digest('hex');
function passwords({app,db,auth,options={}}){
  db.exec(`CREATE TABLE IF NOT EXISTS password_reset_tokens(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,used_at TEXT);
    CREATE INDEX IF NOT EXISTS reset_user_index ON password_reset_tokens(user_id);
    INSERT OR IGNORE INTO schema_migrations VALUES(6);`);
  const minutes=Number(options.passwordResetMinutes??process.env.PASSWORD_RESET_TTL_MINUTES??15);
  if(!Number.isFinite(minutes)||minutes<1||minutes>120)throw Error('PASSWORD_RESET_TTL_MINUTES deve estar entre 1 e 120.');
  const email=options.emailService||require('./email.cjs').createEmailService();
  const base=new URL(process.env.PUBLIC_BASE_URL||'http://localhost:3000');if(!['http:','https:'].includes(base.protocol))throw Error('PUBLIC_BASE_URL inválida.');
  const now=()=>new Date().toISOString();
  function validate(body){
    if(typeof body.new_password!=='string'||body.new_password.length<10||Buffer.byteLength(body.new_password)>72)return 'A nova senha deve ter pelo menos 10 caracteres e até 72 bytes.';
    if(body.new_password!==body.confirm_password)return 'A confirmação da nova senha não corresponde.';
  }
  function invalidate(user_id){db.prepare('UPDATE password_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL').run(now(),user_id);}
  app.put('/api/auth/change-password',auth,async(req,res,next)=>{
    try{
      const body=req.body||{},error=validate(body);if(error)return res.status(400).json({message:error});
      if(typeof body.current_password!=='string'||Buffer.byteLength(body.current_password)>72||!await bcrypt.compare(body.current_password,req.user.hashed_password))return res.status(400).json({message:'A senha atual está incorreta.'});
      if(await bcrypt.compare(body.new_password,req.user.hashed_password))return res.status(400).json({message:'A nova senha deve ser diferente da senha atual.'});
      const hashed=await bcrypt.hash(body.new_password,12);
      db.exec('BEGIN IMMEDIATE');try{
        // Recheck after bcrypt yields: a simultaneous reset must not be overwritten.
        const result=db.prepare('UPDATE users SET hashed_password=?,token_version=token_version+1 WHERE id=? AND hashed_password=? AND token_version=?').run(hashed,req.user.id,req.user.hashed_password,req.user.token_version);
        if(result.changes!==1){db.exec('ROLLBACK');return res.status(409).json({message:'Sua sessão mudou. Entre novamente antes de alterar a senha.'});}
        invalidate(req.user.id);db.exec('COMMIT');
      }catch(e){db.exec('ROLLBACK');throw e;}
      app.locals.publishShared?.();res.json({message:'Senha alterada. Entre novamente com a nova senha.'});
    }catch(e){next(e);}
  });
  const forgotLimit=require('express-rate-limit').rateLimit({windowMs:15*60000,limit:options.passwordResetRequestLimit||5,keyGenerator:req=>hash(String(req.body?.email||'').trim().toLowerCase()),standardHeaders:false,legacyHeaders:false,handler:(_req,res)=>res.json({message:GENERIC})});
  app.post('/api/auth/forgot-password',forgotLimit,(req,res,next)=>{
    try{
      const input=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
      const token=randomBytes(32).toString('hex'),token_hash=hash(token);
      const user=input.length<=254&&validator.isEmail(input)?db.prepare('SELECT id,email FROM users WHERE email=?').get(input):null;
      if(user){
        const id=randomUUID(),expires_at=new Date(Date.now()+minutes*60000).toISOString();
        db.exec('BEGIN IMMEDIATE');try{invalidate(user.id);db.prepare('INSERT INTO password_reset_tokens VALUES(?,?,?,?,NULL)').run(id,user.id,token_hash,expires_at);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
        const url=new URL('/redefinir-senha',base);url.searchParams.set('token',token);
        // Delivery is detached from the HTTP response, so provider timing/failure cannot enumerate accounts.
        setImmediate(()=>Promise.resolve().then(()=>email.sendPasswordReset({to:user.email,url:url.href,minutes,expires_at})).catch(()=>console.error(JSON.stringify({event:'password_reset_delivery_failed'}))));
      }
      res.json({message:GENERIC});
    }catch(e){next(e);}
  });
  app.post('/api/auth/reset-password',async(req,res,next)=>{
    try{
      const body=req.body||{};if(typeof body.token!=='string'||!/^[a-f0-9]{64}$/.test(body.token))return res.status(400).json({error:'INVALID_RESET_TOKEN',message:INVALID});
      const token_hash=hash(body.token);const row=db.prepare('SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').get(token_hash,now());
      if(!row)return res.status(400).json({error:'INVALID_RESET_TOKEN',message:INVALID});
      const error=validate(body);if(error)return res.status(400).json({message:error});
      const user=db.prepare('SELECT hashed_password FROM users WHERE id=?').get(row.user_id);
      if(!user)return res.status(400).json({error:'INVALID_RESET_TOKEN',message:INVALID});
      if(await bcrypt.compare(body.new_password,user.hashed_password))return res.status(400).json({message:'A nova senha deve ser diferente da senha atual.'});
      const hashed=await bcrypt.hash(body.new_password,12);
      db.exec('BEGIN IMMEDIATE');try{
        const consumed=db.prepare('UPDATE password_reset_tokens SET used_at=? WHERE id=? AND used_at IS NULL AND expires_at>?').run(now(),row.id,now());
        if(consumed.changes!==1){db.exec('ROLLBACK');return res.status(400).json({error:'INVALID_RESET_TOKEN',message:INVALID});}
        db.prepare('UPDATE users SET hashed_password=?,token_version=token_version+1 WHERE id=?').run(hashed,row.user_id);invalidate(row.user_id);db.exec('COMMIT');
      }catch(e){db.exec('ROLLBACK');throw e;}
      app.locals.publishShared?.();res.json({message:'Senha redefinida. Entre com a nova senha.'});
    }catch(e){next(e);}
  });
}
module.exports={passwords};
