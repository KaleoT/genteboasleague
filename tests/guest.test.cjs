const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path');
function boot(t,guest=false){
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:'http://localhost:3000',runScripts:'outside-only',pretendToBeVisual:true});
 t.after(()=>dom.window.close());
 const w=dom.window,calls=[];
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.AbortSignal=AbortSignal;w.fetch=async(url,options)=>{calls.push({url,options});if(url==='/api/state')return Response.json(Object.fromEntries(Object.entries(require('../server/shared-seed.json')).map(([k,value])=>[k,{value,revision:1}])));if(url==='/api/contacts'||url==='/api/proposals')return Response.json([]);return new Response(null,{status:204});};
 if(guest)w.sessionStorage.setItem('gbl.guest.v1','1');
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));
 const seed=require('../server/shared-seed.json');for(const [key,value] of Object.entries(seed))w.GBLShared.hydrate(key,value);
 const scripts=[...w.document.querySelectorAll('script[data-module]')].map(el=>fs.readFileSync(path.join(__dirname,'..',el.dataset.module),'utf8'));
 w.eval(scripts.join('\n;\n')+'\nwindow.rbac=RBAC;');
 return {w,calls,click:id=>w.document.getElementById(id).click()};
}
test('Guest enters without API writes, navigates public pages and cannot participate',async t=>{
 const {w,calls,click}=boot(t);await new Promise(r=>setTimeout(r,20));
 click('secureGuestBtn');
 assert.equal(w.rbac.getCurrentUser().role,'guest');assert.equal(w.rbac.getCurrentUser().team_id,null);
 assert.equal(w.rbac.isIdentified(),false);assert.equal(w.rbac.isAdmin(),false);
 assert.equal(w.location.hash,'#inicio');assert.equal(w.document.getElementById('secureAuthModal').hidden,true);
 assert.equal(w.document.getElementById('authHeaderRole').textContent,'Modo Visitante');
 assert.match(w.document.getElementById('resetProfileBtn').textContent,/Fazer Login/);
 const before=w.localStorage.getItem('gbl.reservations.v1');
 for(const id of ['confirmBtn','editVotesBtn','openProposalModalBtn']){
  click(id);assert.match(w.document.getElementById('toast').textContent,/Crie uma conta e vincule seu time/);
 }
 assert.equal(w.localStorage.getItem('gbl.reservations.v1'),before);
 assert.equal(w.document.getElementById('proposalModal').hidden,true);
 for(const tab of ['inicio','campeonatos','elencos','titulos','transferencias','ranking']){
  w.location.hash=tab;await new Promise(r=>setTimeout(r,10));
  assert.equal(w.document.querySelector('[data-tab="'+tab+'"]').hidden,false,tab);
 }
 w.location.hash='admin';await new Promise(r=>setTimeout(r,10));
 assert.equal(w.location.hash,'#inicio');assert.equal(w.document.getElementById('openAdminPanelBtn').hidden,true);
 assert.equal(calls.some(c=>c.options?.method && c.options.method!=='GET'),false);
 assert.equal(w.localStorage.getItem('gbl.accessToken.v1'),null);
 click('resetProfileBtn');assert.equal(w.document.getElementById('secureAuthModal').hidden,false);
 click('secureAuthClose');assert.equal(w.document.getElementById('secureAuthModal').hidden,true);
 await w.rbac.accept({access_token:'test-token',user:{id:'real',name:'Jogador',role:'player',team_id:'sq1'}});
 assert.equal(w.rbac.isGuest(),false);assert.equal(w.sessionStorage.getItem('gbl.guest.v1'),null);
 assert.equal(w.document.getElementById('resetProfileBtn').textContent,'Sair');
});
test('Guest session survives reload and registration also offers guest access',async t=>{
 const {w,click}=boot(t,true);await new Promise(r=>setTimeout(r,20));
 assert.equal(w.rbac.isGuest(),true);assert.equal(w.document.getElementById('secureAuthModal').hidden,true);
 click('resetProfileBtn');click('secureRegisterTab');
 assert.equal(w.document.getElementById('secureGuestBtn').hidden,false);
 click('secureGuestBtn');assert.equal(w.document.getElementById('secureAuthModal').hidden,true);
});
