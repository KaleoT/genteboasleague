const {parse}=require('csv-parse/sync');
const {createHash}=require('node:crypto');
const DEFAULT_URL='https://docs.google.com/spreadsheets/d/1elWrb2pUjUKOB8wZFQCVk4sb_2cA_x8F5hCyPRDA-dY/edit?usp=sharing';
const SHEETS={historico:'Player_Statistics_Summary',temporada2026:'Tabela_1'};
const fields=['posPts','oitavas','quartas','semi','conquista','vice','terceiro','vitorias','empates','gols','pontos'];
const norm=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function sheetId(input){
  let url;try{url=new URL(input);}catch{throw Error('Informe uma URL válida do Google Sheets.');}
  const match=/^\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,100})(?:\/|$)/.exec(url.pathname);
  if(url.protocol!=='https:' || url.hostname!=='docs.google.com' || url.port || url.username || url.password || !match)throw Error('Use uma URL HTTPS de planilha em docs.google.com/spreadsheets/d/ID.');
  return match[1];
}
function number(value,line,column){
  const text=String(value ?? '').trim();
  if(!text)return 0;
  const normalized=text.includes(',')?text.replace(/\./g,'').replace(',','.'):text;
  if(!/^\d+(?:\.\d+)?$/.test(normalized) || !Number.isFinite(Number(normalized)))throw Error(`Linha ${line}, coluna ${column}: número inválido "${text.slice(0,40)}".`);
  return Number(normalized);
}
function parseRanking(csv,view){
  let rows;
  try{rows=parse(csv,{bom:true,skip_empty_lines:true,relax_column_count:true,trim:true,max_record_size:20000});}
  catch{throw Error('CSV inválido: verifique aspas, separadores e linhas da planilha.');}
  rows=rows.filter(row=>row.some(cell=>cell.trim()));
  const header=rows.shift() || [];
  const expected=[['times','time','jogador','jogadores','nome','nome do time / jogador'],['posicao','posicao (pontos base)'],['oitavas'],['quartas'],['semi'],['conquista'],['vice'],['terceiro'],['vitorias'],['empate','empates'],['gols'],['pontos','pontos totais']];
  if(header.length<12 || expected.some((names,i)=>!names.includes(norm(header[i]))))throw Error('Cabeçalho inválido. Esperadas 12 colunas: TIMES, POSIÇÃO, OITAVAS, QUARTAS, SEMI, CONQUISTA, VICE, TERCEIRO, VITORIAS, EMPATE, GOLS, PONTOS.');
  if(!rows.length || rows.length>500)throw Error('A aba deve conter entre 1 e 500 participantes.');
  const seen=new Set();
  return rows.map((cells,index)=>{
    const name=String(cells[0] || '').trim();
    if(!name || name.length>120 || cells.length<12 || cells.slice(12).some(c=>c.trim()))throw Error(`Linha ${index+2}: nome ou quantidade de colunas inválidos.`);
    if(seen.has(norm(name)))throw Error(`Participante duplicado na planilha: ${name}.`);
    seen.add(norm(name));
    const row={id:'sheet_'+view+'_'+createHash('sha256').update(norm(name)).digest('hex').slice(0,16),name,source_name:name,ranking_detail:'',...Object.fromEntries(fields.map((field,i)=>[field,number(cells[i+1],index+2,i+2)]))};
    return row;
  }).sort((a,b)=>b.pontos-a.pontos || b.vitorias-a.vitorias || a.name.localeCompare(b.name,'pt-BR')).map((row,index)=>({...row,officialPos:index+1}));
}
async function download(id,sheet,fetcher=fetch){
  const url=new URL(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq`);
  url.searchParams.set('tqx','out:csv');url.searchParams.set('sheet',sheet);
  const response=await fetcher(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
  if(!response.ok)throw Error(`Google Sheets respondeu HTTP ${response.status}. Verifique se a planilha é pública.`);
  if(!(response.headers.get('content-type') || '').includes('csv'))throw Error('O Google não retornou CSV. Verifique o compartilhamento público e o nome da aba.');
  if(Number(response.headers.get('content-length') || 0)>2000000)throw Error('CSV maior que o limite de 2 MB.');
  let size=0;const chunks=[];
  for await(const chunk of response.body){size+=chunk.length;if(size>2000000)throw Error('CSV maior que o limite de 2 MB.');chunks.push(Buffer.from(chunk));}
  return Buffer.concat(chunks).toString('utf8');
}
async function importRankings(input,fetcher=fetch){
  const id=sheetId(input);
  const entries=await Promise.all(Object.entries(SHEETS).map(async([view,sheet])=>{
    try{return [view,parseRanking(await download(id,sheet,fetcher),view)];}
    catch(error){throw Error(`${sheet}: ${error.name==='TimeoutError'?'Tempo limite de conexão com o Google Sheets.':error.message}`);}
  }));
  const rankings=Object.fromEntries(entries);
  const fingerprint=view=>JSON.stringify(rankings[view].map(({id,officialPos,...row})=>row));
  return {rankings,source_url:`https://docs.google.com/spreadsheets/d/${id}/edit`,synced_at:new Date().toISOString(),warnings:fingerprint('historico')===fingerprint('temporada2026')?['As duas exportações retornaram os mesmos dados. Confira os nomes das abas na planilha; o Google pode retornar a primeira aba quando o nome solicitado não existe.']:[]};
}
module.exports={DEFAULT_URL,sheetId,parseRanking,importRankings};
