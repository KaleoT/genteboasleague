(()=>{
  const modal=document.createElement('div');modal.id='teamMediaModal';modal.className='modal';modal.hidden=true;
  modal.innerHTML='<section class="modal-box card secure-auth" role="dialog" aria-modal="true" aria-labelledby="teamMediaTitle"><h2 id="teamMediaTitle">Escudo e Uniformes</h2><p>Arraste uma imagem ou selecione o arquivo. PNG, JPEG, WEBP ou SVG, até 5 MB. A transparência será preservada.</p><label class="field">Clube<select id="mediaTeamSelect"></select></label><div id="mediaUploadFields"></div><p id="mediaUploadStatus" role="status" aria-live="polite"></p><button id="closeTeamMedia" class="btn btn-ghost" type="button">Fechar</button></section>';document.body.append(modal);
  const $=id=>document.getElementById(id),files={},blobs={},controls=[];let busy=false;
  const teams=()=>JSON.parse(GBLShared.getItem('gbl.squads.v2')||'[]');
  const fields=[['badge','Escudo','badge_url'],['home','Uniforme Casa','kit_home_3d_url'],['away','Uniforme Visitante','kit_away_3d_url']];
  function release(){for(const key of Object.keys(blobs)){URL.revokeObjectURL(blobs[key]);delete blobs[key];}for(const key of Object.keys(files))delete files[key];}
  function state(value){busy=value;controls.forEach(el=>el.disabled=value);$('mediaTeamSelect').disabled=value;$('closeTeamMedia').disabled=value;}
  function load(){release();const team=teams().find(t=>t.id===$('mediaTeamSelect').value);for(const [kind,,field] of fields){$('mediaPreview_'+kind).src=team?.[field]||(kind==='badge'?'assets/default-shield.svg':'assets/kit-'+kind+'-default.svg');$('mediaFile_'+kind).value='';$('mediaProgress_'+kind).value=0;}$('mediaUploadStatus').textContent='';}
  for(const [kind,label] of fields){
    const box=document.createElement('div');box.className='media-dropzone';const heading=document.createElement('h3');heading.textContent=label;
    const img=document.createElement('img');img.id='mediaPreview_'+kind;img.className='media-preview';img.alt='Prévia de '+label;
    const input=document.createElement('input');input.id='mediaFile_'+kind;input.type='file';input.accept='image/png,image/jpeg,image/webp,image/svg+xml';input.setAttribute('aria-label','Selecionar '+label);
    const progress=document.createElement('progress');progress.id='mediaProgress_'+kind;progress.max=100;progress.value=0;progress.setAttribute('aria-label','Progresso do envio de '+label);
    function select(file){if(busy)return;try{GBLUploads.validate(file);if(blobs[kind])URL.revokeObjectURL(blobs[kind]);blobs[kind]=GBLUploads.preview(file);files[kind]=file;img.src=blobs[kind];$('mediaUploadStatus').textContent='Prévia pronta. Clique em Enviar '+label+'.';}catch(e){RBAC.showToast(e.message);}}
    input.onchange=()=>{if(input.files?.[0])select(input.files[0]);};GBLUploads.dropzone(box,select);
    const send=document.createElement('button');send.type='button';send.className='btn btn-gold';send.textContent='Enviar '+label;
    const remove=document.createElement('button');remove.type='button';remove.className='btn btn-ghost';remove.textContent='Restaurar padrão';
    async function action(deleting){if(busy)return;const id=$('mediaTeamSelect').value;if(!deleting&&!files[kind])return RBAC.showToast('Selecione uma imagem antes de enviar.');state(true);send.setAttribute('aria-busy','true');try{
      await GBLShared.idle();$('mediaUploadStatus').textContent='Processando imagem no servidor…';
      if(deleting)await GBLUploads.remove(id,kind==='badge'?'badge':'kit',kind);else await GBLUploads.upload(id,kind==='badge'?'badge':'kit',files[kind],kind,p=>{progress.value=p;$('mediaUploadStatus').textContent=p<100?'Enviando: '+p+'%':'Processando e salvando imagem…';});
      load();$('mediaUploadStatus').textContent='Imagem atualizada para todos os usuários.';RBAC.showToast('Imagem atualizada com sucesso!','info');
    }catch(e){$('mediaUploadStatus').textContent=e.message;RBAC.showToast(e.message);}finally{state(false);send.removeAttribute('aria-busy');}}
    send.onclick=()=>action(false);remove.onclick=()=>action(true);controls.push(input,send,remove);box.append(heading,img,input,progress,send,remove);$('mediaUploadFields').append(box);
  }
  $('teamMediaBtn').onclick=()=>{const user=RBAC.getCurrentUser();if(!user||!RBAC.requireMember())return;$('mediaTeamSelect').replaceChildren(...teams().filter(t=>RBAC.isAdmin()||t.id===user.team_id).map(t=>new Option(t.name,t.id)));load();modal.hidden=false;};
  $('mediaTeamSelect').onchange=load;$('closeTeamMedia').onclick=()=>{if(!busy){release();modal.hidden=true;}};
  window.addEventListener('gbl:profilechange',()=>{const user=RBAC.getCurrentUser();$('teamMediaBtn').hidden=!RBAC.isIdentified()||user?.status==='pending_approval';if(!RBAC.isIdentified()){release();modal.hidden=true;}});
})();
