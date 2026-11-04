const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const bcrypt=require('bcryptjs');
const {createApp}=require('../server/app.cjs');
const {createEmailService,recoveryMessage}=require('../server/email.cjs');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');

test('Password reset tokens are hashed, expiring, single-use and invalidate sessions; change checks current password',async t=>{
 const messages=[],{app,db}=createApp({database:':memory:',secret:'password-test-secret-'.repeat(3),securityLogger(){},passwordResetMinutes:30,passwordResetRequestLimit:50,emailService:{async sendPasswordReset(message){messages.push(message);}}});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 async function call(route,body,token,method='POST'){const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:method==='GET'?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 let password='senha-inicial-123';const user=(await call('/api/auth/register',{name:'Técnico',email:'owner@example.com',phone:'11911111111',password,team_id:'sq1'})).data;
 const forgot=()=>call('/api/auth/forgot-password',{email:' OWNER@example.com '});
 async function issue(){const n=messages.length;const response=await forgot();assert.equal(response.status,200);for(let i=0;i<50&&messages.length===n;i++)await new Promise(r=>setTimeout(r,5));assert.equal(messages.length,n+1);return new URL(messages.at(-1).url).searchParams.get('token');}
 const unknown=await call('/api/auth/forgot-password',{email:'unknown@example.com'});assert.deepEqual((await forgot()).data,unknown.data);
 const token=await issue();assert.match(token,/^[a-f0-9]{64}$/);const row=db.prepare('SELECT * FROM password_reset_tokens WHERE token_hash=?').get(createHash('sha256').update(token).digest('hex'));
 assert.ok(row);assert.equal(row.used_at,null);assert.ok(Date.parse(row.expires_at)>Date.now()+29*60000);assert.ok(!JSON.stringify(db.prepare('SELECT * FROM password_reset_tokens').all()).includes(token));
 const fresh=await issue();assert.ok(db.prepare('SELECT used_at FROM password_reset_tokens WHERE id=?').get(row.id).used_at);
 const reset=(token,value='senha-nova-segura-456')=>call('/api/auth/reset-password',{token,new_password:value,confirm_password:value});
 assert.equal((await reset(token)).data.error,'INVALID_RESET_TOKEN');
 assert.equal((await call('/api/auth/reset-password',{token:fresh,new_password:'short',confirm_password:'short'})).status,400);
 assert.equal((await call('/api/auth/reset-password',{token:fresh,new_password:'senha-segura-456',confirm_password:'diferente'})).status,400);
 const simultaneous=await Promise.all([reset(fresh),reset(fresh)]);assert.equal(simultaneous.filter(r=>r.status===200).length,1);assert.equal((await reset(fresh)).data.error,'INVALID_RESET_TOKEN');
 assert.equal((await call('/api/auth/me',undefined,user.access_token,'GET')).status,401);
 assert.equal((await call('/api/auth/login',{identifier:'owner@example.com',password})).status,401);
 password='senha-nova-segura-456';const login=(await call('/api/auth/login',{identifier:'owner@example.com',password})).data;
 const expired=await issue();db.prepare("UPDATE password_reset_tokens SET expires_at='2000-01-01' WHERE used_at IS NULL").run();assert.equal((await reset(expired)).data.error,'INVALID_RESET_TOKEN');
 const outstanding=await issue();
 const change=(current,newPassword,confirm=newPassword)=>call('/api/auth/change-password',{current_password:current,new_password:newPassword,confirm_password:confirm},login.access_token,'PUT');
 assert.equal((await change('incorreta','senha-final-789')).status,400);assert.equal((await change(password,password)).status,400);assert.equal((await change(password,'senha-final-789','outra')).status,400);
 // Pending technicians may manage their own password without gaining access to club actions.
 assert.equal((await change(password,'senha-final-789')).status,200);
 assert.equal((await call('/api/auth/me',undefined,login.access_token,'GET')).status,401);assert.equal((await reset(outstanding)).data.error,'INVALID_RESET_TOKEN');
 assert.ok(await bcrypt.compare('senha-final-789',db.prepare('SELECT hashed_password FROM users WHERE id=?').get(user.user.id).hashed_password));
 const page=await fetch(base+'/redefinir-senha?token='+fresh);assert.equal(page.status,200);assert.equal(page.headers.get('referrer-policy'),'no-referrer');assert.equal(page.headers.get('cache-control'),'no-store');
});

test('Email adapter provides navy HTML and explicit log fallback without HTTP token disclosure',async()=>{
 const entries=[],service=createEmailService({EMAIL_DRIVER:'log'},entry=>entries.push(entry));
 await service.sendPasswordReset({to:'test@example.com',url:'https://league.example/redefinir-senha?token=example',minutes:15,expires_at:'later'});assert.equal(entries[0].event,'password_reset_debug');assert.match(entries[0].reset_url,/token=example/);
 const message=recoveryMessage({url:'https://league.example/?a=1&b=2',minutes:30});assert.match(message.html,/#08152b/);assert.match(message.html,/Redefinir Minha Senha/);assert.match(message.text,/30 minutos/);assert.match(message.html,/&amp;/);
 assert.throws(()=>createEmailService({EMAIL_DRIVER:'smtp'}),/SMTP_HOST/);
});

test('Reset and account settings frontend handles strength, used-token feedback and successful change',async t=>{
 const delivered=[],{app,db}=createApp({database:':memory:',secret:'password-ui-secret-'.repeat(3),securityLogger(){},emailService:{async sendPasswordReset(m){delivered.push(m);}}});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>{server.closeAllConnections();server.close();db.close();});const base='http://127.0.0.1:'+server.address().port;
 const registered=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Técnico UI',email:'ui@example.com',phone:'11999999999',password:'senha-inicial-123',team_id:'sq1'})});const session=await registered.json();
 await fetch(base+'/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ui@example.com'})});for(let i=0;i<100&&!delivered.length;i++)await new Promise(r=>setTimeout(r,5));
 const token=new URL(delivered[0].url).searchParams.get('token');const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:base+'/redefinir-senha?token='+token,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 w.AbortSignal=AbortSignal;w.fetch=(url,opts)=>fetch(new URL(url,base),opts);w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});
 w.eval(fs.readFileSync(path.join(__dirname,'../js/shared.js'),'utf8'));await w.GBLShared.ready();w.eval([...w.document.querySelectorAll('script[data-module]')].map(el=>fs.readFileSync(path.join(__dirname,'..',el.dataset.module),'utf8')).join('\n;\n')+'\nwindow.rbac=RBAC;');w.document.dispatchEvent(new w.Event('DOMContentLoaded'));await new Promise(r=>setTimeout(r,10));
 const $=id=>w.document.getElementById(id);assert.equal($('passwordModal').hidden,false);assert.equal($('resetPasswordForm').hidden,false);assert.equal(w.location.search,'');assert.equal($('secureAuthModal').hidden,true);
 const form=$('resetPasswordForm');form.elements.new_password.value='Uma-senha-bem-forte-456';form.elements.new_password.dispatchEvent(new w.Event('input'));assert.ok($('resetPasswordStrength').value>=3);form.elements.confirm_password.value='diferente';form.dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match($('passwordFeedback').textContent,/confirmação/);
 form.elements.confirm_password.value=form.elements.new_password.value;form.dispatchEvent(new w.Event('submit',{cancelable:true}));for(let i=0;i<300&&!$('passwordModal').hidden;i++)await new Promise(r=>setTimeout(r,10));assert.equal($('passwordModal').hidden,true);assert.equal($('secureAuthModal').hidden,false);
 // A new page with the consumed URL must offer another recovery link.
 w.history.replaceState(null,'','/redefinir-senha?token='+token);w.document.dispatchEvent(new w.Event('DOMContentLoaded'));form.elements.new_password.value='Outra-senha-forte-789';form.elements.confirm_password.value='Outra-senha-forte-789';form.dispatchEvent(new w.Event('submit',{cancelable:true}));for(let i=0;i<200&&$('requestNewPasswordLink').hidden;i++)await new Promise(r=>setTimeout(r,10));assert.equal($('requestNewPasswordLink').hidden,false);
 $('requestNewPasswordLink').click();assert.equal($('forgotPasswordForm').hidden,false);
 // Login with the updated password; account settings remain available to pending users.
 const result=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:session.user.email,password:'Uma-senha-bem-forte-456'})});await w.rbac.accept(await result.json());$('accountSettingsBtn').click();assert.equal($('changePasswordForm').hidden,false);
});
