/* REST-backed in-memory projection. No shared data is persisted in the browser. */
window.GBLShared=(()=>{
  const keys={'gbl.squads.v2':'teams','gbl.clubs.v2':'limits','gbl.transfers.v2':'transfers','gbl.proposals.v2':'proposals','gbl.news.v2':'news','gbl.finals.v2':'finals','gbl.records.v2':'records','gbl.championships.active.v2':'active','gbl.championships.history.v2':'history','gbl.badges.v1':'badges','gbl.ranking.v2':'ranking','gbl.reservations.v1':'schedules'};
  let localPreview=false,lastError=null;
  let state={},queue=Promise.resolve(),pending=0,refreshing=false,events;
  window.addEventListener('beforeunload',event=>{if(pending){event.preventDefault();event.returnValue='';}});
  const clone=v=>JSON.parse(JSON.stringify(v));
  function status(message,error=false){let el=document.getElementById('sharedStatus');if(!el){el=document.createElement('div');el.id='sharedStatus';el.setAttribute('role','status');document.body.prepend(el);}el.textContent=message;el.hidden=!message;el.classList.toggle('error',error);}
  async function request(url,options={}){
    if(location.protocol==='file:')throw Error('Abra INICIAR-LIGA.cmd e acesse http://localhost:3000; o arquivo HTML nao fornece a API.');
    if(localPreview&&options.method&&!['GET','HEAD'].includes(options.method)&&url!=='/api/admin/migrate-backup')throw Error('Você está visualizando uma restauração local. Volte aos dados do servidor antes de editar.');
    const token=localStorage.getItem('gbl.accessToken.v1');
    const res=await fetch(url,{...options,signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
    if(!res.ok){const body=await res.json().catch(()=>({}));throw Object.assign(Error(body.message||'Não foi possível salvar os dados ('+res.status+').'),{status:res.status});}
    if(res.status!==204&&!String(res.headers.get('content-type')||'').includes('application/json'))throw Error('Este endereco nao esta servindo a API da liga. Abra pelo servidor Node.');
    return res.status===204?null:res.json();
  }
  async function refresh(){if(localPreview||pending||refreshing)return;refreshing=true;try{const snapshot=await request('/api/state');if(!snapshot?.teams||!Array.isArray(snapshot.teams.value))throw Error('Resposta inválida do servidor.');state=snapshot;lastError=null;if(localStorage.getItem('gbl.accessToken.v1')){const user=await request('/api/auth/me');window.dispatchEvent(new CustomEvent('gbl:sessionupdate',{detail:user}));state.proposals={value:user.status==='pending_approval'?[]:await request('/api/proposals'),revision:0};}else{state.proposals={value:[],revision:0};}window.dispatchEvent(new CustomEvent('gbl:datachange'));status('');}catch(e){lastError=e;if(e.status===401)window.dispatchEvent(new CustomEvent('gbl:sessioninvalid'));status('Falha ao atualizar: '+e.message+' Use “Recarregar dados”.',true);}finally{refreshing=false;}}
  function enqueue(work){pending++;status('Salvando no servidor…');const operation=queue.then(work);queue=operation.catch(e=>{status('Alteração não salva: '+e.message,true);const toast=document.getElementById('toast');if(toast){toast.textContent='Alteração não salva: '+e.message;toast.classList.add('show');}window.dispatchEvent(new CustomEvent('gbl:saveerror'));}).finally(async()=>{pending--;if(!pending)await refresh();});return operation;}
  function setItem(key,raw){const name=keys[key];if(!name)throw Error('Estado desconhecido: '+key);const value=JSON.parse(raw),before=state[name]?.value;if(JSON.stringify(before)===JSON.stringify(value))return;
    if(localPreview){status('Restauração local: alterações no servidor estão bloqueadas.');return;}
    state[name]={...state[name],value:clone(value)};
    enqueue(async()=>{
      if(name==='proposals'){
        const old=before||[];for(const p of value.filter(p=>!old.some(o=>o.id===p.id)))await request('/api/transfers/propose',{method:'POST',body:JSON.stringify({...p,to_team_id:window.GBLTeams.find(null,p.toClub)?.id})});
        for(const p of old.filter(p=>!value.some(o=>o.id===p.id)))await request('/api/proposals/'+encodeURIComponent(p.id),{method:'DELETE'});
      }else if(name==='transfers' && Array.isArray(before) && value.length===before.length+1){
        const item=value.find(v=>!before.some(b=>b.id===v.id));await request('/api/transfers/confirm',{method:'POST',body:JSON.stringify(item)});
      }else{
        const latest=await request('/api/state'),remote=latest[name];
        // Merge only changed rows. A row changed by another user is never overwritten.
        let merged=value;
        if(Array.isArray(before)&&Array.isArray(value)&&Array.isArray(remote.value)){
          const changed=new Set([...before,...value].filter(row=>JSON.stringify(before.find(x=>x.id===row.id))!==JSON.stringify(value.find(x=>x.id===row.id))).map(r=>r.id));
          for(const id of changed)if(JSON.stringify(before.find(x=>x.id===id))!==JSON.stringify(remote.value.find(x=>x.id===id)))throw Error('Este registro foi alterado por outra pessoa. Atualize e tente novamente.');
          merged=[...remote.value.filter(r=>!changed.has(r.id)),...value.filter(r=>changed.has(r.id))];
        }else if(JSON.stringify(before)!==JSON.stringify(remote.value))throw Error('Os dados mudaram. Atualize e tente novamente.');
        await request('/api/collections/'+name,{method:'PUT',body:JSON.stringify({revision:remote.revision,value:merged})});
      }
    }).catch(()=>{});
  }
  function connect(){if(events||!window.EventSource)return;events=new EventSource('/api/events');events.onmessage=()=>refresh();events.onerror=()=>status('Reconectando às atualizações do servidor…',true);}
  function hydrate(name,value){state[name]={...state[name],value:clone(value)};}
  function preview(values){localPreview=true;for(const [name,value] of Object.entries(values))hydrate(name,value);window.dispatchEvent(new CustomEvent('gbl:datachange'));}
  async function exitPreview(){localPreview=false;await refresh();}
  return {preview,exitPreview,isLocalPreview:()=>localPreview,getItem:key=>state[keys[key]]===undefined?null:JSON.stringify(state[keys[key]].value),setItem,request,refresh,hydrate,enqueue,connect,ready:async()=>{status('Carregando dados da liga…');await refresh();if(!state.teams)throw lastError||Error('Servidor indisponível');connect();},idle:()=>queue};
})();
