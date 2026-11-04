window.GBLAdmission=(()=>{
  const $=id=>document.getElementById(id),issued=new Map();let loading=false;
  function button(label,action){const el=document.createElement('button');el.type='button';el.className='btn btn-secondary';el.textContent=label;el.onclick=async()=>{el.disabled=true;try{await action();}catch(e){RBAC.showToast(e.message);}finally{el.disabled=false;}};return el;}
  async function refresh(){
    if(!RBAC.isAdmin()||loading)return;loading=true;$('admissionStatus').textContent='Carregando…';
    try{
      const [policy,pending,invites]=await Promise.all(['/api/admin/admission-settings','/api/admin/pending-registrations','/api/admin/invites'].map(url=>RBAC.request(url)));
      $('admissionMode').value=policy.mode;$('pendingRegistrations').replaceChildren();$('teamInvites').replaceChildren();
      if(!pending.length)$('pendingRegistrations').textContent='Nenhuma solicitação pendente.';
      for(const user of pending){
        const row=document.createElement('div');row.className='admission-row';const info=document.createElement('p');
        info.textContent=[user.name,user.email,user.phone,'Time: '+user.teamName,new Date(user.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})].join('\n');row.append(info);
        for(const [action,label] of [['approve','Aprovar'],['reject','Rejeitar']])row.append(button(label,async()=>{
          if(action==='reject'&&!await RBAC.confirmDelete({title:'Rejeitar solicitação',message:'Rejeitar o cadastro de '+user.name+' e liberar o time?',confirmText:'Rejeitar'}))return;
          const result=await RBAC.request('/api/admin/registrations/'+encodeURIComponent(user.id)+'/'+action,{method:'PATCH',body:'{}'});RBAC.showToast(result.message,'info');await RBAC.refreshUsers();await refresh();
        }));$('pendingRegistrations').append(row);
      }
      for(const team of invites){
        const row=document.createElement('div');row.className='admission-row';const info=document.createElement('p');info.textContent=team.name+' — '+(team.owner_id?'Ocupado / reservado':team.used_at?'Convite utilizado':team.expires_at?'Convite expira em '+new Date(team.expires_at).toLocaleDateString('pt-BR'):'Sem convite');row.append(info);
        const generate=button('Gerar Novo Código',async()=>{const result=await RBAC.request('/api/admin/invites/'+encodeURIComponent(team.team_id),{method:'POST',body:'{}'});issued.set(team.team_id,result);await refresh();RBAC.showToast('Convite gerado. Copie o link e envie ao técnico correto.','info');});generate.disabled=Boolean(team.owner_id);row.append(generate);
        const code=issued.get(team.team_id);if(code&&!team.owner_id){const value=document.createElement('input');value.readOnly=true;value.value=code.code;value.setAttribute('aria-label','Código de convite para '+team.name);row.append(value,button('Copiar Link de Convite',async()=>{await navigator.clipboard.writeText(code.invite_url);RBAC.showToast('Link de convite copiado.','info');}));const link=document.createElement('input');link.readOnly=true;link.value=code.invite_url;link.setAttribute('aria-label','Link de convite para '+team.name);row.append(link);}
        $('teamInvites').append(row);
      }
      $('admissionStatus').textContent=pending.length+' solicitação(ões) pendente(s).';
    }catch(e){$('admissionStatus').textContent=e.message;}finally{loading=false;}
  }
  $('saveAdmissionMode').onclick=async()=>{const el=$('saveAdmissionMode');el.disabled=true;try{await RBAC.request('/api/admin/admission-settings',{method:'PUT',body:JSON.stringify({mode:$('admissionMode').value})});RBAC.showToast('Método de entrada atualizado.','info');}catch(e){RBAC.showToast(e.message);}finally{el.disabled=false;}};
  $('refreshAdmission').onclick=refresh;
  window.addEventListener('gbl:rolechange',()=>{if(!RBAC.isAdmin()){issued.clear();$('pendingRegistrations').replaceChildren();$('teamInvites').replaceChildren();$('adminPaneAccess').hidden=true;}});
  window.addEventListener('gbl:datachange',()=>{if(!$('adminPaneAccess').hidden)refresh();});
  return {refresh};
})();
