(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GBLBackupFormat=api;})(globalThis,()=>{
  const VERSION='1.0.0';
  const keys={teams:'gbl.squads.v2',limits:'gbl.clubs.v2',ranking:'gbl.ranking.v2',finals:'gbl.finals.v2',records:'gbl.records.v2',transfers:'gbl.transfers.v2',proposals:'gbl.proposals.v2',schedules:'gbl.reservations.v1',news:'gbl.news.v2',active:'gbl.championships.active.v2',history:'gbl.championships.history.v2',badges:'gbl.badges.v1',schedule_options:'gbl.schedule.options.v1'};
  const clone=v=>JSON.parse(JSON.stringify(v));
  const clean=v=>Array.isArray(v)?v.map(clean):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!/(phone|email|password|token|whatsapp|wa_?url|celular|telefone)/i.test(k)).map(([k,val])=>[k,clean(val)])):v;
  function pack(values){
    const teams=clone(values.teams||[]);
    const result={version:VERSION,exported_at:new Date().toISOString(),teams:teams.map(({roster,...t})=>t),rosters:teams.map(t=>({team_id:t.id,players:t.roster||[],starterIds:t.starterIds||[],starterFormation:t.starterFormation||t.formation||''})),rankings:values.ranking||{historico:[],temporada2026:[]},titles:{finals:values.finals||[],records:values.records||[]},transfers:{history:values.transfers||[],limits:values.limits||[],proposals:values.proposals||[]},schedules:{votes:values.schedules||[],options:values.schedule_options||[]},news:values.news||[],tournaments:{active:values.active||{},history:values.history||[]},badges:values.badges||{}};
    return clean(result);
  }
  function validate(b){
    const fail=message=>{throw Error('Backup inválido: '+message);};
    if(!b||typeof b!=='object'||b.version!==VERSION)fail('versão incompatível (esperada '+VERSION+').');
    if(typeof b.exported_at!=='string'||!Number.isFinite(Date.parse(b.exported_at)))fail('data de exportação inválida.');
    function scan(v,depth=0){if(depth>30)fail('estrutura excessivamente profunda.');if(Array.isArray(v)){if(v.length>10000)fail('coleção muito grande.');v.forEach(x=>scan(x,depth+1));}else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))fail('propriedade insegura.');if(/(phone|email|password|token|whatsapp|wa_?url|celular|telefone)/i.test(k))fail('o arquivo contém dados de autenticação ou contatos.');if(typeof x==='string'&&(/url$/i.test(k)||['image','cover_image','custom_shield','shield_image'].includes(k))&&x&&!/^(https?:\/\/|\/uploads\/(badges|kits)\/|assets\/|data:image\/(png|jpeg|webp|svg\+xml);base64,)/i.test(x))fail('URL de imagem ou referência insegura.');if(['primaryColor','secondaryColor'].includes(k)&&typeof x==='string'&&!/^#[a-f0-9]{3,8}$/i.test(x))fail('cor de clube inválida.');scan(x,depth+1);}}
    scan(b);
    function list(rows,label){if(!Array.isArray(rows))fail(label+' deve ser uma lista.');return rows;}
    function ids(rows,label){list(rows,label);if(rows.some(r=>!r||typeof r!=='object'||typeof r.id!=='string'||!r.id||r.id.length>128)||new Set(rows.map(r=>r.id)).size!==rows.length)fail(label+' contém identificadores ausentes ou duplicados.');}
    ids(b.teams,'teams');if(!b.teams.length||b.teams.length>100)fail('informe entre 1 e 100 clubes.');
    const teamIds=new Set(b.teams.map(t=>t.id));if(new Set(b.teams.map(t=>String(t.name).trim().toLowerCase())).size!==b.teams.length)fail('nomes de clubes duplicados.');
    for(const t of b.teams){if(typeof t.name!=='string'||!t.name.trim())fail('nome de clube ausente.');for(const k of ['stars','overall_rating','avgOvr'])if(t[k]!==undefined&&(!Number.isFinite(Number(t[k]))||Number(t[k])<0||Number(t[k])>100))fail('atributos de clube inválidos.');}
    list(b.rosters,'rosters');if(b.rosters.length!==b.teams.length||new Set(b.rosters.map(r=>r.team_id)).size!==b.rosters.length)fail('é necessário um elenco por clube.');
    for(const r of b.rosters){if(!teamIds.has(r.team_id))fail('elenco referencia clube inexistente.');ids(r.players,'roster.players');if(r.players.length>30)fail('elenco excede 30 atletas.');for(const p of r.players)if(typeof p.name!=='string'||!p.name.trim()||!Number.isFinite(Number(p.ovr)))fail('atleta inválido.');list(r.starterIds,'starterIds');if(r.starterIds.length>11||new Set(r.starterIds).size!==r.starterIds.length||r.starterIds.some(id=>!r.players.some(p=>p.id===id)))fail('titulares inválidos.');}
    for(const k of ['historico','temporada2026']){ids(b.rankings?.[k],'rankings.'+k);for(const r of b.rankings[k])if(r.team_id&&!teamIds.has(r.team_id))fail('ranking referencia clube inexistente.');}
    for(const [rows,label] of [[b.titles?.finals,'titles.finals'],[b.titles?.records,'titles.records'],[b.transfers?.history,'transfers.history'],[b.transfers?.limits,'transfers.limits'],[b.transfers?.proposals,'transfers.proposals'],[b.schedules?.votes,'schedules.votes'],[b.schedules?.options,'schedules.options'],[b.news,'news'],[b.tournaments?.history||[],'tournaments.history']])ids(rows,label);
    for(const n of b.news)if(typeof n.title!=='string'||typeof n.body!=='string')fail('notícia sem título ou corpo.');
    for(const v of b.schedules.votes)if(typeof v.name!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||!Number.isFinite(Date.parse(v.date))||!Array.isArray(v.periods)||!v.periods.length||new Set(v.periods).size!==v.periods.length||v.periods.some(p=>!['manha','tarde','noite'].includes(p)))fail('voto de agendamento inválido.');
    for(const l of b.transfers.limits)if(typeof l.name!=='string'||!Number.isInteger(l.maxTrades)||l.maxTrades<0||!Number.isInteger(l.reserves)||l.reserves<0)fail('limites inválidos.');
    if(b.badges!==undefined&&(!b.badges||typeof b.badges!=='object'||Array.isArray(b.badges)))fail('mapa de escudos inválido.');
    for(const value of Object.values(b.badges||{}))if(typeof value!=='string'||value&&!/^(https?:\/\/|\/uploads\/(badges|kits)\/|assets\/|data:image\/(png|jpeg|webp|svg\+xml);base64,)/i.test(value))fail('escudo inválido.');
    for(const row of [...b.titles.finals,...b.titles.records,...b.transfers.proposals])for(const field of ['team_id','winner_team_id','runner_team_id','from_team_id','to_team_id'])if(row[field]&&!teamIds.has(row[field]))fail('referência de clube inexistente em '+field+'.');
    return b;
  }
  function unpack(b){validate(b);return {teams:b.teams.map(t=>{const r=b.rosters.find(r=>r.team_id===t.id);return {...clone(t),roster:clone(r.players),starterIds:clone(r.starterIds),starterFormation:r.starterFormation||t.formation||''};}),ranking:clone(b.rankings),finals:clone(b.titles.finals),records:clone(b.titles.records),transfers:clone(b.transfers.history),limits:clone(b.transfers.limits),proposals:clone(b.transfers.proposals),schedules:clone(b.schedules.votes),schedule_options:clone(b.schedules.options),news:clone(b.news),active:clone(b.tournaments?.active||{}),history:clone(b.tournaments?.history||[]),badges:clone(b.badges||{})};}
  return {VERSION,keys,pack,validate,unpack};
});
