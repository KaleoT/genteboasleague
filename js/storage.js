/* Agendamentos compartilhados; a identidade vem exclusivamente do servidor. */
const Store=(()=>{
 const all=()=>JSON.parse(GBLShared.getItem('gbl.reservations.v1')||'[]');
 async function vote(entries,fromDate){if(!RBAC.requireMember())return;const result=await GBLShared.request('/api/schedules/vote',{method:'POST',body:JSON.stringify({entries,fromDate})});GBLShared.hydrate('schedules',result);window.dispatchEvent(new CustomEvent('gbl:datachange'));}
 return {all,saveMany:(_name,entries)=>vote(entries),replaceFuture:(_name,entries,fromDate)=>vote(entries,fromDate),byName:(_name,fromDate)=>all().filter(r=>r.user_id===RBAC.getCurrentUserId()&&r.date>=fromDate),getLastName:()=>RBAC.getProfile()?.user_name||'',setLastName(){},async removePeriod(id,period){await GBLShared.request('/api/schedules/'+encodeURIComponent(id)+'?period='+encodeURIComponent(period),{method:'DELETE'});await GBLShared.refresh();}};
})();
