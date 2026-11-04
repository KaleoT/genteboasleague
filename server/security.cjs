const jwt=require('jsonwebtoken');

function createSecurity({secret,lookup,logger=entry=>console.warn(JSON.stringify(entry))}) {
  function audit(req,reason){
    const entry={event:'authorization_denied',at:new Date().toISOString(),method:req.method,path:req.path,user_id:req.user?.id||null,role:req.user?.role||'guest',team_id:req.user?.team_id||null,reason};
    // Logging must never change the authorization decision. No tokens or payloads.
    try{logger(entry);}catch{}
  }
  function deny(req,res,message='Você não tem permissão para executar esta ação.',reason='forbidden'){
    audit(req,reason);return res.status(403).json({error:'FORBIDDEN',message});
  }
  function require_auth(req,res,next){
    try{
      const match=/^Bearer ([^ ]+)$/i.exec(req.get('Authorization')||'');if(!match)throw Error();
      const claims=jwt.verify(match[1],secret,{algorithms:['HS256'],issuer:'gbl-api',audience:'gbl-web'});
      if(typeof claims.sub!=='string')throw Error();
      const user=lookup.get(claims.sub);
      if(!user||claims.ver!==user.token_version||!['admin','player'].includes(user.role)||!user.team_id)throw Error();
      // Only a verified subject can resolve current permissions; request data is never identity.
      req.user=user;
    }catch{
      audit(req,'invalid_or_missing_session');return res.status(401).json({error:'UNAUTHORIZED',message:'Sessão inválida ou expirada. Entre novamente.'});
    }
    if(req.user.status==='pending_approval' && !((req.method==='GET'&&req.path==='/api/auth/me')||(req.method==='POST'&&req.path==='/api/auth/logout')||(req.method==='PUT'&&req.path==='/api/auth/change-password'))){
      return deny(req,res,'Seu cadastro para assumir o '+req.user.team_name+' está em análise pelo administrador','pending_approval');
    }
    next();
  }
  function require_admin(req,res,next){
    if(req.user?.role==='admin')return next();
    return deny(req,res,'Acesso exclusivo para administradores','admin_route');
  }
  function require_team_owner(req,res,next){
    if(req.user?.role==='admin'||req.user?.role==='player'&&req.user.team_id===req.params.id)return next();
    return deny(req,res,'Você só tem permissão para alterar os dados da sua própria equipe','foreign_team');
  }
  return {require_auth,require_admin,require_team_owner,deny,audit};
}
module.exports={createSecurity};
