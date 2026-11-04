const {randomUUID}=require('node:crypto');
const CONTACT_MESSAGE='O técnico adversário ainda não configurou um contato de WhatsApp válido';
function prepareProposal({user,body,teams,limits,transfers,contact,baseUrl}){
  const fail=(message,status=400,error='INVALID_PROPOSAL')=>{throw Object.assign(Error(message),{status,error});};
  const from=teams.find(t=>t.id===user.team_id),to=teams.find(t=>t.id===body.target_team_id);
  if(!from||!to||from.id===to.id)fail('Selecione um clube adversário válido.');
  const limit=limits.find(t=>t.name===from.name);
  if(!limit||transfers.filter(t=>t.teamA===from.name||t.teamB===from.name).length>=limit.maxTrades)fail('Seu clube atingiu o limite de negociações da temporada.',409,'TRADE_LIMIT_REACHED');
  let number=String(contact?.phone||'').replace(/\D/g,'');if(number.startsWith('55')&&number.length>11)number=number.slice(2);
  if(!contact||! /^[1-9]\d{9,10}$/.test(number))fail(CONTACT_MESSAGE,422,'WHATSAPP_UNAVAILABLE');
  function players(input,club,required){
    const values=input===undefined||input===null||input===''?[]:Array.isArray(input)?input:[input];
    if(values.length>5||required&&!values.length||new Set(values).size!==values.length)fail('Selecione até cinco jogadores diferentes de cada clube.');
    const selected=values.map(value=>{if(typeof value!=='string'||value.length>120)fail('Jogador inválido.');const matches=(club.roster||[]).filter(p=>p.id===value||p.name===value);if(matches.length!==1)fail('Um jogador selecionado não pertence ao clube informado.');return matches[0].name;});
    if(new Set(selected).size!==selected.length)fail('Não selecione o mesmo jogador mais de uma vez.');return selected;
  }
  const requested=players(body.player_wanted,to,true),offered=players(body.player_offered,from,false);
  const cash=body.cash_amount??0;
  if(typeof cash!=='number'||!Number.isFinite(cash)||cash<0||cash>1e12||Math.abs(cash*100-Math.round(cash*100))>0.001)fail('Informe um valor de compensação válido.');
  if(!offered.length&&cash===0)fail('Selecione um jogador oferecido ou informe uma compensação.');
  const origin=new URL(baseUrl);if(!['http:','https:'].includes(origin.protocol))fail('Endereço da plataforma não configurado.',500);
  const profile=new URL('/',origin);profile.searchParams.set('team',from.id);profile.hash='elencos';
  const clean=value=>String(value).replace(/[\r\n\u0000-\u001f*`_]/g,' ').trim();
  const compensation=[offered.map(clean).join(', '),cash?new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cash):''].filter(Boolean).join(' + ');
  const message=`⚽ *PROPOSTA DE TRANSFERÊNCIA - GENTE BOA'S LEAGUE* ⚽\n\nOlá, técnico do *${clean(to.name)}*!\nSou ${clean(user.name)}, técnico do *${clean(from.name)}*, e tenho interesse em abrir uma negociação:\n\n📥 *Jogador de interesse:* ${requested.map(clean).join(', ')}\n🔄 *Oferta em troca:* ${compensation}\n\nPodemos alinhar os detalhes por aqui?${body.observation?'\n\nObservação: '+clean(String(body.observation).slice(0,280)):''}\n\nPerfil do clube proponente: ${profile.href}`;
  const whatsapp_url='https://wa.me/55'+number+'?text='+encodeURIComponent(message);
  const proposal={id:randomUUID(),from_user_id:user.id,from_team_id:from.id,to_team_id:to.id,fromTrainer:user.name,toTrainer:contact.name,fromClub:from.name,toClub:to.name,offered,requested,cash_amount:cash,type:body.type==='emprestimo'?'emprestimo':'definitivo',status:'Pendente',createdAt:new Date().toISOString()};
  return {proposal,whatsapp_url};
}
// Defense in depth for legacy/custom documents: contact fields never enter public projections.
function publicData(value){
  if(Array.isArray(value))return value.map(publicData);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!/(phone|email|password|token|whatsapp|wa_?url|celular|telefone)/i.test(key)).map(([k,v])=>[k,publicData(v)]));
  return value;
}
module.exports={prepareProposal,publicData};
