const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../server/app.cjs');
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path');
test('Default moderation reserves clubs, restricts pending sessions, approves/rejects; invites rotate and consume atomically',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'admission-test-secret-'.repeat(3),securityLogger(){}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();db.close();});
 const base='http://127.0.0.1:'+server.address().port;
 async function call(url,method='GET',body,token){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:r.status===204?null:await r.json()};}
 const payload=(n,team='sq'+n)=>({name:'Técnico '+n,email:n+'@example.com',phone:'119111111'+String(n).padStart(2,'0'),password:'uma-senha-segura',team_id:team,status:'active',is_approved:true,role:'admin'});
 const root=(await call('/api/auth/register','POST',payload(1))).data;
 assert.equal(root.user.status,'pending_approval');assert.equal(root.user.role,'player');assert.equal(root.user.is_approved,false);
 // First administrator is a trusted server-side operation, never a registration payload.
 db.prepare("UPDATE users SET role='admin',status='active' WHERE id=?").run(root.user.id);
 const pending=(await call('/api/auth/register','POST',payload(2))).data;
 assert.equal((await call('/api/auth/login','POST',{identifier:'2@example.com',password:'uma-senha-segura'})).data.user.status,'pending_approval');
 assert.equal((await call('/api/auth/me','GET',undefined,pending.access_token)).status,200);
 assert.ok(!(await call('/api/teams/available')).data.some(t=>t.id==='sq2'));
 for(const [url,method] of [['/api/schedules/vote','POST'],['/api/teams/sq2','PUT'],['/api/transfers/prepare-proposal','POST'],['/api/transfers/propose','POST'],['/api/admin/pending-registrations','GET']]){
   const result=await call(url,method,method==='GET'?undefined:{},pending.access_token);assert.equal(result.status,403,url);assert.match(result.data.message,/em análise/);
 }
 assert.equal((await call('/api/admin/pending-registrations','GET',undefined,root.access_token)).data.length,1);
 assert.equal((await call('/api/admin/registrations/'+pending.user.id+'/approve','PATCH',{},root.access_token)).data.user.status,'active');
 assert.equal((await call('/api/teams/sq2','PUT',{formation:'4-4-2'},pending.access_token)).status,200);
 assert.equal((await call('/api/admin/admission-settings','PUT',{mode:'invite'},pending.access_token)).status,403);
 const reject=(await call('/api/auth/register','POST',payload(3))).data;
 assert.equal((await call('/api/admin/registrations/'+reject.user.id+'/reject','PATCH',{},root.access_token)).status,200);
 assert.ok((await call('/api/teams/available')).data.some(t=>t.id==='sq3'));
 assert.equal((await call('/api/auth/me','GET',undefined,reject.access_token)).status,401);
 assert.equal((await call('/api/admin/registrations/'+pending.user.id+'/reject','PATCH',{},root.access_token)).status,409);
 assert.equal((await call('/api/admin/admission-settings','PUT',{mode:'invite'},root.access_token)).status,200);
 assert.equal((await call('/api/auth/registration-policy')).data.mode,'invite');
 const invalid=await call('/api/auth/register','POST',payload(4));assert.equal(invalid.status,403);assert.equal(invalid.data.message,'Código de acesso inválido para esta equipe');
 const first=(await call('/api/admin/invites/sq4','POST',{},root.access_token)).data;
 const second=(await call('/api/admin/invites/sq4','POST',{},root.access_token)).data;
 assert.notEqual(first.code,second.code);assert.ok(!JSON.stringify(db.prepare('SELECT * FROM team_invites').all()).includes(second.code));
 assert.ok((await call('/api/admin/invites','GET',undefined,root.access_token)).data.every(row=>row.code===undefined&&row.code_hash===undefined));
 assert.equal((await call('/api/auth/register','POST',{...payload(4),invite_code:first.code})).status,403);
 assert.equal((await call('/api/auth/register','POST',{...payload(5),invite_code:second.code})).status,403);
 const results=await Promise.all([call('/api/auth/register','POST',{...payload(4),invite_code:second.code}),call('/api/auth/register','POST',{...payload(6,'sq4'),invite_code:second.code})]);
 assert.equal(results.filter(r=>r.status===201).length,1);assert.equal(results.find(r=>r.status===201).data.user.status,'active');assert.ok(db.prepare("SELECT used_at FROM team_invites WHERE team_id='sq4'").get().used_at);
 const rollback=(await call('/api/admin/invites/sq5','POST',{},root.access_token)).data;
 assert.equal((await call('/api/auth/register','POST',{...payload(1,'sq5'),invite_code:rollback.code})).status,409);
 assert.equal(db.prepare("SELECT used_at FROM team_invites WHERE team_id='sq5'").get().used_at,null);
 db.prepare("UPDATE team_invites SET expires_at='2000-01-01' WHERE team_id='sq5'").run();
 assert.equal((await call('/api/auth/register','POST',{...payload(5),invite_code:rollback.code})).status,403);
 assert.equal((await fetch(base+'/cadastro?team=sq5&code=ABC')).status,200);
});

test('Pending frontend shows banner, admin panel lists requests, invitation link preselects registration',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'admission-ui-secret-'.repeat(3),securityLogger(){}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 const reg=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Novo Técnico',email:'novo@example.com',phone:'11999999999',password:'senha-segura-123',team_id:'sq1'})});const session=await reg.json();
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:base,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 w.AbortSignal=AbortSignal;w.fetch=(url,opts)=>fetch(new URL(url,base),opts);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));await w.GBLShared.ready();w.eval([...w.document.querySelectorAll('script[data-module]')].map(s=>fs.readFileSync(path.join(__dirname,'..',s.dataset.module),'utf8')).join('\n;\n')+'\nwindow.rbac=RBAC;');w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 await w.rbac.accept(session);assert.equal(w.document.getElementById('pendingApprovalBanner').hidden,false);assert.equal(w.rbac.requireMember(),false);
 await w.GBLShared.refresh();assert.equal(w.document.getElementById('sharedStatus').hidden,true);
 db.prepare("UPDATE users SET status='active',role='admin' WHERE id=?").run(session.user.id);await w.GBLShared.refresh();assert.equal(w.document.getElementById('pendingApprovalBanner').hidden,true);
 await w.rbac.restore();await w.GBLAdmission.refresh();assert.ok(w.document.getElementById('teamInvites').textContent.includes('Joker FC'));
 w.history.replaceState(null,'','/cadastro?team=sq2&code=EXAMPLE');w.document.getElementById('secureRegisterTab').click();
 for(let i=0;i<100&&w.document.getElementById('secureAvailableTeams').disabled;i++)await new Promise(r=>setTimeout(r,10));
 assert.equal(w.document.getElementById('secureAvailableTeams').value,'sq2');assert.equal(w.document.getElementById('inviteCodeInput').value,'EXAMPLE');
});
