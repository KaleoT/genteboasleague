const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole,requestInterceptor}=require('jsdom');
const {createApp}=require('../server/app.cjs');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

test('file:// explains the missing API, hides inactive controls and rescues legacy data without network',async t=>{
 const dom=new JSDOM(read('index.html'),{url:'file:///project/index.html#transferencias',runScripts:'outside-only'});t.after(()=>dom.window.close());const w=dom.window,store=new Map(),downloads=[];
 Object.defineProperty(w,'localStorage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)}});
 for(const [key,value] of Object.entries(require('../server/shared-seed.json'))){const map=require('../js/backup-format.js').keys;if(map[key])store.set(map[key],JSON.stringify(value));}
 const before=JSON.stringify([...store]);w.fetch=()=>{throw Error('File mode must never fetch the API');};w.URL.createObjectURL=()=> 'blob:backup';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
 w.eval(read('js/backup-format.js'));w.eval(read('js/shared.js'));w.eval(read('js/bootstrap.js'));
 assert.ok(w.document.getElementById('startupFailure').textContent.includes('INICIAR-LIGA.cmd'));assert.ok(w.document.body.classList.contains('app-unavailable'));assert.equal(w.document.getElementById('openAdminPanelBtn').hidden,true);
 assert.equal(w.document.querySelector('#startupFailure a').href,'http://localhost:3000/#transferencias');
 await w.document.querySelector('#startupFailure button').onclick();assert.equal(downloads.length,1);assert.match(downloads[0],/backup_gente_boas_league_resgate/);assert.equal(JSON.stringify([...store]),before);
});

test('API outage and static HTML server give a recoverable startup screen',async t=>{
 for(const fetch of [async()=>{throw Error('Network unavailable');},async()=>new Response('<html>Static server</html>',{headers:{'Content-Type':'text/html'}})]){
   const dom=new JSDOM(read('index.html'),{url:'http://localhost:3000',runScripts:'outside-only',virtualConsole:new VirtualConsole()});t.after(()=>dom.window.close());const w=dom.window;w.AbortSignal=AbortSignal;w.fetch=fetch;
   w.eval(read('js/shared.js'));w.eval(read('js/bootstrap.js'));
   for(let i=0;i<50&&!w.document.getElementById('startupFailure');i++)await new Promise(r=>setTimeout(r,5));
   assert.ok(w.document.getElementById('startupFailure'));assert.equal(w.GBLReady,undefined);assert.equal(w.document.querySelector('#startupFailure button').textContent,'Tentar novamente');
 }
});

test('A failing UI module is reported instead of silently continuing with broken controls',async t=>{
 const {app,db}=createApp({database:':memory:',secret:'startup-test-secret-'.repeat(3)});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 const health=await fetch(base+'/api/health');assert.equal(health.status,200);assert.deepEqual(await health.json(),{app:'gbl-league',status:'ok'});
 const dom=await JSDOM.fromURL(base,{runScripts:'dangerously',resources:{interceptors:[requestInterceptor(req=>req.url===base+'/js/kits.js'?new Response('throw new Error("Test module failure");',{headers:{'Content-Type':'application/javascript'}}):req.url.startsWith(base)?undefined:new Response('',{headers:{'Content-Type':'text/css'}}))]},virtualConsole:new VirtualConsole(),beforeParse(w){w.AbortSignal=AbortSignal;w.fetch=(url,opts)=>fetch(new URL(url,base),opts);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});}});t.after(()=>dom.window.close());
 for(let i=0;i<200&&!dom.window.document.getElementById('startupFailure');i++)await new Promise(r=>setTimeout(r,10));
 assert.ok(dom.window.document.getElementById('startupFailure'));assert.equal(dom.window.GBLReady,undefined);
});

test('Local setup preserves an existing secret across restarts',t=>{
 const root=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'gbl-startup-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.writeFileSync(path.join(root,'.env.example'),'JWT_SECRET=replace-with-a-random-secret-of-at-least-32-bytes\n');
 const {setup}=require('../server/setup-local.cjs');setup(root);const initial=fs.readFileSync(path.join(root,'.env'),'utf8');assert.ok(!initial.includes('replace-'));setup(root);assert.equal(fs.readFileSync(path.join(root,'.env'),'utf8'),initial);
});
