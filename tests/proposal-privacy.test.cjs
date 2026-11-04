const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const {createApp}=require('./approved-fixture.cjs');
test('Proposal contact is disclosed only by an authenticated, validated action; UI loads and handles errors',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'privacy-test-secret-'.repeat(3),securityLogger(){}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();db.close();});
 const base='http://127.0.0.1:'+server.address().port;
 async function call(route,body,token){const r=await fetch(base+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};}
 const register=async(n,phone)=>(await call('/api/auth/register',{name:'Técnico '+n,email:n+'@private.example',phone,password:'uma-senha-segura',team_id:'sq'+n})).data;
 const sender=await register(1,'11912345678'),target=await register(2,'35987654321');
 const teams=(await call('/api/teams')).data;
 const payload={target_team_id:'sq2',player_wanted:teams[1].roster[0].id,player_offered:teams[0].roster[0].id,cash_amount:150.50,from_team_id:'sq3',from_user_id:'intruso'};
 assert.equal((await call('/api/transfers/prepare-proposal',payload)).status,401);
 const prepared=await call('/api/transfers/prepare-proposal',payload,sender.access_token);
 assert.equal(prepared.status,200);assert.deepEqual(Object.keys(prepared.data),['whatsapp_url']);
 const link=new URL(prepared.data.whatsapp_url);assert.equal(link.origin,'https://wa.me');assert.equal(link.pathname,'/5535987654321');
 const message=link.searchParams.get('text');assert.match(message,/GENTE BOA'S LEAGUE/);assert.match(message,/Olá, técnico do \*Al Kabib\*/);assert.ok(message.includes(teams[0].roster[0].name));assert.match(message,/150,50/);assert.ok(message.includes('?team=sq1#elencos'));assert.ok(!message.includes('11912345678'));
 const saved=(await call('/api/proposals',undefined,sender.access_token)).data[0];assert.equal(saved.from_user_id,sender.user.id);assert.equal(saved.from_team_id,'sq1');assert.equal(saved.waUrl,undefined);
 for(const route of ['/api/state','/api/teams','/api/teams/sq2','/api/teams/available','/api/transfers','/api/news','/api/tournaments']){
   const json=JSON.stringify((await call(route)).data);assert.ok(!json.includes('35987654321'),route);assert.ok(!json.includes('private.example'),route);
 }
 const contacts=await fetch(base+'/api/contacts',{headers:{Authorization:'Bearer '+sender.access_token}});assert.equal(contacts.status,404);
 assert.equal((await call('/api/transfers/prepare-proposal',{...payload,target_team_id:'sq3'},sender.access_token)).data.error,'WHATSAPP_UNAVAILABLE');
 assert.equal((await call('/api/transfers/prepare-proposal',{...payload,player_offered:teams[1].roster[0].id},sender.access_token)).status,400);
 assert.equal((await call('/api/transfers/prepare-proposal',{...payload,cash_amount:-1},sender.access_token)).status,400);
 const limits=db.prepare("SELECT payload FROM shared_collections WHERE name='limits'").get().payload;
 db.prepare("UPDATE shared_collections SET payload=? WHERE name='limits'").run(JSON.stringify(JSON.parse(limits).map(l=>l.name===teams[0].name?{...l,maxTrades:0}:l)));
 assert.equal((await call('/api/transfers/prepare-proposal',payload,sender.access_token)).data.error,'TRADE_LIMIT_REACHED');
 db.prepare("UPDATE shared_collections SET payload=? WHERE name='limits'").run(limits);
 // Real frontend, no directory of opposing contacts loaded.
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:base,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());
 const w=dom.window,requests=[],opened=[];w.AbortSignal=AbortSignal;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.open=(url)=>{opened.push(url);return null;};
 let release;w.fetch=async(url,opts)=>{requests.push(url);if(url==='/api/transfers/prepare-proposal')await new Promise(r=>release=r);return fetch(new URL(url,base),opts);};
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));await w.GBLShared.ready();
 w.eval([...w.document.querySelectorAll('script[data-module]')].map(el=>fs.readFileSync(path.join(__dirname,'..',el.dataset.module),'utf8')).join('\n;\n')+'\nwindow.testRBAC=RBAC;');w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const button=w.document.getElementById('sendProposalWhatsapp');assert.equal(button.disabled,true);
 await w.testRBAC.accept(sender);w.document.getElementById('openProposalModalBtn').click();
 const select=w.document.getElementById('propTargetTeamSelect');select.value='sq2';select.dispatchEvent(new w.Event('change'));
 w.document.querySelector('[data-offer-player]').click();w.document.querySelector('[data-request-player]').click();
 assert.equal(button.disabled,false);assert.ok(!w.document.getElementById('propTargetManagerInfo').textContent.includes('35987654321'));
 const submit=()=>w.document.getElementById('proposalForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 submit();assert.equal(button.disabled,true);assert.equal(button.getAttribute('aria-busy'),'true');release();
 for(let i=0;i<200&&button.getAttribute('aria-busy');i++)await new Promise(r=>setTimeout(r,10));
 assert.equal(opened.length,1);assert.match(opened[0],/^https:\/\/wa.me\/5535987654321\?/);assert.ok(w.document.querySelector('#whatsappProposalResult a'));assert.ok(!requests.includes('/api/contacts'));
 db.prepare('UPDATE users SET phone=? WHERE id=?').run('0000000000',target.user.id);
 w.document.getElementById('openProposalModalBtn').click();select.value='sq2';select.dispatchEvent(new w.Event('change'));w.document.querySelector('[data-offer-player]').click();w.document.querySelector('[data-request-player]').click();submit();release();
 for(let i=0;i<200&&button.getAttribute('aria-busy');i++)await new Promise(r=>setTimeout(r,10));
 assert.equal(opened.length,1);assert.match(w.document.getElementById('toast').textContent,/O técnico adversário ainda não configurou um contato de WhatsApp válido/);assert.equal(button.disabled,false);
});
