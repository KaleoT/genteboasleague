const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const sharp=require('sharp');
const {JSDOM}=require('jsdom');
const {createApp}=require('./approved-fixture.cjs');
async function fixture(t){
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'gbl-uploads-'));
 const {app,db}=createApp({database:':memory:',secret:'uploads-test-secret-'.repeat(3),uploadDirectory:directory,securityLogger(){}}),server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();fs.rmSync(directory,{recursive:true,force:true});});
 const base='http://127.0.0.1:'+server.address().port;
 async function json(url,body,token,method='POST'){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:r.status===204?null:await r.json()};}
 async function register(n){return (await json('/api/auth/register',{name:'Técnico '+n,email:n+'@example.com',phone:'119111111'+String(n).padStart(2,'0'),password:'senha-segura-123',team_id:'sq'+n})).data;}
 async function upload(id,kind,buffer,type,token,side){const form=new FormData();form.append('file',new Blob([buffer],{type}),'../../unsafe-name.png');if(side!==undefined)form.append('kit_type',side);const r=await fetch(base+'/api/teams/'+id+'/upload-'+kind,{method:'POST',headers:token?{Authorization:'Bearer '+token}:{},body:form});return {status:r.status,data:await r.json()};}
 const image=await sharp({create:{width:1000,height:600,channels:4,background:{r:240,g:30,b:40,alpha:0}}}).png().toBuffer();
 return {directory,db,base,json,register,upload,image};
}
test('Uploads validate content, MIME, SVG, size and ownership; alpha, dimensions and lifecycle survive processing',async t=>{
 const {directory,db,base,json,register,upload,image}=await fixture(t);const user=await register(1),other=await register(2);
 assert.equal((await upload('sq1','badge',image,'image/png')).status,401);
 assert.equal((await upload('sq1','badge',image,'image/png',other.access_token)).status,403);
 assert.equal((await upload('sq1','badge',Buffer.from('<html>bad</html>'),'image/png',user.access_token)).status,400);
 assert.equal((await upload('sq1','badge',image,'image/jpeg',user.access_token)).status,400);
 assert.equal((await upload('sq1','badge',image,'text/plain',user.access_token)).status,415);
 assert.equal((await upload('sq1','badge',Buffer.alloc(5*1024*1024+1),'image/png',user.access_token)).status,413);
 for(const svg of ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>','<!DOCTYPE svg [<!ENTITY bad SYSTEM "file:///etc/passwd">]><svg>&bad;</svg>','<svg><image href="https://example.com/secret"/></svg>'])assert.equal((await upload('sq1','badge',Buffer.from(svg),'image/svg+xml',user.access_token)).status,400);
 const result=await upload('sq1','badge',image,'image/png',user.access_token);assert.equal(result.status,201);assert.match(result.data.url,/^\/uploads\/badges\/[a-f0-9-]{36}\.webp$/);
 const file=path.join(directory,result.data.url.slice('/uploads/'.length));assert.ok(fs.existsSync(file));const metadata=await sharp(fs.readFileSync(file)).metadata();assert.equal(metadata.width,512);assert.equal(metadata.hasAlpha,true);assert.equal(metadata.exif,undefined);
 const pixels=await sharp(fs.readFileSync(file)).raw().toBuffer();assert.equal(pixels[3],0);
 const response=await fetch(base+result.data.url);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/image\/webp/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');await response.arrayBuffer();
 const svg=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path fill="red" d="M0 0h50v50H0z"/></svg>');
 const replaced=await upload('sq1','badge',svg,'image/svg+xml',user.access_token);assert.equal(replaced.status,201);for(let i=0;i<100&&fs.existsSync(file);i++)await new Promise(r=>setTimeout(r,25));assert.ok(!fs.existsSync(file));assert.equal((await fetch(base+result.data.url)).status,404);
 assert.equal((await upload('sq1','kit',image,'image/png',user.access_token,'invalid')).status,400);
 const kit=await upload('sq1','kit',image,'image/png',user.access_token,'home');assert.equal(kit.status,201);const kitFile=path.join(directory,kit.data.url.slice('/uploads/'.length));assert.equal((await sharp(fs.readFileSync(kitFile)).metadata()).width,1000);assert.equal((await sharp(fs.readFileSync(kitFile)).metadata()).hasAlpha,true);
 assert.equal((await json('/api/teams/sq1',{kit_home_3d_url:'data:image/png;base64,AAAA'},user.access_token,'PUT')).status,400);
 assert.equal((await json('/api/teams/sq1/kit/home',undefined,user.access_token,'DELETE')).status,200);for(let i=0;i<100&&fs.existsSync(kitFile);i++)await new Promise(r=>setTimeout(r,25));assert.ok(!fs.existsSync(kitFile));
 const badgeFile=path.join(directory,replaced.data.url.slice('/uploads/'.length));const before=fs.readdirSync(path.join(directory,'badges')).sort();
 db.exec("CREATE TRIGGER reject_media BEFORE UPDATE OF badge_url ON teams BEGIN SELECT RAISE(ABORT,'test-failure'); END;");assert.equal((await upload('sq1','badge',image,'image/png',user.access_token)).status,400);db.exec('DROP TRIGGER reject_media');
 assert.deepEqual(fs.readdirSync(path.join(directory,'badges')).sort(),before);assert.ok(fs.existsSync(badgeFile));
 assert.equal((await json('/api/teams/sq2',{badge_url:replaced.data.url},other.access_token,'PUT')).status,200);
 assert.equal((await json('/api/teams/sq1/badge',undefined,user.access_token,'DELETE')).data.url,'assets/default-shield.svg');assert.ok(fs.existsSync(badgeFile),'Shared image remains while another club uses it');
 assert.equal((await json('/api/teams/sq2/badge',undefined,other.access_token,'DELETE')).status,200);assert.ok(!fs.existsSync(badgeFile));
 assert.equal(db.prepare('SELECT count(*) n FROM uploaded_assets').get().n,0);
 db.prepare("UPDATE users SET status='pending_approval' WHERE id=?").run(user.user.id);assert.equal((await upload('sq1','badge',image,'image/png',user.access_token)).status,403);
});

test('Owner drag-and-drop, progress and admin crest modal use multipart and publish public URLs without Base64',async t=>{
 const {base,db,register,image}=await fixture(t),session=await register(15);
 const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:base,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 w.AbortSignal=AbortSignal;w.fetch=(url,options)=>fetch(new URL(url,base),options);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.URL.createObjectURL=()=> 'blob:preview';w.URL.revokeObjectURL=()=>{};
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));await w.GBLShared.ready();w.eval([...w.document.querySelectorAll('script[data-module]')].map(el=>fs.readFileSync(path.join(__dirname,'..',el.dataset.module),'utf8')).join('\n;\n')+'\nwindow.rbac=RBAC;');w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await w.rbac.accept(session);
 const $=id=>w.document.getElementById(id);assert.equal($('teamMediaBtn').hidden,false);$('teamMediaBtn').click();assert.equal($('mediaTeamSelect').options.length,1);
 function drop(el){const e=new w.Event('drop',{bubbles:true,cancelable:true});Object.defineProperty(e,'dataTransfer',{value:{files:[new w.File([image],'badge.png',{type:'image/png'})]}});el.dispatchEvent(e);}
 drop($('mediaFile_badge').parentElement);assert.equal($('mediaPreview_badge').src,'blob:preview');const send=$('mediaFile_badge').parentElement.querySelector('button');send.click();assert.equal(send.disabled,true);
 for(let i=0;i<500&&send.disabled;i++)await new Promise(r=>setTimeout(r,10));assert.equal(send.disabled,false);assert.match($('mediaPreview_badge').getAttribute('src'),/^\/uploads\/badges/);
 const team=JSON.parse(w.GBLShared.getItem('gbl.squads.v2')).find(t=>t.id==='sq15');assert.match(team.badge_url,/^\/uploads/);assert.equal(db.prepare("SELECT badge_url FROM teams WHERE id='sq15'").get().badge_url,team.badge_url);assert.ok(w.document.querySelectorAll('img[src="'+team.badge_url+'"]').length>=2);
 assert.deepEqual(Object.keys(w.localStorage),['gbl.accessToken.v1']);
 $('closeTeamMedia').click();db.prepare("UPDATE users SET role='admin' WHERE id=?").run(session.user.id);await w.rbac.restore();w.GBLBadgeModal.open('sq16');drop(w.document.querySelector('.badge-upload-dropzone'));
 $('clubBadgeForm').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal($('saveClubBadgeBtn').disabled,true);for(let i=0;i<500&&!$('clubBadgeModal').hidden;i++)await new Promise(r=>setTimeout(r,10));assert.equal($('clubBadgeModal').hidden,true);
 assert.match(JSON.parse(w.GBLShared.getItem('gbl.squads.v2')).find(t=>t.id==='sq16').badge_url,/^\/uploads/);
});
