window.GBLPasswords=(()=>{
  const $=id=>document.getElementById(id),modal=$('passwordModal');let busy=false,resetToken='';
  const forms=['forgotPasswordForm','resetPasswordForm','changePasswordForm'];
  function feedback(message){$('passwordFeedback').textContent=message;}
  function open(mode){
    if(busy)return;if(mode==='change'&&!RBAC.isIdentified()){GBLAuth.open();return;}
    GBLAuth.close();modal.hidden=false;document.body.classList.add('onboarding-locked');feedback('');$('requestNewPasswordLink').hidden=true;
    for(const id of forms){$(id).hidden=id!==mode+'PasswordForm';$(id).reset();}
    for(const type of ['reset','change']){$(type+'PasswordStrength').value=0;$(type+'PasswordStrengthLabel').textContent='Use pelo menos 10 caracteres.';}
    $('passwordTitle').textContent={forgot:'Esqueci minha senha',reset:'Redefinir senha',change:'Configurações da Conta — Senha'}[mode];
    $('closePasswordModal').textContent=mode==='change'?'Fechar':'Voltar ao login';
    $(mode+'PasswordForm').querySelector('input').focus();
  }
  function close(){if(busy)return;modal.hidden=true;document.body.classList.remove('onboarding-locked');forms.forEach(id=>$(id).reset());feedback('');if(!RBAC.isIdentified()&&!RBAC.isGuest())GBLAuth.open();}
  $('forgotPasswordLink').onclick=()=>open('forgot');$('requestNewPasswordLink').onclick=()=>open('forgot');$('accountSettingsBtn').onclick=()=>open('change');$('closePasswordModal').onclick=close;
  for(const mode of ['reset','change']){
    const input=$(mode+'PasswordForm').elements.new_password;
    input.addEventListener('input',()=>{const value=input.value;const score=value.length<10?0:Math.min(4,1+(value.length>=14?1:0)+(new Set([...value]).size>=8?1:0)+(/[A-Za-z]/.test(value)&&/[^A-Za-z]/.test(value)?1:0));$(mode+'PasswordStrength').value=score;$(mode+'PasswordStrengthLabel').textContent=['Use pelo menos 10 caracteres.','Força baixa','Força razoável','Força boa','Força alta'][score];});
  }
  async function request(path,body,method){
    // Public recovery must not inherit or modify an unrelated session on HTTP errors.
    if(path==='/api/auth/change-password')return RBAC.request(path,{method,body:JSON.stringify(body)});
    const res=await fetch(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
    const data=await res.json();if(!res.ok)throw Object.assign(Error(data.message||'Não foi possível concluir a solicitação.'),{code:data.error});return data;
  }
  for(const mode of ['forgot','reset','change'])$(mode+'PasswordForm').onsubmit=async event=>{
    event.preventDefault();if(busy)return;const form=event.target,body=Object.fromEntries(new FormData(form));
    if(mode!=='forgot'&&body.new_password!==body.confirm_password){feedback('A confirmação da nova senha não corresponde.');return;}
    if(mode==='reset')body.token=resetToken;
    busy=true;const button=form.querySelector('[type="submit"]'),label=button.textContent;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Aguarde…';feedback('Processando…');
    try{
      const endpoint={forgot:'forgot-password',reset:'reset-password',change:'change-password'}[mode];
      const result=await request('/api/auth/'+endpoint,body,mode==='change'?'PUT':'POST');
      form.reset();feedback(result.message);RBAC.showToast(result.message,'info');
      if(mode!=='forgot'){
        resetToken='';RBAC.forgetSession();history.replaceState(null,'','/');modal.hidden=true;document.body.classList.remove('onboarding-locked');GBLAuth.open();
      }
    }catch(error){feedback(error.message||'Falha de conexão. Tente novamente.');if(error.code==='INVALID_RESET_TOKEN'){$('requestNewPasswordLink').hidden=false;form.hidden=true;}}
    finally{busy=false;button.disabled=false;button.removeAttribute('aria-busy');button.textContent=label;}
  };
  function profile(){const identified=RBAC.isIdentified();$('accountSettingsBtn').hidden=!identified;if(!identified&&!$('changePasswordForm').hidden){modal.hidden=true;forms.forEach(id=>$(id).reset());}}
  window.addEventListener('gbl:profilechange',profile);profile();
  document.addEventListener('DOMContentLoaded',()=>{
    if(location.pathname!=='/redefinir-senha')return;
    resetToken=new URLSearchParams(location.search).get('token')||'';
    // Keep the bearer token out of later URLs, referrers and browser history entries.
    history.replaceState(null,'','/redefinir-senha');open('reset');
    if(!resetToken){$('resetPasswordForm').hidden=true;feedback('O link de recuperação não contém um token válido.');$('requestNewPasswordLink').hidden=false;}
  });
  return {open};
})();
