const {test}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {createApp}=require('./approved-fixture.cjs');

test('RBAC enforces route and field permissions, ignores impersonation and audits denials',async t=>{
 const logs=[],secret='rbac-test-secret-'.repeat(4);
 const {app,db}=createApp({database:':memory:',secret,securityLogger:e=>logs.push(e)});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();db.close();});
 const base='http://127.0.0.1:'+server.address().port;
 async function call(route,method='GET',body,token){const res=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:res.status,data:res.status===204?null:await res.json()};}
 async function register(n){return (await call('/api/auth/register','POST',{name:'Técnico '+n,email:n+'@example.com',phone:'1191111111'+n,password:'senha-segura-123',team_id:'sq'+n})).data;}
 const admin=await register(1),player=await register(2),other=await register(3);
 db.prepare("UPDATE users SET role='admin' WHERE id=?").run(admin.user.id);
 const critical=[['POST','/api/news'],['PUT','/api/news/missing'],['DELETE','/api/news/missing'],['POST','/api/transfers/confirm'],['POST','/api/tournaments'],['PUT','/api/titles/missing'],['POST','/api/records'],['POST','/api/admin/rankings/sync'],['POST','/api/teams'],['DELETE','/api/teams/sq3'],['PATCH','/api/admin/users/'+other.user.id],['DELETE','/api/admin/users/'+other.user.id]];
 for(const [method,route] of critical){
   const denied=await call(route,method,{},player.access_token);
   assert.equal(denied.status,403,route);assert.equal(denied.data.error,'FORBIDDEN');assert.match(denied.data.message,/administradores/);
   const guest=await call(route,method,{});assert.equal(guest.status,401,route);assert.equal(guest.data.error,'UNAUTHORIZED');
 }
 for(const key of ['limits','news','finals','history','records','ranking','badges','active','schedule_options']){
   const result=await call('/api/collections/'+key,'PUT',{revision:1,value:[]},player.access_token);assert.equal(result.status,403,key);assert.equal(result.data.error,'FORBIDDEN');
 }
 for(const body of [{},{formation:'4-4-2'}]){
   const result=await call('/api/teams/sq3','PUT',body,player.access_token);assert.equal(result.status,403);assert.match(result.data.message,/própria equipe/);
 }
 const before=(await call('/api/teams/sq2')).data;
 for(const [field,value] of Object.entries({name:'Invadido',manager_name:'Outro técnico',league:'Outra liga',stars:99,overall_rating:99,avgOvr:99,team_id:'sq3',role:'admin'})){
   const result=await call('/api/teams/sq2','PUT',{[field]:value},player.access_token);assert.equal(result.status,403,field);assert.equal(result.data.error,'FORBIDDEN');
 }
 assert.deepEqual((await call('/api/teams/sq2')).data,before);
 const teams=(await call('/api/state')).data.teams;
 const forged=structuredClone(teams.value);forged.find(t=>t.id==='sq3').captain='Intruso';
 assert.equal((await call('/api/collections/teams','PUT',{revision:teams.revision,value:forged},player.access_token)).status,403);
 const allowed={formation:'4-4-2',captain:before.roster[0].name,badge_url:'https://example.com/escudo.png',kit_home_3d_url:'https://example.com/kit.png',starterIds:before.roster.slice(0,11).map(p=>p.id)};
 assert.equal((await call('/api/teams/sq2','PUT',allowed,player.access_token)).status,200);
 assert.equal((await call('/api/teams/sq3','PUT',{name:'Clube Oficial',stars:5,overall_rating:90,league:'Liga A'},admin.access_token)).status,200);
 const vote=await call('/api/schedules/vote','POST',{user_id:other.user.id,team_id:'sq3',name:'Falso',entries:[{date:'2026-12-15',periods:['noite'],user_id:other.user.id}]},player.access_token);
 assert.equal(vote.status,200);assert.equal(vote.data[0].user_id,player.user.id);assert.equal(vote.data[0].team_id,'sq2');assert.equal(vote.data[0].name,player.user.name);
 const proposal=await call('/api/transfers/propose','POST',{from_user_id:other.user.id,from_team_id:'sq3',fromClub:'Falso',to_team_id:'sq1',offered:[before.roster[0].name],requested:[(await call('/api/teams/sq1')).data.roster[0].name]},player.access_token);
 assert.equal(proposal.status,201);assert.equal(proposal.data.from_user_id,player.user.id);assert.equal(proposal.data.from_team_id,'sq2');
 const sign=(claims,key=secret,expiresIn='1h')=>jwt.sign(claims,key,{algorithm:'HS256',subject:player.user.id,issuer:'gbl-api',audience:'gbl-web',expiresIn});
 const claimedAdmin=sign({role:'admin',team_id:'sq3',ver:0});
 assert.equal((await call('/api/news','POST',{},claimedAdmin)).status,403);
 assert.equal((await call('/api/teams/sq3','PUT',{},claimedAdmin)).status,403);
 for(const token of ['invalid',sign({ver:0},'wrong-secret'),sign({ver:0},secret,-1)]){
   const result=await call('/api/teams/sq2','PUT',allowed,token);assert.equal(result.status,401);assert.equal(result.data.error,'UNAUTHORIZED');
 }
 assert.ok(logs.some(l=>l.reason==='foreign_team'));assert.ok(logs.some(l=>l.reason==='admin_route'));
 assert.ok(logs.some(l=>l.reason==='spoofed_vote_identity_ignored'));assert.ok(logs.some(l=>l.reason==='spoofed_proposal_identity_ignored'));
 assert.ok(logs.every(l=>!Object.hasOwn(l,'token')&&!Object.hasOwn(l,'body')));
 // Revoked sessions stop working even if their signature and expiry remain valid.
 db.prepare('UPDATE users SET token_version=token_version+1 WHERE id=?').run(player.user.id);
 assert.equal((await call('/api/teams/sq2','PUT',allowed,player.access_token)).status,401);
});
