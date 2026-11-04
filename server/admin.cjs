// Promoção explícita no servidor; nunca por telefone/chave publicada no frontend.
const {createApp}=require('./app.cjs');
const {db}=createApp();
const email=process.argv[2]?.trim().toLowerCase();
const result=db.prepare("UPDATE users SET role='admin',status='active',token_version=token_version+1 WHERE email=?").run(email || '');
db.close();
if(!result.changes){ console.error('Cadastre a conta e execute: npm run admin -- email@exemplo.com'); process.exitCode=1; }
else console.log('Conta promovida. Faça login novamente.');
