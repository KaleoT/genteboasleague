const {randomBytes,createHmac,timingSafeEqual}=require('node:crypto');
function admission({app,db,secret,auth,admin,publicUser,lookup,security}){
  if(!db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='status'))db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','pending_approval'))");
  db.exec(`CREATE TABLE IF NOT EXISTS admission_settings(id INTEGER PRIMARY KEY CHECK(id=1),mode TEXT NOT NULL CHECK(mode IN ('moderation','invite')));
    INSERT OR IGNORE INTO admission_settings VALUES(1,'moderation');
    CREATE TABLE IF NOT EXISTS team_invites(team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,created_at TEXT NOT NULL,used_at TEXT);
    INSERT OR IGNORE INTO schema_migrations VALUES(5);`);
  const mode=()=>db.prepare('SELECT mode FROM admission_settings WHERE id=1').get().mode;
  const hash=code=>createHmac('sha256',secret).update(code).digest();
  const publish=()=>app.locals.publishShared?.();
  app.get('/api/auth/registration-policy',(req,res)=>res.json({mode:mode()}));
  app.get('/api/admin/admission-settings',auth,admin,(req,res)=>res.json({mode:mode()}));
  app.put('/api/admin/admission-settings',auth,admin,(req,res)=>{if(!['moderation','invite'].includes(req.body.mode))return res.status(400).json({message:'Método de entrada inválido.'});db.prepare('UPDATE admission_settings SET mode=? WHERE id=1').run(req.body.mode);publish();res.json({mode:mode()});});
  app.get('/api/admin/pending-registrations',auth,admin,(req,res)=>res.json(db.prepare("SELECT id FROM users WHERE status='pending_approval' ORDER BY created_at,id").all().map(row=>publicUser(lookup.get(row.id)))));
  for(const action of ['approve','reject'])app.patch('/api/admin/registrations/:id/'+action,auth,admin,(req,res)=>{
    const user=lookup.get(req.params.id);if(!user)return res.status(404).json({message:'Solicitação não encontrada.'});
    if(user.status!=='pending_approval')return res.status(409).json({message:'Esta solicitação já foi processada.'});
    if(action==='approve')db.prepare("UPDATE users SET status='active' WHERE id=? AND status='pending_approval'").run(user.id);
    else db.prepare("DELETE FROM users WHERE id=? AND status='pending_approval'").run(user.id);
    publish();res.json({message:action==='approve'?'Técnico aprovado.':'Solicitação rejeitada e time liberado.',user:action==='approve'?publicUser(lookup.get(user.id)):null});
  });
  app.get('/api/admin/invites',auth,admin,(req,res)=>res.json(db.prepare('SELECT t.id AS team_id,t.name,u.id AS owner_id,i.created_at,i.expires_at,i.used_at FROM teams t LEFT JOIN users u ON u.team_id=t.id LEFT JOIN team_invites i ON i.team_id=t.id ORDER BY t.name').all()));
  app.post('/api/admin/invites/:id',auth,admin,(req,res)=>{
    if(!db.prepare('SELECT id FROM teams WHERE id=?').get(req.params.id))return res.status(404).json({message:'Time não encontrado.'});
    if(db.prepare('SELECT id FROM users WHERE team_id=?').get(req.params.id))return res.status(409).json({message:'O time já está ocupado ou reservado.'});
    const code=randomBytes(8).toString('hex').toUpperCase(),now=new Date().toISOString(),expires=new Date(Date.now()+7*86400000).toISOString();
    db.prepare('INSERT INTO team_invites VALUES(?,?,?,?,NULL) ON CONFLICT(team_id) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,created_at=excluded.created_at,used_at=NULL').run(req.params.id,hash(code).toString('hex'),expires,now);
    const link=new URL('/cadastro',process.env.PUBLIC_BASE_URL||'http://localhost:3000');link.searchParams.set('team',req.params.id);link.searchParams.set('code',code);
    publish();res.status(201).json({team_id:req.params.id,code,invite_url:link.href,expires_at:expires});
  });
  // Called inside the same transaction as account insertion. Rollback restores the invitation.
  function consume(team,code){
    if(mode()==='moderation')return 'pending_approval';
    const row=db.prepare('SELECT * FROM team_invites WHERE team_id=?').get(team);
    const supplied=typeof code==='string'&&code.length<=128?hash(code.trim()):hash('invalid');
    if(!row||row.used_at||row.expires_at<=new Date().toISOString()||!timingSafeEqual(supplied,Buffer.from(row.code_hash,'hex'))){
      throw Object.assign(Error('Código de acesso inválido para esta equipe'),{status:403});
    }
    db.prepare('UPDATE team_invites SET used_at=? WHERE team_id=?').run(new Date().toISOString(),team);return 'active';
  }
  return {consume,publish};
}
module.exports={admission};
