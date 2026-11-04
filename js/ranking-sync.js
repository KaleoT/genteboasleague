/* Importação compartilhada no backend; uma única gravação atualiza as duas visões locais. */
(() => {
  const KEY='gbl.ranking.v2';
  const $=id=>document.getElementById(id);
  let busy=false;
  function cached(){try{return JSON.parse(GBLShared.getItem(KEY) || '{}');}catch{return {};}}
  function time(){
    const sync=cached().sync;
    $('rankingSyncTime').textContent=sync?.synced_at?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium',timeZone:'America/Sao_Paulo'}).format(new Date(sync.synced_at)):'Ainda não realizada';
    if(sync?.source_url)$('rankingSyncUrl').value=sync.source_url;
  }
  const norm=value=>String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  function apply(payload){
    if(!payload?.rankings || !['historico','temporada2026'].every(key=>Array.isArray(payload.rankings[key]) && payload.rankings[key].length))throw Error('A API retornou rankings incompletos.');
    const teams=window.GBLTeams.all(), users=RBAC.readUsers();
    const resolve=row=>{
      const exact=teams.filter(t=>norm(t.name)===norm(row.name));
      const matches=exact.length?exact:teams.filter(t=>norm(t.manager)===norm(row.name) || users.some(u=>u.team_id===t.id && norm(u.name)===norm(row.name)));
      return matches.length===1?{...row,team_id:matches[0].id,primaryColor:matches[0].primaryColor,secondaryColor:matches[0].secondaryColor}:row;
    };
    const rankings=Object.fromEntries(Object.entries(payload.rankings).map(([key,rows])=>[key,rows.map(resolve)]));
    const store={...window.GBLTeams.rankingStore(rankings,false),sync:{synced_at:payload.synced_at,source_url:payload.source_url,warnings:payload.warnings || []}};
    GBLShared.hydrate('ranking',store);
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    time();
    const unmatched=rankings.historico.filter(r=>!r.team_id).length;
    return unmatched;
  }
  $('rankingSyncForm')?.addEventListener('submit',async event=>{
    event.preventDefault();
    if(busy || !RBAC.requireAdmin('sincronizar rankings'))return;
    busy=true;const btn=$('rankingSyncBtn');btn.disabled=true;btn.setAttribute('aria-busy','true');btn.querySelector('.ranking-sync-spinner').hidden=false;
    $('rankingSyncBtnLabel').textContent='Sincronizando…';$('rankingSyncStatus').textContent='Buscando e validando as duas abas da planilha…';
    try{
      await GBLShared.idle();
      const payload=await RBAC.request('/api/admin/rankings/sync',{method:'POST',body:JSON.stringify({url:$('rankingSyncUrl').value.trim()}),signal:AbortSignal.timeout(45000)});
      let unmatched;
      try{unmatched=apply(payload);}catch{throw Error('Os rankings foram salvos no servidor, mas não foi possível atualizar o armazenamento deste navegador. Libere espaço e recarregue a página.');}
      $('rankingSyncStatus').textContent=`Importados ${payload.rankings.historico.length} participantes no Histórico e ${payload.rankings.temporada2026.length} em 2026. `+(payload.warnings || []).join(' ')+(unmatched?' Participantes sem vínculo único com um clube foram mantidos com o nome da planilha.':'');
      RBAC.showToast('Rankings Histórico e 2026 sincronizados com sucesso!','info');
    }catch(error){$('rankingSyncStatus').textContent=error.message;RBAC.showToast(error.message);}
    finally{busy=false;btn.disabled=false;btn.removeAttribute('aria-busy');btn.querySelector('.ranking-sync-spinner').hidden=true;$('rankingSyncBtnLabel').textContent='Sincronizar Rankings Agora';}
  });
  window.addEventListener('gbl:datachange',time);
  window.addEventListener('storage',event=>{if(event.key===KEY)time();});
  time();
  // Outros dispositivos também recebem o último snapshot compartilhado.
  document.addEventListener('DOMContentLoaded',async()=>{
    try{const payload=await RBAC.request('/api/rankings');if(payload && (!cached().sync?.synced_at || payload.synced_at>cached().sync.synced_at))apply(payload);}
    catch(error){$('rankingSyncStatus').textContent='Não foi possível consultar a última sincronização: '+error.message;}
  });
})();
