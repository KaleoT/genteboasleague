const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');

function setup(t){
  const root=path.join(__dirname,'..');
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:3000',runScripts:'outside-only'});
  t.after(()=>dom.window.close());
  const w=dom.window,$=id=>w.document.getElementById(id);
  let admin=false, fail=false, writes=0;
  const original={id:'article',placement:'hero',category:'MERCADO',timeAgo:'há 2 horas',author:'Autor original',title:'Título original',subtitle:'Resumo',body:'Corpo original',cover_url:'/uploads/news/old.webp',clubs:['Clube antigo'],relatedTab:'#ranking',bullets:['Preservar']};
  let news=[structuredClone(original)], revision=1;
  w.RBAC={isAdmin:()=>admin};
  w.GBLTeams={find:()=>null};
  const revoked=[];w.URL.createObjectURL=()=> 'blob:preview';w.URL.revokeObjectURL=url=>revoked.push(url);
  w.AbortSignal=AbortSignal;
  w.fetch=async(url,options)=>{
    writes++;
    assert.equal(url,'/api/news/article/upload-cover');assert.ok(options.body instanceof w.FormData);
    assert.equal(options.headers['Content-Type'],undefined);
    assert.equal(options.body.get('file').name,'capa.png');
    if(fail)return {ok:false,json:async()=>({message:'Sem conexão'})};
    const payload=JSON.parse(options.body.get('payload'));assert.equal(payload.revision,revision);
    news=news.map(n=>({...n,...payload.article,cover_url:'/uploads/news/new.webp'}));revision++;
    return {ok:true,json:async()=>({value:structuredClone(news),revision})};
  };
  w.GBLShared={
    getItem(key){return JSON.stringify(key==='gbl.news.v2'?news:key==='gbl.squads.v2'?[{id:'sq1',name:'Clube novo'}]:[]);},
    enqueue:work=>Promise.resolve().then(work),
    isLocalPreview:()=>false,
    hydrate(_key,value){news=value;},
    async request(url,options){
      if(url==='/api/state')return {news:{value:structuredClone(news),revision}};
      writes++;
      if(fail)throw Error('Sem conexão');
      const body=JSON.parse(options.body);assert.equal(body.revision,revision);news=body.value;revision++;
      return {value:structuredClone(news),revision};
    }
  };
  w.eval(fs.readFileSync(path.join(root,'js/uploads.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'js/news.js'),'utf8'));
  const select=(type='image/png',size=10)=>{
    const file=new w.File([new Uint8Array(size)],'capa.png',{type});
    Object.defineProperty($('newsCoverFile'),'files',{configurable:true,value:[file]});
    $('newsCoverFile').dispatchEvent(new w.Event('change'));return file;
  };
  const open=()=>w.document.querySelector('[data-open-article="article"]').click();
  const role=value=>{admin=value;w.dispatchEvent(new w.Event('gbl:rolechange'));};
  const submit=async()=>{
    $('newsInlineEditForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    await new Promise(r=>setTimeout(r,10));
  };
  return {w,$,open,role,submit,select,revoked,original,get news(){return news;},get writes(){return writes;},fail:()=>{fail=true;},concurrent:()=>{news[0].title='Alteração remota';}};
}

test('News editor is admin-only, cancels drafts and saves every field without dropping article metadata',async t=>{
  const s=setup(t),{$}=s;s.open();
  assert.equal($('editNewsArticleBtn').hidden,true);
  $('editNewsArticleBtn').click();assert.equal($('newsInlineEditForm').hidden,true);
  s.role(true);assert.equal($('editNewsArticleBtn').hidden,false);
  assert.equal($('editNewsArticleBtn').nextElementSibling.id,'closeNewsArticleFooterBtn');
  $('editNewsArticleBtn').click();const f=$('newsInlineEditForm');
  assert.equal(f.hidden,false);assert.equal($('newsModalBody').hidden,true);
  assert.equal($('newsCoverPreview').src,'http://localhost:3000'+s.original.cover_url);
  f.elements.title.value='Descartar';s.select();assert.equal($('newsCoverPreview').src,'blob:preview');
  assert.equal(s.writes,0);$('cancelNewsInlineEditBtn').click();assert.deepEqual(s.revoked,['blob:preview']);
  assert.equal(s.news[0].title,s.original.title);assert.equal(s.writes,0);
  $('editNewsArticleBtn').click();
  const values={title:'Título editado <script>',subtitle:'Novo resumo',body:'Primeiro parágrafo\nSegundo parágrafo',category:'TÁTICA & ELENCOS',author:'Outro autor',timeAgo:'Agora mesmo'};
  s.select();
  for(const [key,value]of Object.entries(values))f.elements[key].value=value;
  for(const input of f.querySelectorAll('[name="clubs"]'))input.checked=input.value==='Clube novo';
  await s.submit();
  assert.equal(s.writes,1);for(const [key,value]of Object.entries(values))assert.equal(s.news[0][key],value);
  assert.deepEqual(s.news[0].clubs,['Clube novo']);assert.deepEqual(s.news[0].bullets,['Preservar']);
  assert.equal(f.hidden,true);assert.ok($('newsModalBody').textContent.includes(values.title));
  assert.equal($('newsModalBody').querySelector('script'),null);
  assert.equal($('newsModalBody').querySelector('img.ge-modal-cover').getAttribute('src'),'http://localhost:3000/uploads/news/new.webp');
  assert.equal($('newsModalActionLink').dataset.tabLink,'ranking');
  assert.equal($('geHeroHeadlineWrap').querySelector('img').src,'http://localhost:3000/uploads/news/new.webp');
});

test('News editor validates files, keeps drafts after delivery failure and rejects conflicting changes',async t=>{
  const s=setup(t),{$}=s;s.role(true);s.open();$('editNewsArticleBtn').click();
  const f=$('newsInlineEditForm');f.elements.title.value='Rascunho';s.select('text/html');
  assert.equal(s.writes,0);assert.match($('newsInlineEditStatus').textContent,/PNG/);
  s.select('image/png',5*1024*1024+1);assert.match($('newsInlineEditStatus').textContent,/5 MB/);
  s.select();s.fail();await s.submit();
  assert.equal(f.hidden,false);assert.equal(f.elements.title.value,'Rascunho');assert.match($('newsInlineEditStatus').textContent,/Sem conexão/);
  assert.equal($('saveNewsInlineEditBtn').disabled,false);
  assert.equal($('newsCoverPreview').src,'blob:preview');
  s.concurrent();await s.submit();assert.equal(s.writes,1);assert.match($('newsInlineEditStatus').textContent,/outra pessoa/);
  s.role(false);assert.equal(f.hidden,true);assert.equal($('editNewsArticleBtn').hidden,true);
  await s.submit();assert.equal(s.writes,1);
});

test('Saving text without a selected file preserves the existing cover',async t=>{
  const s=setup(t);s.role(true);s.open();s.$('editNewsArticleBtn').click();
  s.$('newsInlineEditForm').elements.title.value='Somente texto';await s.submit();
  assert.equal(s.news[0].title,'Somente texto');assert.equal(s.news[0].cover_url,s.original.cover_url);assert.equal(s.writes,1);
});
