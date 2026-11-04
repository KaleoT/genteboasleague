(async()=>{
  function failure(file,error){
    document.body.classList.add('app-unavailable');
    document.querySelectorAll('[data-admin-only]').forEach(el=>el.hidden=true);
    const panel=document.createElement('section');panel.id='startupFailure';panel.className='card';panel.setAttribute('role','alert');
    const title=document.createElement('h1');title.textContent=file?'Abra a liga pelo servidor local':'Não foi possível iniciar o site';
    const description=document.createElement('p');description.textContent=file?'Você abriu o arquivo index.html diretamente. Os dados, o login e as abas precisam do servidor da liga. Abra INICIAR-LIGA.cmd na pasta do projeto.':'Verifique se o servidor está ativo. Abra INICIAR-LIGA.cmd na pasta do projeto e tente novamente. Se estiver usando hospedagem, verifique o serviço da API.';
    const link=document.createElement('a');link.className='btn btn-gold';link.textContent='Abrir site no endereço correto';link.href='http://localhost:3000/'+(/^#(inicio|transferencias|titulos|campeonatos|elencos|ranking|agendamento)$/.test(location.hash)?location.hash:'');
    const status=document.createElement('p');status.id='startupRecoveryStatus';status.setAttribute('role','status');panel.append(title,description,link);
    if(file){
      const button=document.createElement('button');button.type='button';button.className='btn btn-secondary';button.textContent='Resgatar dados antigos deste navegador (.json)';
      button.onclick=async()=>{try{
        if(!window.GBLBackupFormat)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='js/backup-format.js';script.onload=resolve;script.onerror=reject;document.body.append(script);});
        const values={};for(const [name,key] of Object.entries(GBLBackupFormat.keys)){const raw=localStorage.getItem(key);if(raw!==null)values[name]=JSON.parse(raw);}
        const backup=GBLBackupFormat.pack(values);GBLBackupFormat.validate(backup);
        const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='backup_gente_boas_league_resgate_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
        status.textContent='Backup baixado. No site pelo servidor, entre como administrador e importe em Backup & Migração. Os dados originais não foram apagados.';
      }catch{status.textContent='Não foi possível exportar. Este navegador pode não conter dados antigos, ou alguma chave local está inválida. Os dados originais foram preservados.';}};panel.append(button);
    }else{const retry=document.createElement('button');retry.type='button';retry.className='btn btn-secondary';retry.textContent='Tentar novamente';retry.onclick=()=>location.reload();panel.append(retry);}
    panel.append(status);document.body.append(panel);if(error)console.error('Falha ao inicializar a liga:',error);
  }
  if(location.protocol==='file:'){failure(true);return;}
  let moduleError=null;const capture=event=>{moduleError=event.error||Error(event.message||'Erro no módulo da interface.');};
  try{
    await GBLShared.ready();
    window.addEventListener('error',capture);
    for(const el of document.querySelectorAll('script[data-module]')){
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=el.dataset.module;script.onload=resolve;script.onerror=()=>reject(Error('Não foi possível carregar '+el.dataset.module));document.body.append(script);});
      if(moduleError)throw moduleError;
    }
    document.dispatchEvent(new Event('DOMContentLoaded'));
    if(moduleError)throw moduleError;
    window.GBLReady=true;
    window.addEventListener('hashchange',()=>GBLShared.refresh());
    window.addEventListener('gbl:profilechange',()=>GBLShared.refresh());
    window.addEventListener('online',()=>GBLShared.refresh());
  }catch(error){failure(false,error);}
  finally{window.removeEventListener('error',capture);}
})();
