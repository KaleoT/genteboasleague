const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('./approved-fixture.cjs');
const format=require('../js/backup-format.js');
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path');

test('Backup migration is admin-only, preserves accounts and rolls back every table on late failure',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'backup-test-secret-'.repeat(3),securityLogger(){}});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 async function call(url,body,token){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
 async function register(n){return (await call('/api/auth/register',{name:'Técnico '+n,email:n+'@example.com',phone:'1191111111'+n,password:'senha-segura-123',team_id:'sq'+n})).data;}
 const admin=await register(1),player=await register(2);db.prepare("UPDATE users SET role='admin' WHERE id=?").run(admin.user.id);
 const original=(await call('/api/admin/export-backup',null,admin.access_token)).data;format.validate(original);
 assert.equal((await call('/api/admin/migrate-backup',original)).status,401);assert.equal((await call('/api/admin/migrate-backup',original,player.access_token)).status,403);
 assert.equal((await call('/api/admin/export-backup',null,player.access_token)).status,403);
 const malformed=structuredClone(original);delete malformed.rosters;assert.equal((await call('/api/admin/migrate-backup',malformed,admin.access_token)).status,400);
 const omitted=structuredClone(original);omitted.teams=omitted.teams.filter(t=>t.id!=='sq2');omitted.rosters=omitted.rosters.filter(t=>t.team_id!=='sq2');omitted.rankings.historico=[];omitted.rankings.temporada2026=[];
 assert.equal((await call('/api/admin/migrate-backup',omitted,admin.access_token)).status,400);
 const imported=structuredClone(original);imported.teams[0].manager='Treinador Resgatado';imported.teams[0].kit_home_3d_url='https://example.com/kit.png';imported.teams.push({id:'sq18',name:'Novo Clube',stars:4});imported.rosters.push({team_id:'sq18',players:[],starterIds:[]});
 imported.news=[{id:'rescued-news',title:'Notícia resgatada',body:'Conteúdo preservado',category:'Liga'}];
 imported.schedules.votes=[{id:'legacy-vote',name:'Pessoa antiga',date:'2026-12-10',periods:['noite'],createdAt:'2026-11-01T00:00:00Z'},{id:'real-vote',user_id:player.user.id,team_id:'sq2',name:player.user.name,date:'2026-12-11',periods:['tarde']}];
 const users=db.prepare('SELECT * FROM users ORDER BY id').all();const result=await call('/api/admin/migrate-backup',imported,admin.access_token);assert.equal(result.status,200);assert.equal(result.data.counts.teams,18);assert.equal(result.data.counts.news,1);
 assert.deepEqual(db.prepare('SELECT * FROM users ORDER BY id').all(),users);assert.equal(db.prepare("SELECT manager_name FROM teams WHERE id='sq1'").get().manager_name,'Treinador Resgatado');
 assert.equal(db.prepare('SELECT count(*) n FROM legacy_schedule_votes').get().n,1);assert.equal(db.prepare('SELECT count(*) n FROM schedules').get().n,1);
 const restored=(await call('/api/admin/backups/'+result.data.restore_point_id,null,admin.access_token)).data;assert.deepEqual(restored.teams,original.teams);
 const snapshot=()=>Object.fromEntries(['shared_collections','teams','rosters','tactics','schedules','legacy_schedule_votes','news','migration_backups'].map(table=>[table,db.prepare('SELECT * FROM '+table).all()]));
 const before=snapshot(),broken=structuredClone(imported);broken.teams[0].name='Não pode persistir';broken.news[0].title='Também não pode persistir';broken.schedules.votes.push({...broken.schedules.votes[1],id:'duplicate-user-date'});
 assert.equal((await call('/api/admin/migrate-backup',broken,admin.access_token)).status,400);assert.deepEqual(snapshot(),before);
 const state=(await call('/api/schedules')).data;assert.equal(state.find(v=>v.id==='legacy-vote').user_id,null);assert.equal(state.find(v=>v.id==='legacy-vote').legacy,true);
 const current=(await call('/api/admin/export-backup',null,admin.access_token)).data;format.validate(current);assert.equal(current.teams.length,18);
 const unsafe=structuredClone(current);unsafe.teams[0].badge_url='javascript:alert(1)';assert.equal((await call('/api/admin/migrate-backup',unsafe,admin.access_token)).status,400);
});

