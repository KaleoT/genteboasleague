const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
function phone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  return digits;
}
function createApp(options = {}) {
  const secret = options.secret || process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32 || secret.startsWith('replace-')) throw Error('Configure JWT_SECRET com pelo menos 32 bytes aleatórios.');
  const file = options.database || process.env.DATABASE_PATH || './data/gbl.sqlite';
  if (file !== ':memory:') mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file, { timeout: 5000 });
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS teams(id TEXT PRIMARY KEY, name TEXT NOT NULL, badge_url TEXT NOT NULL DEFAULT 'assets/default-shield.svg');
    CREATE TABLE IF NOT EXISTS users(
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK(email=lower(email)),
      phone TEXT NOT NULL UNIQUE CHECK(length(phone) IN (10,11) AND phone NOT GLOB '*[^0-9]*'),
      hashed_password TEXT NOT NULL, team_id TEXT NOT NULL UNIQUE REFERENCES teams(id),
      role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('admin','player')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      token_version INTEGER NOT NULL DEFAULT 0);
    INSERT OR IGNORE INTO schema_migrations VALUES(1);`);
  const seed = db.prepare('INSERT OR IGNORE INTO teams(id,name,badge_url) VALUES(?,?,?)');
  for (const team of require('./teams.json')) seed.run(team.id, team.name, team.badge_url);
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health',(_req,res)=>{try{db.prepare('SELECT 1').get();res.set('Cache-Control','no-store').json({app:'gbl-league',status:'ok'});}catch{res.status(503).json({app:'gbl-league',status:'unavailable'});}});
  // O legado usa imagens e handlers inline; CSP estrita exige migração própria.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false }));
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s=>s.trim());
  app.use(cors({ origin(origin, cb) { cb(null, !origin || origins.includes(origin)); }, methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders:['Content-Type','Authorization'] }));
  app.use('/api/admin/migrate-backup',express.json({limit:'32mb'}));
  app.use(express.json({limit:'8mb'}));
  app.use('/api', (req,res,next)=> { res.set('Cache-Control','no-store'); next(); });
  app.use('/api/auth', rateLimit({windowMs: 15*60*1000, limit: options.rateLimit || 100, standardHeaders:'draft-8', legacyHeaders:false, message:{message:'Muitas tentativas. Tente novamente em alguns minutos.'}}));
  const lookup = db.prepare('SELECT u.*, t.name AS team_name,t.badge_url FROM users u JOIN teams t ON t.id=u.team_id WHERE u.id=?');
  const publicUser = u => ({id:u.id,name:u.name,email:u.email,phone:u.phone,role:u.role,team_id:u.team_id,teamName:u.team_name,created_at:u.created_at,status:u.status,is_approved:u.status==='active',team:{id:u.team_id,name:u.team_name,badge_url:u.badge_url}});
  const issue = u => ({access_token:jwt.sign({role:u.role,team_id:u.team_id,ver:u.token_version},secret,{algorithm:'HS256',subject:u.id,expiresIn:'1h',issuer:'gbl-api',audience:'gbl-web'}), token_type:'Bearer',expires_in:3600,user:publicUser(u)});
  const security=require('./security.cjs').createSecurity({secret,lookup,logger:options.securityLogger});
  const {require_auth:auth,require_admin:admin}=security;
  const entry=require('./admission.cjs').admission({app,db,secret,auth,admin,publicUser,lookup,security});
  require('./passwords.cjs').passwords({app,db,auth,options});
  const conflict = (res,error) => {
    if (/users.team_id/.test(error.message)) return res.status(409).json({message:'Este time já foi reivindicado por outro jogador'});
    if (/users.email/.test(error.message)) return res.status(409).json({message:'E-mail já cadastrado.'});
    if (/users.phone/.test(error.message)) return res.status(409).json({message:'Celular já cadastrado.'});
    throw error;
  };
  app.get('/api/teams/available',(req,res)=>res.json(db.prepare('SELECT t.id,t.name,t.badge_url FROM teams t LEFT JOIN users u ON u.team_id=t.id WHERE u.id IS NULL ORDER BY t.name').all()));
  app.post('/api/auth/register',async(req,res,next)=> {
    try {
      const body=req.body || {};
      const name=typeof body.name==='string'?body.name.trim():'';
      const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
      const number=phone(body.phone), password=body.password;
      if (name.length<2 || name.length>80 || !validator.isEmail(email) || !/^[1-9]\d{9,10}$/.test(number) || typeof password!=='string' || password.length<10 || Buffer.byteLength(password)>72 || typeof body.team_id!=='string') return res.status(400).json({message:'Informe nome, e-mail válido, celular com DDD e senha de 10 caracteres ou mais (até 72 bytes).'});
      if (!db.prepare('SELECT id FROM teams WHERE id=?').get(body.team_id)) return res.status(400).json({message:'Time inválido.'});
      const hashed=await bcrypt.hash(password,12);
      const id=randomUUID();
      db.exec('BEGIN IMMEDIATE');
      try {
        const status=entry.consume(body.team_id,body.invite_code);
        db.prepare('INSERT INTO users(id,name,email,phone,hashed_password,team_id,status) VALUES(?,?,?,?,?,?,?)').run(id,name,email,number,hashed,body.team_id,status);
        db.exec('COMMIT');
      }catch(error){db.exec('ROLLBACK');if(error.status===403)return security.deny(req,res,error.message,'invalid_team_invite');return conflict(res,error);}
      entry.publish();
      res.status(201).json(issue(lookup.get(id)));
    } catch(error) { next(error); }
  });
  const dummy=bcrypt.hashSync('constant-time-invalid-password',12);
  app.post('/api/auth/login',async(req,res,next)=> {
    try {
      const { identifier, password }=req.body || {};
      if (typeof identifier!=='string' || identifier.length>254 || typeof password!=='string' || Buffer.byteLength(password)>72) return res.status(400).json({message:'Informe e-mail ou celular e senha.'});
      const input=identifier.trim();
      const row=input.includes('@') ? db.prepare('SELECT id,hashed_password FROM users WHERE email=?').get(input.toLowerCase()) : db.prepare('SELECT id,hashed_password FROM users WHERE phone=?').get(phone(input));
      const ok=await bcrypt.compare(password,row?.hashed_password || dummy);
      if (!row || !ok) return res.status(401).json({message:'E-mail/celular ou senha incorretos.'});
      res.json(issue(lookup.get(row.id)));
    } catch(error) { next(error); }
  });
  app.get('/api/auth/me',auth,(req,res)=>res.json(publicUser(req.user)));
  app.post('/api/auth/logout',auth,(req,res)=> { db.prepare('UPDATE users SET token_version=token_version+1 WHERE id=?').run(req.user.id); res.sendStatus(204); });
  app.get('/api/admin/users',auth,admin,(req,res)=>res.json(db.prepare('SELECT id FROM users ORDER BY created_at').all().map(u=>publicUser(lookup.get(u.id)))));
  app.patch('/api/admin/users/:id',auth,admin,(req,res,next)=> {
    try {
      const existing=lookup.get(req.params.id), body=req.body || {};
      if (!existing) return res.sendStatus(404);
      const name=String(body.name || '').trim(), number=phone(body.phone);
      if (name.length<2 || name.length>80 || !/^[1-9]\d{9,10}$/.test(number) || !['admin','player'].includes(body.role) || typeof body.team_id!=='string') return res.status(400).json({message:'Dados do usuário inválidos.'});
      if (!db.prepare('SELECT id FROM teams WHERE id=?').get(body.team_id)) return res.status(400).json({message:'Time inválido.'});
      if (existing.role==='admin' && body.role!=='admin' && db.prepare("SELECT count(*) AS n FROM users WHERE role='admin'").get().n===1) return res.status(409).json({message:'Mantenha pelo menos um administrador.'});
      db.prepare('UPDATE users SET name=?,phone=?,team_id=?,role=?,token_version=token_version+1 WHERE id=?').run(name,number,body.team_id,body.role,existing.id);
      res.json(publicUser(lookup.get(existing.id)));
    } catch(error) { try { conflict(res,error); } catch(err) { next(err); } }
  });
  app.delete('/api/admin/users/:id',auth,admin,(req,res)=> {
    if (req.params.id===req.user.id) return res.status(409).json({message:'Não é possível excluir sua própria conta.'});
    db.prepare('DELETE FROM users WHERE id=?').run(req.params.id); res.sendStatus(204);
  });
  db.exec(`CREATE TABLE IF NOT EXISTS ranking_sync(id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL);
    INSERT OR IGNORE INTO schema_migrations VALUES(2);`);
  app.get('/api/rankings',(req,res)=>{
    const row=db.prepare('SELECT payload FROM ranking_sync WHERE id=1').get();
    if(!row)return res.sendStatus(204);
    res.json(JSON.parse(row.payload));
  });
  const syncLimit=rateLimit({windowMs:60000,limit:5,standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Aguarde um minuto antes de sincronizar novamente.'}});
  let syncing=false;
  app.post('/api/admin/rankings/sync',auth,admin,syncLimit,async(req,res)=>{
    if(syncing)return res.status(409).json({message:'Uma sincronização já está em andamento.'});
    syncing=true;
    try{
      const {importRankings,DEFAULT_URL}=require('./ranking-sync.cjs');
      const payload=await importRankings(req.body?.url || DEFAULT_URL,options.sheetsFetch || fetch);
      // Um único registro substitui as duas tabelas e o horário atomicamente.
      db.prepare('INSERT INTO ranking_sync(id,payload) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload').run(JSON.stringify(payload));
      const clubs=JSON.parse(db.prepare("SELECT payload FROM shared_collections WHERE name='teams'").get().payload);
      for(const rows of Object.values(payload.rankings))for(const row of rows){const found=clubs.filter(t=>[t.name,t.manager].some(v=>String(v||'').trim().toLowerCase()===String(row.name).trim().toLowerCase()));if(found.length===1)row.team_id=found[0].id;}
      db.prepare("UPDATE shared_collections SET payload=?,revision=revision+1 WHERE name='ranking'").run(JSON.stringify({...payload.rankings,sync:{synced_at:payload.synced_at,source_url:payload.source_url,warnings:payload.warnings||[]}}));
      app.locals.publishShared?.();
      res.json(payload);
    }catch(error){res.status(422).json({message:'Falha na sincronização: '+error.message});}
    finally{syncing=false;}
  });
  require('./shared.cjs')({app,db,auth,admin,security,options});
  app.use('/api',(req,res)=>res.status(404).json({message:'Rota não encontrada.'}));
  const root=path.resolve(__dirname,'..');
  // Nunca servir banco, segredos, fontes do servidor ou node_modules.
  for (const dir of ['js','css','assets']) app.use('/'+dir,express.static(path.join(root,dir),{dotfiles:'deny'}));
  app.get('/redefinir-senha',(req,res)=>{res.set({'Referrer-Policy':'no-referrer','Cache-Control':'no-store'});res.sendFile(path.join(__dirname,'..','index.html'));});
  app.get('/cadastro',(req,res)=>res.sendFile(path.join(__dirname,'..','index.html')));
  app.get('/',(req,res)=>res.sendFile(path.join(root,'index.html')));
  app.use((error,req,res,next)=> { if(error.type==='entity.parse.failed' || error.type==='entity.too.large') return res.status(400).json({message:'JSON inválido ou muito grande.'}); console.error(error.code || error.name); res.status(500).json({message:'Erro interno ao processar a solicitação.'}); });
  return {app,db};
}
module.exports={createApp,phone};
