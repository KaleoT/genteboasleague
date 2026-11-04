const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function recoveryMessage({url,minutes}){
  return {subject:"Redefinir senha — Gente Boa's League",text:`Recebemos uma solicitação de recuperação de senha.\nRedefina sua senha: ${url}\nEste link expira em ${minutes} minutos e só pode ser usado uma vez.\nSe você não solicitou a recuperação, ignore esta mensagem.`,html:`<!doctype html><html lang="pt-BR"><body style="margin:0;background:#08152b;color:#e3edff;font-family:Arial,sans-serif;padding:32px"><div style="max-width:520px;margin:auto;background:#132846;padding:32px;border-radius:16px"><h1 style="color:#f5c84c">Gente Boa's League</h1><h2>Recuperação de senha</h2><p>Recebemos uma solicitação para recuperar seu acesso.</p><p style="padding:20px 0"><a href="${escape(url)}" style="display:inline-block;background:#f5c84c;color:#10213c;padding:16px 24px;border-radius:8px;font-weight:bold;text-decoration:none">Redefinir Minha Senha</a></p><p>Este link expira em ${minutes} minutos e só pode ser usado uma vez.</p><p>Se você não fez esta solicitação, ignore este e-mail.</p></div></body></html>`};
}
function createEmailService(env=process.env,logger=entry=>console.info(JSON.stringify(entry))){
  const driver=env.EMAIL_DRIVER||(env.SMTP_HOST&&env.FROM_EMAIL?'smtp':'log');
  if(driver==='log')return {async sendPasswordReset({to,url,minutes,expires_at}){logger({event:'password_reset_debug',to,reset_url:url,expires_at});}};
  if(driver!=='smtp'||!env.SMTP_HOST||!env.FROM_EMAIL)throw Error('Configure EMAIL_DRIVER=log ou SMTP_HOST e FROM_EMAIL para SMTP.');
  if(Boolean(env.SMTP_USER)!==Boolean(env.SMTP_PASS))throw Error('Configure SMTP_USER e SMTP_PASS juntos.');
  const port=Number(env.SMTP_PORT||587);if(!Number.isInteger(port)||port<1||port>65535)throw Error('SMTP_PORT inválida.');
  const transport=require('nodemailer').createTransport({host:env.SMTP_HOST,port,secure:env.SMTP_SECURE==='true'||port===465,auth:env.SMTP_USER?{user:env.SMTP_USER,pass:env.SMTP_PASS}:undefined,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
  return {async sendPasswordReset({to,url,minutes}){await transport.sendMail({from:env.FROM_EMAIL,to,...recoveryMessage({url,minutes})});}};
}
module.exports={createEmailService,recoveryMessage};
