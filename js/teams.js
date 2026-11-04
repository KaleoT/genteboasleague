/* Fonte única do treinador: gbl.squads.v2 -> club.manager. Referências usam o ID estável. */
window.GBLTeams = (() => {
  const norm = value => String(value || '').trim().toLowerCase();
  function all() { try { return JSON.parse(GBLShared.getItem('gbl.squads.v2') || '[]'); } catch { return []; } }
  function find(id, name) { const teams=all();return teams.find(t=>id && t.id===id) || teams.find(t=>norm(t.name)===norm(name)); }
  function linkFinal(row) {
    const result={...row};
    for(const side of ['winner','runner']) {
      const team=find(row[side+'_team_id'],row[side+'Team']);
      if(team) { result[side+'_team_id']=team.id;delete result[side+'Manager']; }
    }
    return result;
  }
  function final(row) {
    const result=linkFinal(row);
    for(const side of ['winner','runner']) {
      const team=find(result[side+'_team_id'],result[side+'Team']);
      if(team) { result[side+'Team']=team.name; result[side+'Manager']=team.manager || ''; }
    }
    return result;
  }
  function linkRanking(row) {
    const team=find(row.team_id,row.name);
    if(!team)return {...row};
    const result={...row,team_id:team.id};
    if(result.ranking_detail===undefined) {
      const label=String(row.subtitle || '');
      result.ranking_detail=label.includes('·')?label.split('·').slice(1).join('·').trim():/^Treinador:/i.test(label)?'':label;
    }
    delete result.subtitle;
    return result;
  }
  function ranking(row) {
    const result=linkRanking(row), team=find(result.team_id,result.name);
    if(!team)return result;
    return {...result,name:team.name,manager:team.manager || '',subtitle:[team.manager,result.ranking_detail].filter(Boolean).join(' · ')};
  }
  function rankingStore(store, dynamic=true) {
    return {...store,...Object.fromEntries(['historico','temporada2026'].map(key=>[key,(store[key] || []).map(dynamic?ranking:linkRanking)]))};
  }
  function linkRecord(row) {
    const team=find(row.team_id,String(row.club || '').replace(/\s*\([^)]*\)\s*$/, ''));
    if(!team)return {...row};
    return {...row,team_id:team.id,club:team.name};
  }
  function record(row) {
    const result=linkRecord(row), team=find(result.team_id,result.club);
    return team?{...result,club:team.name+(team.manager?' ('+team.manager+')':'')}:result;
  }
  function linkStored() {
    for(const [key,convert] of [
      ['gbl.finals.v2',rows=>rows.map(linkFinal)],
      ['gbl.records.v2',rows=>rows.map(linkRecord)],
      ['gbl.ranking.v2',store=>rankingStore(store,false)]
    ]) {
      const raw=GBLShared.getItem(key);
      if(raw) { const next=JSON.stringify(convert(JSON.parse(raw))); if(next!==raw)GBLShared.setItem(key,next); }
    }
  }
  function save(list) {
    // Vincula dados legados pelo nome antigo ANTES de eventual renomeação do clube.
    linkStored();
    GBLShared.setItem('gbl.squads.v2',JSON.stringify(list));
  }
  window.addEventListener('storage',event=>{
    if(['gbl.squads.v2','gbl.finals.v2','gbl.ranking.v2'].includes(event.key))window.dispatchEvent(new CustomEvent('gbl:datachange'));
  });
  return {all,find,final,linkFinal,ranking,linkRanking,rankingStore,record,linkRecord,linkStored,save};
})();
