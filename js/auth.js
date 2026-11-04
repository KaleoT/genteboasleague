window.GBLAuth = (() => {
  const $=id=>document.getElementById(id);
  let teams=[], busy=false, teamsRequest=0;
  const modal=$('secureAuthModal');
  const status=message=>{$('secureAuthStatus').textContent=message;};
  function close(){modal.hidden=true;document.body.classList.remove('onboarding-locked');}
  function open(){modal.hidden=false;document.body.classList.add('onboarding-locked');$('secureAuthClose').hidden=!(RBAC.isIdentified() || RBAC.isGuest());$('secureLoginForm').elements.identifier.focus();}
  function preview(){
    const team=teams.find(t=>t.id===$('secureAvailableTeams').value), holder=$('secureTeamPreview');
    holder.replaceChildren();if(!team)return;
    const img=document.createElement('img');img.src=team.badge_url;img.alt='Escudo '+team.name;img.onerror=()=>{img.onerror=null;img.src='assets/default-shield.svg';};
    holder.append(img,document.createTextNode(team.name));
  }
  async function available(){
    const request=++teamsRequest;
    const select=$('secureAvailableTeams'), retry=$('secureTeamsRetry');
    const previous=select.value;
    select.disabled=true;retry.hidden=true;teams=[];preview();
    select.replaceChildren(new Option('Carregando times…',''));
    try{
      const [result,policy]=await Promise.all([RBAC.request('/api/teams/available'),RBAC.request('/api/auth/registration-policy')]);
      const invited=policy?.mode==='invite';$('inviteCodeField').hidden=!invited;$('inviteCodeInput').required=invited;
      $('registrationPolicyNotice').textContent=invited?'Informe o código exclusivo do clube fornecido pelo administrador.':'Seu cadastro será analisado pelo administrador. O time escolhido ficará reservado até a decisão.';
      if(request!==teamsRequest)return;
      if(!Array.isArray(result) || !result.every(t=>typeof t.id==='string' && typeof t.name==='string'))throw new Error('A API retornou uma lista de times inválida.');
      teams=result;
      select.replaceChildren(new Option(teams.length?'Escolha um time':'Todos os times já foram escolhidos',''),...teams.map(t=>new Option(t.name,t.id)));
      const requested=new URLSearchParams(location.search).get('team');
      if(teams.some(t=>t.id===(previous||requested)))select.value=previous||requested;
      const code=new URLSearchParams(location.search).get('code');if(code)$('inviteCodeInput').value=code;
      select.disabled=teams.length===0;
      retry.hidden=teams.length>0;
      status(teams.length?'':'Todos os times já possuem dono.');
      preview();
    }catch(error){
      if(request!==teamsRequest)return;
      select.replaceChildren(new Option('Não foi possível carregar os times',''));
      select.disabled=true;retry.hidden=false;
      $('secureLocalServerHint').hidden=!(['file:'].includes(location.protocol) || ['localhost','127.0.0.1'].includes(location.hostname));
      status(error.message);
    }
  }
  $('secureTeamsRetry').onclick=()=>available();
  function mode(register){$('secureLoginForm').hidden=register;$('secureRegisterForm').hidden=!register;$('secureAuthTitle').textContent=register?'Criar conta':'Entrar na liga';status('');if(register)available().catch(error=>status(error.message));}
  $('secureLoginTab').onclick=()=>mode(false);$('secureRegisterTab').onclick=()=>mode(true);
  $('secureAuthClose').onclick=()=>{if(RBAC.isIdentified() || RBAC.isGuest())close();};
  $('secureGuestBtn').onclick=()=>{
    if(busy)return;
    RBAC.enterGuest();close();status('');location.hash='inicio';
    document.getElementById('openAuthModalBtn').focus();
  };
  $('secureAvailableTeams').onchange=preview;
  $('secureRegisterForm').elements.phone.oninput=e=>{const d=e.target.value.replace(/\D/g,'').slice(0,11);e.target.value=d.length<=2?d:`(${d.slice(0,2)}) ${d.slice(2,d.length>10?7:6)}${d.length>6?'-'+d.slice(d.length>10?7:6):''}`;};
  for(const [id,endpoint] of [['secureLoginForm','login'],['secureRegisterForm','register']]){
    $(id).onsubmit=async e=>{
      e.preventDefault();if(busy)return;
      const payload=Object.fromEntries(new FormData(e.target));
      if(endpoint==='register' && payload.password!==payload.confirmation){status('As senhas não coincidem.');return;}
      delete payload.confirmation;
      busy=true;const button=e.target.querySelector('[type="submit"]');button.disabled=true;status('Aguarde…');
      try{const session=await RBAC.request('/api/auth/'+endpoint,{method:'POST',body:JSON.stringify(payload)});await RBAC.accept(session);e.target.reset();close();status('');RBAC.showToast(session.user.status==='pending_approval'?'Seu cadastro para assumir o '+session.user.teamName+' está em análise pelo administrador':'Bem-vindo, '+session.user.name+'!','info');}
      catch(error){status(error.message);RBAC.showToast(error.message);if(endpoint==='register' && [403,409].includes(error.status))await available().catch(()=>{});}
      finally{busy=false;button.disabled=false;}
    };
  }
  document.addEventListener('DOMContentLoaded',async()=>{
    if(location.pathname==='/redefinir-senha'){close();return;}
    try{await RBAC.restore();}catch(error){status(error.message);}
    if(RBAC.isIdentified() || RBAC.isGuest())close();else{open();if(location.pathname==='/cadastro'||new URLSearchParams(location.search).has('code'))mode(true);}
  });
  // Expiração e logout feitos em outra aba também encerram a interface ativa.
  window.addEventListener('storage',e=>{if(e.key==='gbl.accessToken.v1')location.reload();});
  setInterval(()=>{if(RBAC.isIdentified())RBAC.restore().catch(error=>status(error.message));},60000);
  return {open,close};
})();