test('Local backup export, corruption handling, browser restore and quota rollback never write the server',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'backup-ui-secret-'.repeat(3),securityLogger(){}}),server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 const registered=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Admin',email:'admin@example.com',phone:'11911111111',password:'senha-segura-123',team_id:'sq1'})});const session=await registered.json();db.prepare("UPDATE users SET role='admin' WHERE id=?").run(session.user.id);session.user.role='admin';
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:base,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window,calls=[],downloads=[];
 w.AbortSignal=AbortSignal;w.fetch=(url,opts)=>{calls.push({url,method:opts?.method});return fetch(new URL(url,base),opts);};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.URL.createObjectURL=()=> 'blob:backup';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));await w.GBLShared.ready();w.eval([...w.document.querySelectorAll('script[data-module]')].map(el=>fs.readFileSync(path.join(__dirname,'..',el.dataset.module),'utf8')).join('\n;\n')+'\nwindow.rbac=RBAC;');w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await w.rbac.accept(session);w.rbac.confirmDelete=async()=>true;
 const seed=require('../server/shared-seed.json');for(const [name,key] of Object.entries(format.keys))if(seed[name]!==undefined)w.localStorage.setItem(key,JSON.stringify(seed[name]));w.localStorage.setItem('gbl.users.v2',JSON.stringify([{password:'must-not-export'}]));
 const backup=w.GBLBackup.localPackage();assert.equal(backup.teams.length,17);assert.ok(!JSON.stringify(backup).includes('must-not-export'));assert.ok(!JSON.stringify(backup).includes(session.access_token));
 const $=id=>w.document.getElementById(id);$('exportLocalBackup').click();assert.match(downloads[0],/^backup_gente_boas_league_.*\.json$/);assert.equal($('toast').textContent,'Backup gerado e baixado com sucesso!');await new Promise(r=>setTimeout(r,10));
 await assert.rejects(w.GBLBackup.loadFile({name:'bad.json',size:1,text:async()=>'{broken'}),/corrompido/);assert.equal($('migrateServerBackup').disabled,true);
 backup.teams[0].name='Clube Resgatado';await w.GBLBackup.loadFile({name:'valid.json',size:10,text:async()=>JSON.stringify(backup)});
 const before=JSON.stringify(db.prepare('SELECT * FROM shared_collections ORDER BY name').all()),writes=calls.filter(c=>c.method&&c.method!=='GET').length;
 $('restoreLocalBackup').click();for(let i=0;i<100&&!w.GBLShared.isLocalPreview();i++)await new Promise(r=>setTimeout(r,10));
 assert.equal(w.GBLShared.isLocalPreview(),true);assert.equal(JSON.parse(w.GBLShared.getItem('gbl.squads.v2'))[0].name,'Clube Resgatado');assert.equal(JSON.parse(w.localStorage.getItem('gbl.squads.v2'))[0].name,'Clube Resgatado');assert.equal(w.localStorage.getItem('gbl.accessToken.v1'),session.access_token);
 assert.equal(calls.filter(c=>c.method&&c.method!=='GET').length,writes);assert.equal(JSON.stringify(db.prepare('SELECT * FROM shared_collections ORDER BY name').all()),before);
 await assert.rejects(w.rbac.request('/api/news',{method:'POST',body:'{}'}),/Restauração local/);await w.GBLShared.exitPreview();
 const storageBefore=Object.fromEntries(Object.values(format.keys).map(k=>[k,w.localStorage.getItem(k)]));const proto=Object.getPrototypeOf(w.localStorage),original=proto.setItem;let count=0;proto.setItem=function(k,v){if(++count===3)throw Error('quota');return original.call(this,k,v);};
 $('restoreLocalBackup').click();for(let i=0;i<100&&!$('backupStatus').textContent.includes('armazenamento');i++)await new Promise(r=>setTimeout(r,10));proto.setItem=original;
 assert.deepEqual(Object.fromEntries(Object.values(format.keys).map(k=>[k,w.localStorage.getItem(k)])),storageBefore);assert.equal(w.GBLShared.isLocalPreview(),false);
});
