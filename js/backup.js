window.GBLBackup=(()=>{
  const $=id=>document.getElementById(id),format=GBLBackupFormat;let selected=null,busy=false;
  const allowed=()=>RBAC.requireAdmin('gerenciar backups e migrações');
  function controls(){for(const id of ['restoreLocalBackup','migrateServerBackup'])$(id).disabled=busy||!selected;for(const id of ['exportLocalBackup','exportServerBackup','backupFileInput'])$(id).disabled=busy;}
  function status(message){$('backupStatus').textContent=message;}
  async function run(action){if(!allowed()||busy)return;busy=true;controls();try{await action();}catch(e){status(e.message);RBAC.showToast(e.message);}finally{busy=false;controls();}}
  function download(backup,label=''){
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    a.href=url;a.download='backup_gente_boas_league_'+date+label+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);RBAC.showToast('Backup gerado e baixado com sucesso!','info');
  }
  function localPackage(){
    const values={};for(const [name,key] of Object.entries(format.keys)){const raw=localStorage.getItem(key);if(raw!==null){try{values[name]=JSON.parse(raw);}catch{throw Error('A chave local '+key+' contém JSON inválido. Os dados originais foram preservados.');}}}
    if(!Array.isArray(values.teams)||!values.teams.length)throw Error('Não há um cadastro local de clubes neste navegador. Use Exportar Dados do Servidor ou abra o navegador que contém os dados antigos.');
    const backup=format.pack(values);format.validate(backup);return backup;
  }
  async function loadFile(file){
    selected=null;controls();if(!file)return;
    if(!/\.json$/i.test(file.name)||file.size>32*1024*1024)throw Error('Selecione um arquivo .json de até 32 MB.');
    let value;try{value=JSON.parse(await file.text());}catch{throw Error('O arquivo está corrompido ou não contém JSON válido.');}
    format.validate(value);selected=value;status('Arquivo validado. Escolha onde restaurar.');$('backupSummary').textContent=value.teams.length+' clubes; '+value.rosters.reduce((n,r)=>n+r.players.length,0)+' atletas; '+value.news.length+' notícias; '+value.schedules.votes.length+' votos.\nA importação substitui todas as coleções compartilhadas, inclusive listas vazias. Contas e vínculos de usuários não são importados.';controls();
  }
  $('exportLocalBackup').onclick=()=>run(async()=>download(localPackage(),'_local'));
  $('exportServerBackup').onclick=()=>run(async()=>download(await RBAC.request('/api/admin/export-backup'),'_servidor'));
  $('backupFileInput').onchange=()=>run(async()=>{await loadFile($('backupFileInput').files[0]);});
  async function confirm(){return RBAC.confirmDelete({title:'Confirmar restauração de dados',message:'Esta ação substituirá os dados atuais pelos dados do arquivo. Deseja continuar?',confirmText:'Confirmar restauração'});}
  $('restoreLocalBackup').onclick=()=>run(async()=>{
    if(!selected||!await confirm())return;const values=format.unpack(selected);await GBLShared.idle();
    const previous=new Map(Object.values(format.keys).map(key=>[key,localStorage.getItem(key)]));
    try{for(const [name,key] of Object.entries(format.keys))localStorage.setItem(key,JSON.stringify(values[name]));}
    catch{for(const key of previous.keys())localStorage.removeItem(key);for(const [key,value] of previous)if(value!==null)localStorage.setItem(key,value);throw Error('Não foi possível restaurar: armazenamento do navegador cheio ou indisponível.');}
    GBLShared.preview(values);$('localBackupBanner').hidden=false;status('Dados restaurados somente neste navegador, em modo de visualização. O banco do servidor não foi alterado.');RBAC.showToast('Dados restaurados no navegador.','info');
  });
  $('migrateServerBackup').onclick=()=>run(async()=>{
    if(!selected||!await confirm())return;await GBLShared.idle();
    status('Migrando dados em uma transação…');const result=await RBAC.request('/api/admin/migrate-backup',{method:'POST',body:JSON.stringify(selected),signal:AbortSignal.timeout(60000)});
    await GBLShared.exitPreview();$('localBackupBanner').hidden=true;status(result.message+' '+Object.entries(result.counts).map(([key,n])=>key+': '+n).join(' · '));RBAC.showToast(result.message,'info');await refreshPoints();
  });
  $('exitLocalBackup').onclick=()=>run(async()=>{await GBLShared.exitPreview();$('localBackupBanner').hidden=true;});
  async function refreshPoints(){if(!RBAC.isAdmin())return;try{const points=await RBAC.request('/api/admin/backups');$('backupRestorePoints').replaceChildren();for(const point of points){const button=document.createElement('button');button.className='btn btn-ghost';button.type='button';button.textContent='Baixar '+new Date(point.created_at).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});button.onclick=()=>run(async()=>download(await RBAC.request('/api/admin/backups/'+encodeURIComponent(point.id)),'_restauracao'));$('backupRestorePoints').append(button);}if(!points.length)$('backupRestorePoints').textContent='Nenhuma migração anterior.';}catch(e){status(e.message);}}
  $('refreshRestorePoints').onclick=()=>run(refreshPoints);
  window.addEventListener('gbl:rolechange',()=>{if(!RBAC.isAdmin()){selected=null;$('backupFileInput').value='';$('backupSummary').textContent='';$('backupRestorePoints').replaceChildren();$('adminPaneBackup').hidden=true;$('localBackupBanner').hidden=true;controls();if(GBLShared.isLocalPreview())GBLShared.exitPreview();}});
  return {localPackage,loadFile,refreshPoints};
})();
