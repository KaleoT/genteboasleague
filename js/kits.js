/* Uniformes 3D: o cadastro de elencos é a fonte única das imagens. */
window.GBLKits = (() => {
  const KEY = 'gbl.squads.v2';
  const sides = ['home', 'away'];
  const $ = (id) => document.getElementById(id);
  const field = (side) => `kit_${side}_3d_url`;
  const fallback = (side) => `assets/kit-${side}-default.svg`;
  const escape = (value) => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = () => JSON.parse(GBLShared.getItem(KEY) || '[]');
  let version = 0;
  let pending = { home: '', away: '' };
  let busy = 0;
  const files={home:null,away:null},blobs={home:'',away:''},dirty={home:false,away:false};
  const toast = (message, type = 'error') => RBAC.showToast(message, type);
  function valid(url) {
    if (!url || /^(\/uploads\/(badges|kits)\/|assets\/|blob:)/.test(url)) return true;
    if (/^data:image\/(png|jpeg|webp);base64,/i.test(url)) return true;
    try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; }
  }
  function validateImage(url) {
    return new Promise((resolve, reject) => {
      if (!valid(url)) return reject(new Error('Link inválido. Use uma URL HTTP/HTTPS direta de imagem.'));
      const img = new Image();
      const timeout = setTimeout(() => reject(new Error('A imagem demorou para carregar. Verifique o link.')), 15000);
      img.onload = () => { clearTimeout(timeout); resolve(); };
      img.onerror = () => { clearTimeout(timeout); reject(new Error('Não foi possível carregar a imagem. Verifique o arquivo ou link.')); };
      img.src = url;
    });
  }
  function render3DKitShowcase(kitTextureUrl, primaryColor, secondaryColor, label, variant = 'home') {
    const uidKit = Math.random().toString(36).slice(2, 8);
    const texUrl = kitTextureUrl || '';
    const mainCol = primaryColor || (variant === 'away' ? '#f8fafc' : '#991b1b');
    const accentCol = secondaryColor || (variant === 'away' ? '#1e3a8a' : '#f5c84c');

    return `
      <div class="fifa-kit-3d-card">
        <div class="fifa-kit-3d-badge">${escape(label)}</div>
        <div class="fifa-kit-3d-viewport kit-showcase-scene" data-kit-side="${variant}">
          <svg class="fifa-kit-3d-svg" viewBox="0 0 210 245" aria-label="Uniforme 3D ${escape(label)}">
            <defs>
              <!-- Recorte 3D do Torso da Camisa -->
              <clipPath id="torsoClip_${uidKit}">
                <path d="M 62 24 L 83 20 C 90 34 120 34 127 20 L 148 24 L 154 58 L 147 148 Q 105 155 63 148 L 56 58 Z" />
              </clipPath>
              <!-- Recorte 3D da Manga Esquerda -->
              <clipPath id="sleeveLClip_${uidKit}">
                <path d="M 62 24 L 56 58 L 34 86 L 14 70 L 38 30 Z" />
              </clipPath>
              <!-- Recorte 3D da Manga Direita -->
              <clipPath id="sleeveRClip_${uidKit}">
                <path d="M 148 24 L 172 30 L 196 70 L 176 86 L 154 58 Z" />
              </clipPath>
              <!-- Recorte 3D do Calção (Shorts) -->
              <clipPath id="shortsClip_${uidKit}">
                <path d="M 65 150 Q 105 156 145 150 L 153 206 L 111 210 L 105 178 L 99 210 L 57 206 Z" />
              </clipPath>

              <!-- Iluminação Cilíndrica 3D para Volume de Manequim -->
              <linearGradient id="cylShade_${uidKit}" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#000000" stop-opacity="0.46" />
                <stop offset="18%" stop-color="#000000" stop-opacity="0.08" />
                <stop offset="48%" stop-color="#ffffff" stop-opacity="0.18" />
                <stop offset="82%" stop-color="#000000" stop-opacity="0.1" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.48" />
              </linearGradient>

              <!-- Brilho Superior de Estúdio no Peito -->
              <radialGradient id="chestLight_${uidKit}" cx="50%" cy="28%" r="55%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
                <stop offset="65%" stop-color="#ffffff" stop-opacity="0.0" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.28" />
              </radialGradient>

              <!-- Sombra Projetada no Piso (Pedestal 3D) -->
              <radialGradient id="floorShadow_${uidKit}" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#000000" stop-opacity="0.78" />
                <stop offset="55%" stop-color="#000000" stop-opacity="0.32" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
              </radialGradient>
            </defs>

            <!-- Pedestal e Sombra Projetada no Chão -->
            <ellipse cx="105" cy="229" rx="68" ry="11" fill="url(#floorShadow_${uidKit})" />
            <ellipse cx="105" cy="229" rx="46" ry="5.5" fill="none" stroke="${escape(accentCol)}" stroke-opacity="0.35" stroke-width="1.2" />

            <!-- Interior Escuro da Gola (Profundidade do Pescoço) -->
            <path d="M 81 19 Q 105 14 129 19 Q 120 35 105 35 Q 90 35 81 19 Z" fill="#090d16" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />

            <!-- CALÇÃO 3D (Mapeado a partir da textura UV ou cor do clube) -->
            <g clip-path="url(#shortsClip_${uidKit})">
              <rect x="50" y="145" width="110" height="72" fill="${escape(mainCol)}" />
              <!-- Perna Esquerda do Calção na folha UV -->
              ${texUrl ? `<image href="${escape(texUrl)}" x="44" y="54" width="320" height="170" preserveAspectRatio="none" onerror="this.remove()" />` : ''}
              <!-- Sombreamento 3D e Vincos do Calção -->
              <rect x="50" y="145" width="110" height="72" fill="url(#cylShade_${uidKit})" />
              <path d="M 65 154 Q 105 160 145 154" fill="none" stroke="rgba(0,0,0,0.45)" stroke-width="3" />
            </g>
            <path d="M 65 150 Q 105 156 145 150 L 153 206 L 111 210 L 105 178 L 99 210 L 57 206 Z"
                  fill="none" stroke="rgba(255,255,255,0.24)" stroke-width="1.3" stroke-linejoin="round" />

            <!-- MANGA ESQUERDA 3D -->
            <g clip-path="url(#sleeveLClip_${uidKit})">
              <rect x="10" y="20" width="60" height="70" fill="${escape(mainCol)}" />
              ${texUrl ? `<image href="${escape(texUrl)}" x="-54" y="-58" width="320" height="250" preserveAspectRatio="none" onerror="this.remove()" />` : ''}
              <rect x="10" y="20" width="60" height="70" fill="url(#cylShade_${uidKit})" />
            </g>
            <path d="M 62 24 L 56 58 L 34 86 L 14 70 L 38 30 Z"
                  fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.3" stroke-linejoin="round" />
            <path d="M 14 70 L 34 86" stroke="${escape(accentCol)}" stroke-width="3.2" stroke-linecap="round" />

            <!-- MANGA DIREITA 3D -->
            <g clip-path="url(#sleeveRClip_${uidKit})">
              <rect x="140" y="20" width="60" height="70" fill="${escape(mainCol)}" />
              ${texUrl ? `<image href="${escape(texUrl)}" x="-56" y="-58" width="320" height="250" preserveAspectRatio="none" onerror="this.remove()" />` : ''}
              <rect x="140" y="20" width="60" height="70" fill="url(#cylShade_${uidKit})" />
            </g>
            <path d="M 148 24 L 172 30 L 196 70 L 176 86 L 154 58 Z"
                  fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.3" stroke-linejoin="round" />
            <path d="M 196 70 L 176 86" stroke="${escape(accentCol)}" stroke-width="3.2" stroke-linecap="round" />

            <!-- TORSO FRONTAL 3D (Mapeia o centro da textura PES) -->
            <g clip-path="url(#torsoClip_${uidKit})">
              <rect x="52" y="18" width="106" height="138" fill="${escape(mainCol)}" />
              ${texUrl ? `<image href="${escape(texUrl)}" x="-82" y="-128" width="374" height="312" preserveAspectRatio="none" onerror="this.remove()" />` : ''}
              <!-- Iluminação Volumétrica 3D + Dobras Realistas de Tecido -->
              <rect x="52" y="18" width="106" height="138" fill="url(#cylShade_${uidKit})" />
              <rect x="52" y="18" width="106" height="138" fill="url(#chestLight_${uidKit})" />
              <path d="M 64 56 Q 82 68 74 118" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="2.2" filter="blur(1px)" />
              <path d="M 146 56 Q 128 68 136 118" fill="none" stroke="rgba(0,0,0,0.22)" stroke-width="2.2" filter="blur(1px)" />
              <path d="M 78 136 Q 105 143 132 136" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.6" />
            </g>

            <!-- Contorno 3D do Torso + Gola Olímpica em Relevo -->
            <path d="M 62 24 L 83 20 C 90 34 120 34 127 20 L 148 24 L 154 58 L 147 148 Q 105 155 63 148 L 56 58 Z"
                  fill="none" stroke="rgba(255,255,255,0.36)" stroke-width="1.6" stroke-linejoin="round" />
            <path d="M 83 20 C 90 34 120 34 127 20"
                  fill="none" stroke="${escape(accentCol)}" stroke-width="3.6" stroke-linecap="round" />
          </svg>
        </div>
        <div class="fifa-kit-3d-meta">
          <span class="kit-swatch-dot" style="background:${escape(mainCol)}; border-color:${escape(accentCol)}"></span>
          <span class="fifa-kit-caption">${escape(label)} · 3D Kit</span>
        </div>
      </div>`;
  }

  function render(club, side) {
    const label = side === 'home' ? 'Casa' : 'Visitante';
    const url = valid(club[field(side)]) && club[field(side)]!==fallback(side) ? club[field(side)] : '';
    return render3DKitShowcase(url, side === 'home' ? '#cbd5e1' : '#64748b', '#e2e8f0', label, side);
  }
  function updateBusy() { if ($('kitsSaveBtn')) $('kitsSaveBtn').disabled = busy > 0; }
  function preview(side) {
    $(`kitsPreview_${side}`).innerHTML = render({ name: 'Prévia', [field(side)]: pending[side] }, side);
  }
  function load() {
    version++;
    busy = 0;
    updateBusy();
    const club = read().find(c => c.id === $('kitsClubSelect').value);
    sides.forEach(side => {
      if(blobs[side])URL.revokeObjectURL(blobs[side]);blobs[side]='';files[side]=null;dirty[side]=false;
      pending[side] = club?.[field(side)] || '';
      $(`kitsFile_${side}`).value = '';
      $(`kitsUrl_${side}`).value = pending[side].startsWith('data:') ? '' : pending[side];
      preview(side);
    });
    $('kitsStatus').textContent = '';
  }
  function refresh() {
    if (!RBAC.isAdmin()) return;
    const select = $('kitsClubSelect');
    const previous = select.value;
    select.innerHTML = read().map(c => `<option value="${escape(c.id)}">${escape(c.name)}</option>`).join('');
    if ([...select.options].some(o => o.value === previous)) select.value = previous;
    load();
  }
  async function save(id,values){
    if(!RBAC.requireAdmin('gerenciar uniformes 3D'))return false;
    if(!sides.every(side=>!values[side]||/^(https?:\/\/|\/uploads\/|assets\/)/.test(values[side]))){toast('Use URLs públicas ou envie o arquivo.');return false;}
    try{await RBAC.request('/api/teams/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({kit_home_3d_url:values.home||'assets/kit-home-default.svg',kit_away_3d_url:values.away||'assets/kit-away-default.svg'})});await GBLShared.refresh();window.dispatchEvent(new CustomEvent('gbl:kitschange'));return true;}catch(error){toast(error.message);return false;}
  }
  $('kitsClubSelect')?.addEventListener('change', () => { if (RBAC.requireAdmin('editar uniformes')) load(); });
  sides.forEach(side => {
    $(`kitsUrl_${side}`)?.addEventListener('input', e => {
      if (!RBAC.requireAdmin('editar uniformes')) return;
      files[side]=null;dirty[side]=true;version++; busy = 0; updateBusy();
      pending[side] = e.target.value.trim();
      $(`kitsFile_${side}`).value = '';
      preview(side);
    });
    $(`kitsReset_${side}`)?.addEventListener('click', () => {
      if (!RBAC.requireAdmin('restaurar uniformes')) return;
      files[side]=null;dirty[side]=true;version++; busy = 0; updateBusy(); pending[side] = '';
      $(`kitsUrl_${side}`).value = ''; $(`kitsFile_${side}`).value = ''; preview(side);
      $('kitsStatus').textContent = 'Padrão selecionado. Clique em Salvar Uniformes para confirmar.';
    });
    function selectFile(file){
      try{GBLUploads.validate(file);if(blobs[side])URL.revokeObjectURL(blobs[side]);blobs[side]=GBLUploads.preview(file);files[side]=file;dirty[side]=true;pending[side]=blobs[side];$(`kitsUrl_${side}`).value='';preview(side);$('kitsStatus').textContent='Prévia local pronta. Clique em Salvar Uniformes para enviar.';}catch(error){toast(error.message);}
    }
    $(`kitsFile_${side}`)?.addEventListener('change',e=>{if(RBAC.requireAdmin('enviar uniformes')&&e.target.files?.[0])selectFile(e.target.files[0]);});
    window.GBLUploads?.dropzone($(`kitsFile_${side}`)?.closest('label'),selectFile);
  });
  $('clubKitsForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!RBAC.requireAdmin('salvar uniformes') || busy) return;
    const request = version;
    const id = $('kitsClubSelect').value;
    const values = { ...pending };
    busy++; updateBusy();
    try {
      await GBLShared.idle();
      for(const side of sides){
        if(!dirty[side])continue;
        if(files[side])await GBLUploads.upload(id,'kit',files[side],side,p=>{$('kitsStatus').textContent='Enviando '+(side==='home'?'Casa':'Visitante')+': '+p+'%…';});
        else if(!values[side])await GBLUploads.remove(id,'kit',side);
        else {if(!/^(https?:\/\/|\/uploads\/|assets\/)/.test(values[side]))throw Error('Use uma URL pública ou envie o arquivo.');await RBAC.request('/api/teams/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify({[field(side)]:values[side]})});await GBLShared.refresh();}
        if(request!==version)return;dirty[side]=false;
      }
      $('kitsStatus').textContent='Uniformes salvos no servidor.';toast('Uniformes 3D atualizados com sucesso!','info');
    } catch (error) { if (request === version) toast(error.message); }
    finally { if (request === version) { busy--; updateBusy(); } }
  });
  return { refresh, render, save, valid };
})();
