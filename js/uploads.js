window.GBLUploads=(()=>{
  const types=['image/png','image/jpeg','image/webp','image/svg+xml'];
  function validate(file){if(!file||!types.includes(file.type))throw Error('Envie PNG, JPEG, WEBP ou SVG.');if(file.size>5*1024*1024)throw Error('O arquivo excede o limite de 5 MB.');}
  function preview(file){validate(file);return URL.createObjectURL(file);}
  function allowed(id){const user=RBAC.getCurrentUser();if(GBLShared.isLocalPreview())throw Error('Volte aos dados do servidor antes de enviar imagens.');if(!user||user.status==='pending_approval'||user.role==='guest'||!RBAC.isAdmin()&&user.team_id!==id)throw Error('Você só pode enviar imagens para sua própria equipe.');}
  async function sync(result){
    const teams=JSON.parse(GBLShared.getItem('gbl.squads.v2')||'[]').map(t=>t.id===result.team.id?result.team:t);GBLShared.hydrate('teams',teams);
    const map=JSON.parse(GBLShared.getItem('gbl.badges.v1')||'{}');map[result.team.name.trim().toLowerCase()]=result.team.badge_url;map[result.team.id]=result.team.badge_url;GBLShared.hydrate('badges',map);
    window.dispatchEvent(new CustomEvent('gbl:datachange'));window.dispatchEvent(new CustomEvent('gbl:badgechange'));window.dispatchEvent(new CustomEvent('gbl:kitschange'));await GBLShared.refresh();return result;
  }
  function upload(id,kind,file,side,onProgress=()=>{}){
    try{allowed(id);validate(file);}catch(e){return Promise.reject(e);}
    return new Promise((resolve,reject)=>{
      const data=new FormData();data.append('file',file);if(kind==='kit')data.append('kit_type',side);
      const xhr=new XMLHttpRequest();xhr.open('POST','/api/teams/'+encodeURIComponent(id)+'/upload-'+kind);xhr.timeout=60000;xhr.setRequestHeader('Authorization','Bearer '+localStorage.getItem('gbl.accessToken.v1'));
      xhr.upload.onprogress=e=>onProgress(e.lengthComputable?Math.round(e.loaded/e.total*100):0);
      xhr.onerror=()=>reject(Error('Falha de conexão durante o envio.'));xhr.ontimeout=()=>reject(Error('O envio demorou demais. Tente novamente.'));xhr.onabort=()=>reject(Error('Envio cancelado.'));
      xhr.onload=()=>{let result;try{result=JSON.parse(xhr.responseText);}catch{return reject(Error('Resposta inválida do servidor.'));}if(xhr.status<200||xhr.status>=300)return reject(Error(result.message||'Não foi possível enviar a imagem.'));sync(result).then(resolve,reject);};xhr.send(data);
    });
  }
  async function remove(id,kind,side){allowed(id);const result=await RBAC.request('/api/teams/'+encodeURIComponent(id)+'/'+(kind==='badge'?'badge':'kit/'+side),{method:'DELETE'});return sync(result);}
  function dropzone(el,accept){if(!el)return;el.classList.add('media-dropzone');el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('dragover');});el.addEventListener('dragleave',()=>el.classList.remove('dragover'));el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('dragover');const file=e.dataTransfer.files?.[0];if(file)try{validate(file);accept(file);}catch(error){RBAC.showToast(error.message);}});}
  return {validate,preview,upload,remove,dropzone};
})();
