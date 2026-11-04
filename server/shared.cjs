const {prepareProposal,publicData}=require('./proposal.cjs');
const {randomUUID}=require('node:crypto');
const seeds=require('./shared-seed.json');
module.exports=function shared({app,db,auth,admin,security,options}) {
  db.exec(`CREATE TABLE IF NOT EXISTS shared_collections(name TEXT PRIMARY KEY,payload TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS rosters(team_id TEXT NOT NULL REFERENCES teams(id),player_id TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(team_id,player_id));
    CREATE TABLE IF NOT EXISTS schedules(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,date TEXT NOT NULL,periods TEXT NOT NULL,venue TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,UNIQUE(user_id,date));
    INSERT OR IGNORE INTO schema_migrations VALUES(3);`);
  db.exec(`CREATE TABLE IF NOT EXISTS news(id TEXT PRIMARY KEY,title TEXT,subtitle TEXT,category TEXT,cover_url TEXT,body TEXT,published_at TEXT,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tournament_editions(id TEXT PRIMARY KEY,champion TEXT,runner_up TEXT,final_score TEXT,season TEXT,year TEXT,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS titles(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS transfers(id TEXT PRIMARY KEY,team_a TEXT,team_b TEXT,status TEXT,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS proposals(id TEXT PRIMARY KEY,from_user_id TEXT,from_team_id TEXT,to_team_id TEXT,status TEXT,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS team_limits(id TEXT PRIMARY KEY,max_trades INTEGER,reserves INTEGER,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS schedule_options(id TEXT PRIMARY KEY,payload TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tactics(team_id TEXT PRIMARY KEY REFERENCES teams(id),formation TEXT,starters TEXT,payload TEXT NOT NULL);
    INSERT OR IGNORE INTO schema_migrations VALUES(4);`);
  function index(key,value){
    const tables={news:'news',history:'tournament_editions',finals:'titles',records:'records',transfers:'transfers',proposals:'proposals',limits:'team_limits',schedule_options:'schedule_options'};
    const table=tables[key];if(!table)return;db.exec('DELETE FROM '+table);
    for(const r of value){const payload=JSON.stringify(r);
      if(key==='news')db.prepare('INSERT INTO news VALUES(?,?,?,?,?,?,?,?)').run(r.id,r.title||'',r.subtitle||'',r.category||'',r.cover_url||r.image||'',r.body||'',r.published_at||r.createdAt||'',payload);
      else if(key==='history')db.prepare('INSERT INTO tournament_editions VALUES(?,?,?,?,?,?,?)').run(r.id,r.champion||r.winnerTeam||'',r.runnerUp||r.runnerTeam||'',r.finalScore||'',String(r.season||''),String(r.year||''),payload);
      else if(key==='transfers')db.prepare('INSERT INTO transfers VALUES(?,?,?,?,?)').run(r.id,r.teamA||'',r.teamB||'',r.status||'Confirmada',payload);
      else if(key==='proposals')db.prepare('INSERT INTO proposals VALUES(?,?,?,?,?,?)').run(r.id,r.from_user_id||'',r.from_team_id||'',r.to_team_id||'',r.status||'Pendente',payload);
      else if(key==='limits')db.prepare('INSERT INTO team_limits VALUES(?,?,?,?)').run(r.id,Number(r.maxTrades??3),Number(r.reserves??5),payload);
      else db.prepare('INSERT INTO '+table+' VALUES(?,?)').run(r.id,payload);
    }
  }
  const rosterColumns=db.prepare('PRAGMA table_info(rosters)').all().map(c=>c.name);
  for(const c of ['shirt_number','tactical_position','field_x','field_y','is_starter'])if(!rosterColumns.includes(c))db.exec('ALTER TABLE rosters ADD COLUMN '+c+' TEXT');
  const columns=db.prepare('PRAGMA table_info(teams)').all().map(c=>c.name);
  for(const c of ['manager_name','kit_home_3d_url','kit_away_3d_url','formation','stars','overall_rating','captain','league'])if(!columns.includes(c))db.exec(`ALTER TABLE teams ADD COLUMN ${c} TEXT`);
  for(const [name,value] of Object.entries(seeds))db.prepare('INSERT OR IGNORE INTO shared_collections(name,payload) VALUES(?,?)').run(name,JSON.stringify(value));
  const clients=new Set();
  function publish(){for(const res of clients)res.write('data: changed\n\n');}
  function read(key){const row=db.prepare('SELECT * FROM shared_collections WHERE name=?').get(key);if(!row)throw Error('Coleção inválida');return {value:JSON.parse(row.payload),revision:row.revision};}
  function rosterIndex(teams){
    db.exec('DELETE FROM rosters; DELETE FROM tactics');
    for(const t of teams){
      db.prepare('INSERT INTO tactics VALUES(?,?,?,?)').run(t.id,t.starterFormation||t.formation||'',JSON.stringify(t.starterIds||[]),JSON.stringify(t.roster||[]));
      db.prepare('UPDATE teams SET name=?,badge_url=?,manager_name=?,kit_home_3d_url=?,kit_away_3d_url=?,formation=?,stars=?,overall_rating=?,captain=?,league=? WHERE id=?').run(t.name,t.badge_url||'assets/default-shield.svg',t.manager||'',t.kit_home_3d_url||'',t.kit_away_3d_url||'',t.formation||'',String(t.stars||0),String(t.overall_rating||t.avgOvr||0),t.captain||'',t.league||'',t.id);
      for(const p of t.roster||[])db.prepare('INSERT INTO rosters(team_id,player_id,payload,shirt_number,tactical_position,field_x,field_y,is_starter) VALUES(?,?,?,?,?,?,?,?)').run(t.id,p.id,JSON.stringify(p),String(p.shirt_number||p.number||''),p.tactical_position||p.pos||'',String(p.x??''),String(p.y??''),String((t.starterIds||[]).includes(p.id)));
    }
  }
  let transaction=false;
  function put(key,value,expected){
    const own=!transaction;
    if(own)db.exec('BEGIN IMMEDIATE');
    try{const old=read(key);if(expected!==undefined && old.revision!==expected)throw Object.assign(Error('Os dados mudaram. Recarregue e tente novamente.'),{status:409});
      if(key==='teams')for(const team of value){const before=old.value.find(t=>t.id===team.id);if(before&&before.badge_url!==team.badge_url){team.shield_image=team.badge_url||'';team.custom_shield=team.badge_url||'';}}
      db.prepare('UPDATE shared_collections SET payload=?,revision=revision+1 WHERE name=?').run(JSON.stringify(value),key);
      if(key==='teams'){
        rosterIndex(value);
        const badges=read('badges').value;
        for(const previous of old.value){const current=value.find(t=>t.id===previous.id);if(!current||current.name!==previous.name)delete badges[previous.name.trim().toLowerCase()];if(!current)delete badges[previous.id];}
        for(const team of value){const before=old.value.find(t=>t.id===team.id);if(before&&(before.badge_url!==team.badge_url||before.name!==team.name)){badges[team.name.trim().toLowerCase()]=team.badge_url||'';badges[team.id]=team.badge_url||'';}}
        db.prepare("UPDATE shared_collections SET payload=?,revision=revision+1 WHERE name='badges'").run(JSON.stringify(badges));
      }
      index(key,value);
      if(key==='badges'){
        const clubs=read('teams').value;
        for(const t of clubs){const badge=value[String(t.name).trim().toLowerCase()]??value[t.id];if(badge!==undefined){t.badge_url=badge;t.shield_image=badge;}}
        db.prepare("UPDATE shared_collections SET payload=?,revision=revision+1 WHERE name='teams'").run(JSON.stringify(clubs));rosterIndex(clubs);
      }
      if(own){db.exec('COMMIT');app.locals.cleanupUploads?.();publish();}return read(key);
    }catch(e){if(own)db.exec('ROLLBACK');throw e;}
  }
  rosterIndex(read('teams').value);
  for(const key of Object.keys(seeds))index(key,read(key).value);
  app.locals.publishShared=publish;
  const fail=(res,e)=>e.status===403?security.deny(res.req,res,e.message,'write_policy'):res.status(e.status||400).json({message:e.message});
  function validate(key,value,user){
    if(key==='teams'){
      if(!Array.isArray(value)||value.length!==read('teams').value.length)throw Error('Lista de clubes inválida.');
      const previous=read('teams').value;
      if(new Set(value.map(t=>t.id)).size!==value.length)throw Error('Clube duplicado.');
      for(const t of value){const old=previous.find(o=>o.id===t.id);if(!old)throw Error('Clube desconhecido.');
        if(JSON.stringify(t)===JSON.stringify(old))continue;
        if(user.role!=='admin'){
          if(t.id!==user.team_id)throw Object.assign(Error('Você só tem permissão para alterar os dados da sua própria equipe'),{status:403});
          const allowed=new Set(['formation','starterFormation','starterIds','kit_home_3d_url','kit_away_3d_url','captain','badge_url','shield_image','roster']);
          if(JSON.stringify(t.roster)!==JSON.stringify(old.roster)){
            if(!Array.isArray(t.roster)||t.roster.length!==old.roster.length)throw Object.assign(Error('Não é permitido adicionar ou remover atletas.'),{status:403});
            for(const p of t.roster){const previous=old.roster.find(o=>o.id===p.id);if(!previous)throw Object.assign(Error('Atleta desconhecido.'),{status:403});for(const field of new Set([...Object.keys(p),...Object.keys(previous)]))if(!['x','y','shirt_number','number','tactical_position'].includes(field)&&JSON.stringify(p[field])!==JSON.stringify(previous[field]))throw Object.assign(Error('Atributo de atleta exclusivo do administrador.'),{status:403});}
          }
          for(const k of new Set([...Object.keys(old),...Object.keys(t)]))if(!allowed.has(k)&&JSON.stringify(t[k])!==JSON.stringify(old[k]))throw Object.assign(Error('Campo exclusivo do administrador: '+k),{status:403});
        }
        if(typeof t.name!=='string'||!t.name.trim()||!Array.isArray(t.roster)||t.roster.length>30||new Set(t.roster.map(p=>p.id)).size!==t.roster.length)throw Error('Clube ou elenco inválido.');
        for(const p of t.roster)if(typeof p.id!=='string'||typeof p.name!=='string'||!p.name.trim()||!Number.isFinite(Number(p.ovr)))throw Error('Atleta inválido.');
        if(t.starterIds && (t.starterIds.length>11||new Set(t.starterIds).size!==t.starterIds.length||t.starterIds.some(id=>!t.roster.some(p=>p.id===id))))throw Error('Titulares inválidos.');
        for(const field of ['badge_url','kit_home_3d_url','kit_away_3d_url'])if(t[field]!==old[field]&&/^data:|^blob:/i.test(t[field]||''))throw Error('Envie o arquivo pela ferramenta de upload para obter uma URL pública.');
        for(const field of ['badge_url','kit_home_3d_url','kit_away_3d_url'])if(t[field]&&!/^(https?:\/\/|\/uploads\/(badges|kits)\/|assets\/|data:image\/(png|jpeg|webp);base64,)/i.test(t[field]))throw Error('Imagem inválida.');
      }
    }else if(user.role!=='admin')throw Object.assign(Error('Acesso exclusivo para administradores'),{status:403});
    if(!['active','badges','ranking'].includes(key)){
      if(!Array.isArray(value)||value.some(r=>!r||typeof r.id!=='string')||new Set(value.map(r=>r.id)).size!==value.length)throw Error('Formato ou identificadores inválidos.');
    }
    if(key==='transfers'&&value.some(r=>!read('transfers').value.some(o=>o.id===r.id)))throw Error('Use a confirmação oficial para registrar transferências.');
    if(key==='news'&&value.some(r=>typeof r.title!=='string'||!r.title.trim()||typeof r.body!=='string'))throw Error('Notícia inválida.');
    if(key==='limits'&&value.some(r=>typeof r.name!=='string'||!Number.isInteger(r.maxTrades)||r.maxTrades<0||r.maxTrades>100||!Number.isInteger(r.reserves)||r.reserves<0))throw Error('Limites inválidos.');
    if(key==='badges'&&value&&Object.entries(value).some(([k,v])=>v!==read('badges').value[k]&&typeof v==='string'&&/^(data:|blob:)/i.test(v)))throw Error('Envie o arquivo pelo upload para gerar uma URL pública.');
    if(key==='badges'&&(!value||Array.isArray(value)||typeof value!=='object'||Object.values(value).some(v=>typeof v!=='string'||v&&!/^(https?:\/\/|\/uploads\/(badges|kits)\/|assets\/|data:image\/(png|jpeg|webp);base64,)/i.test(v))))throw Error('Escudos inválidos.');
  }
  function votes(){
    const current=db.prepare('SELECT s.*,u.name,u.team_id FROM schedules s JOIN users u ON u.id=s.user_id ORDER BY s.created_at,s.id').all().map(s=>({id:s.id,user_id:s.user_id,team_id:s.team_id,name:s.name,date:s.date,periods:JSON.parse(s.periods),venue:s.venue,createdAt:s.created_at}));
    return [...current,...db.prepare('SELECT payload FROM legacy_schedule_votes').all().map(r=>({...JSON.parse(r.payload),legacy:true,user_id:null}))].sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||''))||a.id.localeCompare(b.id));
  }
  require('./backup.cjs')({app,db,auth,admin,read,votes,restore(values,point){
    const ids=new Set(values.teams.map(t=>t.id));
    for(const u of db.prepare('SELECT team_id FROM users').all())if(!ids.has(u.team_id))throw Error('O backup omite um clube com usuário vinculado: '+u.team_id+'. Nenhuma conta ou vínculo será removido pela migração.');
    db.exec('BEGIN IMMEDIATE');transaction=true;
    try{
      db.prepare('INSERT INTO migration_backups VALUES(?,?,?)').run(point.id,point.created_at,point.payload);
      for(const t of values.teams)db.prepare('INSERT OR IGNORE INTO teams(id,name,badge_url) VALUES(?,?,?)').run(t.id,t.name,t.badge_url||'assets/default-shield.svg');
      for(const [key,value] of Object.entries(values))if(key!=='schedules')put(key,value);
      for(const t of db.prepare('SELECT id FROM teams').all())if(!ids.has(t.id))db.prepare('DELETE FROM teams WHERE id=?').run(t.id);
      db.exec('DELETE FROM schedules; DELETE FROM legacy_schedule_votes; DELETE FROM ranking_sync');
      for(const v of values.schedules){
        const user=v.user_id&&db.prepare('SELECT id,team_id FROM users WHERE id=?').get(v.user_id);
        if(user&&user.team_id===v.team_id&&!v.legacy)db.prepare('INSERT INTO schedules VALUES(?,?,?,?,?,?)').run(v.id,user.id,v.date,JSON.stringify(v.periods),v.venue||'',v.createdAt||point.created_at);
        else db.prepare('INSERT INTO legacy_schedule_votes VALUES(?,?)').run(v.id,JSON.stringify({...v,user_id:null,legacy:true,createdAt:v.createdAt||point.created_at}));
      }
      if(values.ranking.sync?.synced_at)db.prepare('INSERT INTO ranking_sync VALUES(1,?)').run(JSON.stringify({rankings:{historico:values.ranking.historico,temporada2026:values.ranking.temporada2026},synced_at:values.ranking.sync.synced_at,source_url:values.ranking.sync.source_url,warnings:values.ranking.sync.warnings||[]}));
      db.exec('DELETE FROM migration_backups WHERE id NOT IN (SELECT id FROM migration_backups ORDER BY created_at DESC LIMIT 10)');
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}finally{transaction=false;}app.locals.cleanupUploads?.();publish();
  }});
  require('./uploads.cjs')({app,db,auth,security,read,options,setMedia(id,field,url,asset){
    const teams=read('teams').value,team=teams.find(t=>t.id===id);if(!team)throw Error('Clube não encontrado.');
    team[field]=url;
    db.exec('BEGIN IMMEDIATE');transaction=true;
    try{
      if(asset)db.prepare('INSERT INTO uploaded_assets VALUES(?,?,?,?)').run(asset.url,asset.category,asset.filename,new Date().toISOString());
      if(field==='badge_url'){
        team.shield_image=url;team.custom_shield=url;
        const badges=read('badges').value;badges[team.name.trim().toLowerCase()]=url;badges[team.id]=url;
        // Drop obsolete duplicate crest copies for this club in legacy projections.
        for(const key of ['limits','ranking']){const data=read(key).value,rows=Array.isArray(data)?data:[...(data.historico||[]),...(data.temporada2026||[])];for(const row of rows)if(row.team_id===id||row.id===id||row.name===team.name)for(const f of ['badge_url','shield_image','custom_shield'])delete row[f];put(key,data);}
        put('teams',teams);put('badges',badges);
      }else put('teams',teams);
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}finally{transaction=false;}app.locals.cleanupUploads?.();publish();return team;
  }});
  app.get('/api/events',(req,res)=>{res.set({'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.flushHeaders();res.write('data: connected\n\n');clients.add(res);const heartbeat=setInterval(()=>res.write(': keepalive\n\n'),25000);heartbeat.unref();req.on('close',()=>{clearInterval(heartbeat);clients.delete(res);});});
  app.get('/api/state',(req,res)=>{const state={};for(const key of Object.keys(seeds))if(key!=='proposals')state[key]=read(key);state.schedules={value:votes(),revision:0};res.json(publicData(state));});
  app.put('/api/collections/:key',auth,(req,res)=>{try{const key=req.params.key;if(!Object.hasOwn(seeds,key)||['schedules','proposals'].includes(key))return res.sendStatus(404);if(key!=='teams'&&req.user.role!=='admin')return security.deny(req,res,'Acesso exclusivo para administradores','admin_collection');if(!Number.isInteger(req.body.revision))throw Error('Informe a revisão.');validate(key,req.body.value,req.user);res.json(put(key,req.body.value,req.body.revision));}catch(e){fail(res,e);}});
  const teamView=t=>({...t,manager_name:t.manager||'',overall_rating:t.overall_rating||t.avgOvr||Math.round((t.roster||[]).reduce((n,p)=>n+Number(p.ovr||0),0)/Math.max(1,(t.roster||[]).length))});
  app.get('/api/teams',(req,res)=>res.json(read('teams').value.map(t=>publicData(teamView(t)))));
  app.post('/api/teams',auth,admin,(req,res)=>{try{const t={...req.body,id:randomUUID(),roster:req.body.roster||[],manager:req.body.manager_name||req.body.manager||''};if(typeof t.name!=='string'||!t.name.trim())throw Error('Nome obrigatório.');db.prepare('INSERT INTO teams(id,name,badge_url) VALUES(?,?,?)').run(t.id,t.name,t.badge_url||'assets/default-shield.svg');try{put('teams',[...read('teams').value,t]);}catch(e){db.prepare('DELETE FROM teams WHERE id=?').run(t.id);throw e;}res.status(201).json(teamView(t));}catch(e){fail(res,e);}});
  app.delete('/api/teams/:id',auth,admin,(req,res)=>{if(db.prepare('SELECT id FROM users WHERE team_id=?').get(req.params.id))return res.status(409).json({message:'Desvincule o usuário antes de remover o clube.'});put('teams',read('teams').value.filter(t=>t.id!==req.params.id));db.prepare('DELETE FROM teams WHERE id=?').run(req.params.id);res.sendStatus(204);});
  app.get('/api/teams/:id',(req,res)=>{const t=read('teams').value.find(t=>t.id===req.params.id);t?res.json(publicData(teamView(t))):res.sendStatus(404);});
  app.put('/api/teams/:id',auth,security.require_team_owner,(req,res)=>{try{const old=read('teams');const team=old.value.find(t=>t.id===req.params.id);if(!team)return res.sendStatus(404);const body={...req.body};if(req.user.role!=='admin'&&((body.id!==undefined&&body.id!==req.params.id)||(body.team_id!==undefined&&body.team_id!==req.user.team_id)))return security.deny(req,res,undefined,'spoofed_team');if(body.manager_name!==undefined){body.manager=body.manager_name;delete body.manager_name;}const value=old.value.map(t=>t.id===team.id?{...t,...body,id:t.id}:t);validate('teams',value,req.user);res.json(put('teams',value,old.revision).value.find(t=>t.id===team.id));}catch(e){fail(res,e);}});
  app.get('/api/schedules/options',(req,res)=>res.json(read('schedule_options').value));
  app.post('/api/schedules/options',auth,admin,(req,res)=>{const item={...req.body,id:randomUUID()};if(!/^\d{4}-\d{2}-\d{2}$/.test(item.date)||!item.venue)return res.status(400).json({message:'Informe data e local.'});put('schedule_options',[...read('schedule_options').value,item]);res.status(201).json(item);});
  app.put('/api/schedules/options/:id',auth,admin,(req,res)=>{const value=read('schedule_options').value;if(!value.some(o=>o.id===req.params.id))return res.sendStatus(404);const item={...req.body,id:req.params.id};put('schedule_options',value.map(o=>o.id===item.id?item:o));res.json(item);});
  app.delete('/api/schedules/options/:id',auth,admin,(req,res)=>{put('schedule_options',read('schedule_options').value.filter(o=>o.id!==req.params.id));res.sendStatus(204);});
  app.get('/api/schedules',(req,res)=>res.json(votes()));
  app.post('/api/schedules/vote',auth,(req,res)=>{try{if((req.body.user_id!==undefined&&req.body.user_id!==req.user.id)||(req.body.team_id!==undefined&&req.body.team_id!==req.user.team_id))security.audit(req,'spoofed_vote_identity_ignored');const entries=req.body.entries||[req.body];if(!Array.isArray(entries)||entries.length>366)throw Error('Votos inválidos.');
    for(const e of entries)if(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||Number.isNaN(Date.parse(e.date))||!Array.isArray(e.periods)||!e.periods.length||new Set(e.periods).size!==e.periods.length||e.periods.some(p=>!['manha','tarde','noite'].includes(p)))throw Error('Data ou períodos inválidos.');
    db.exec('BEGIN IMMEDIATE');try{if(req.body.fromDate)db.prepare('DELETE FROM schedules WHERE user_id=? AND date>=?').run(req.user.id,req.body.fromDate);
      for(const e of entries)db.prepare('INSERT INTO schedules(id,user_id,date,periods,venue,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET periods=excluded.periods,venue=excluded.venue').run(randomUUID(),req.user.id,e.date,JSON.stringify(e.periods),String(e.venue||'').slice(0,200),new Date().toISOString());db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}publish();res.json(votes());}catch(e){fail(res,e);}});
  app.delete('/api/schedules/:id',auth,(req,res)=>{const s=db.prepare('SELECT * FROM schedules WHERE id=?').get(req.params.id);if(!s)return res.sendStatus(404);if(s.user_id!==req.user.id&&req.user.role!=='admin')return security.deny(req,res);const periods=JSON.parse(s.periods).filter(p=>p!==req.query.period);if(req.query.period&&periods.length)db.prepare('UPDATE schedules SET periods=? WHERE id=?').run(JSON.stringify(periods),s.id);else db.prepare('DELETE FROM schedules WHERE id=?').run(s.id);publish();res.sendStatus(204);});

  app.get('/api/transfers',(req,res)=>res.json(publicData({transfers:read('transfers').value,limits:read('limits').value})));
  app.get('/api/proposals',auth,(req,res)=>res.json(publicData(read('proposals').value.filter(p=>req.user.role==='admin'||p.from_user_id===req.user.id||p.to_team_id===req.user.team_id))));
  const prepareLimit=require('express-rate-limit').rateLimit({windowMs:60000,limit:10,keyGenerator:req=>req.user.id,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'RATE_LIMITED',message:'Aguarde um minuto antes de enviar novas propostas.'}});
  function prepare(req,legacy=false){
    const body=legacy?{target_team_id:req.body.to_team_id,player_wanted:req.body.requested,player_offered:req.body.offered,cash_amount:req.body.cash_amount,type:req.body.type}:req.body;
    if((req.body.from_team_id!==undefined&&req.body.from_team_id!==req.user.team_id)||(req.body.from_user_id!==undefined&&req.body.from_user_id!==req.user.id))security.audit(req,'spoofed_proposal_identity_ignored');
    const contact=db.prepare('SELECT name,phone FROM users WHERE team_id=?').get(String(body.target_team_id||''));
    return prepareProposal({user:req.user,body,contact,teams:read('teams').value,limits:read('limits').value,transfers:read('transfers').value,baseUrl:process.env.PUBLIC_BASE_URL||'http://localhost:3000'});
  }
  app.post('/api/transfers/prepare-proposal',auth,prepareLimit,(req,res)=>{try{const result=prepare(req);put('proposals',[result.proposal,...read('proposals').value]);res.json({whatsapp_url:result.whatsapp_url});}catch(e){res.status(e.status||400).json({error:e.error||'INVALID_PROPOSAL',message:e.message});}});
  // Compatibility route uses the same checks; contact URL is returned only on this authenticated action.
  app.post('/api/transfers/propose',auth,prepareLimit,(req,res)=>{try{const result=prepare(req,true);put('proposals',[result.proposal,...read('proposals').value]);res.status(201).json({...result.proposal,waUrl:result.whatsapp_url});}catch(e){res.status(e.status||400).json({error:e.error||'INVALID_PROPOSAL',message:e.message});}});
  app.patch('/api/proposals/:id',auth,(req,res)=>{const rows=read('proposals').value,p=rows.find(p=>p.id===req.params.id);if(!p)return res.sendStatus(404);if(p.status!=='Pendente')return res.status(409).json({message:'Proposta já encerrada.'});const status=req.body.status;if(!(req.user.role==='admin'||status==='Cancelada'&&p.from_user_id===req.user.id||status==='Recusada'&&p.to_team_id===req.user.team_id)||!['Cancelada','Recusada'].includes(status))return security.deny(req,res);p.status=status;put('proposals',rows);res.json(publicData(p));});
  app.delete('/api/proposals/:id',auth,admin,(req,res)=>{put('proposals',read('proposals').value.filter(p=>p.id!==req.params.id));res.sendStatus(204);});
  app.post('/api/transfers/confirm',auth,admin,(req,res)=>{try{const value=read('transfers').value,t={...req.body,id:randomUUID(),createdAt:new Date().toISOString(),status:'Confirmada'};if(!t.teamA||!t.teamB||t.teamA===t.teamB||!Array.isArray(t.assetsA)||!Array.isArray(t.assetsB))throw Error('Negociação inválida.');
    for(const name of [t.teamA,t.teamB]){const limit=read('limits').value.find(c=>c.name===name);if(!limit||value.filter(r=>r.teamA===name||r.teamB===name).length>=limit.maxTrades)throw Error('Limite de negociações atingido.');}
    const teams=read('teams').value,a=teams.find(c=>c.name===t.teamA),b=teams.find(c=>c.name===t.teamB);
    if(!a||!b)throw Error('Clube desconhecido.');
    const take=(club,names)=>names.filter(n=>!/^pick\b/i.test(n)).map(n=>{const p=club.roster.find(p=>p.name===n);if(!p)throw Error('Atleta não pertence ao clube: '+n);return p;});
    const outA=take(a,t.assetsA),outB=take(b,t.assetsB);
    if(new Set(t.assetsA).size!==t.assetsA.length||new Set(t.assetsB).size!==t.assetsB.length)throw Error('Atleta duplicado.');
    a.roster=[...a.roster.filter(p=>!outA.some(o=>o.id===p.id)),...outB];b.roster=[...b.roster.filter(p=>!outB.some(o=>o.id===p.id)),...outA];
    for(const club of [a,b]){if(club.roster.length>16)throw Error('A troca excede o limite de 16 atletas.');club.starterIds=(club.starterIds||[]).filter(id=>club.roster.some(p=>p.id===id));}
    db.exec('BEGIN IMMEDIATE');transaction=true;
    try{put('teams',teams);put('transfers',[t,...value]);if(t.proposal_id){const proposals=read('proposals').value,p=proposals.find(p=>p.id===t.proposal_id);if(!p||p.status!=='Pendente')throw Error('Proposta inválida.');if(p.fromClub!==t.teamA||p.toClub!==t.teamB||JSON.stringify(p.offered)!==JSON.stringify(t.assetsA)||JSON.stringify(p.requested)!==JSON.stringify(t.assetsB))throw Error('A troca diverge da proposta.');p.status='Confirmada';put('proposals',proposals);}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}finally{transaction=false;}publish();res.status(201).json(t);}catch(e){fail(res,e);}});
  for(const [route,key] of [['news','news'],['tournaments','history'],['titles','finals'],['records','records']]){
    app.get('/api/'+route,(req,res)=>res.json(publicData(route==='tournaments'?{editions:read(key).value,titles:read('finals').value,records:read('records').value,active:read('active').value}:read(key).value)));
    app.post('/api/'+route,auth,admin,(req,res)=>{if(route==='news'&&(!req.body.title||!req.body.body))return res.status(400).json({message:'Informe título e corpo.'});const item={...req.body,id:randomUUID(),published_at:new Date().toISOString()};const next=[item,...read(key).value];try{validate(key,next,req.user);put(key,next);res.status(201).json(item);}catch(e){fail(res,e);}});
    app.put('/api/'+route+'/:id',auth,admin,(req,res)=>{const old=read(key);if(!old.value.some(i=>i.id===req.params.id))return res.sendStatus(404);const item={...req.body,id:req.params.id};put(key,old.value.map(i=>i.id===item.id?item:i),old.revision);res.json(item);});
    app.delete('/api/'+route+'/:id',auth,admin,(req,res)=>{put(key,read(key).value.filter(i=>i.id!==req.params.id));res.sendStatus(204);});
  }
};
