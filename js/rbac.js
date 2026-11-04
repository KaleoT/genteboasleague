/* Sessão validada pela API; nenhum perfil do localStorage concede privilégios. */
const RBAC = (() => {
  const PROFILE_KEY='gbl.profile.v1', USERS_KEY='gbl.users.v2', CURRENT_USER_KEY='gbl.currentUser.v1';
  const SQUADS_KEY='gbl.squads.v2', CLUBS_KEY='gbl.clubs.v2', TOKEN_KEY='gbl.accessToken.v1';
  const GUEST_KEY='gbl.guest.v1';
  const guest=()=>({id:'guest',name:'Visitante',role:'guest',team_id:null});
  let current=sessionStorage.getItem(GUEST_KEY)==='1' && !localStorage.getItem(TOKEN_KEY)?guest():null, users=[];
  const isGuest=()=>current?.role==='guest';
  function requireMember(){
    if(window.GBLShared?.isLocalPreview()){showToast('Restauração local: volte aos dados do servidor antes de interagir.','info');return false;}
    if(current?.status==='pending_approval'){showToast('Seu cadastro para assumir o '+current.teamName+' está em análise pelo administrador','info');return false;}
    if(current && !isGuest() && current.team_id)return true;
    showToast('Crie uma conta e vincule seu time para interagir com o mercado e agendamentos!', 'info');
    return false;
  }
  function enterGuest(){
    localStorage.removeItem(TOKEN_KEY);sessionStorage.setItem(GUEST_KEY,'1');
    current=guest();users=[];notify();
  }
  function forgetSession(){current=null;users=[];localStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(GUEST_KEY);notify();}
  const onlyDigits=value=>String(value || '').replace(/\D/g,'');
  async function request(path,options={}) {
    if(window.GBLShared?.isLocalPreview()&&options.method&&!['GET','HEAD'].includes(options.method)&&path!=='/api/admin/migrate-backup')throw Error('Restauração local: volte aos dados do servidor antes de editar.');
    if (location.protocol === 'file:') throw new Error('Abra o site em http://localhost:3000. O arquivo HTML aberto diretamente não tem acesso à API de times.');
    const token=localStorage.getItem(TOKEN_KEY);
    let response;
    try {
      response=await fetch(path,{...options,signal:options.signal || AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} : {}),...options.headers}});
    } catch {
      throw new Error('Não foi possível conectar à API. Verifique se o servidor está ativo e abra o site pelo endereço do backend.');
    }
    const contentType=response.headers.get('content-type') || '';
    if (response.status !== 204 && !contentType.includes('application/json')) {
      throw new Error('Este endereço não está servindo a API. Para o servidor local, abra http://localhost:3000.');
    }
    const data=response.status===204?null:await response.json();
    if (!response.ok) {
      if(response.status===401 && !path.endsWith('/login')) { current=null; localStorage.removeItem(TOKEN_KEY); notify(); window.GBLAuth?.open(); }
      const error=new Error(data?.message || 'Não foi possível concluir a solicitação.');error.status=response.status;throw error;
    }
    return data;
  }
  function getProfile(){return current && !isGuest() ? {user_name:current.name,whatsapp:current.phone,team_id:current.team_id,team_name:current.teamName,is_identified:true,role:current.role} : null;}
  const getCurrentUser=()=>current;
  const getCurrentUserId=()=>current?.id || '';
  const getRole=()=>current?.role || 'player';
  const isAdmin=()=>getRole()==='admin' && current?.status!=='pending_approval';
  const isIdentified=()=>Boolean(current) && !isGuest();
  const readUsers=()=>users;
  const AdminOnly=html=>isAdmin()?html:'';
  async function refreshUsers(){users=isAdmin()?await request('/api/admin/users'):current?[current]:[];return users;}
  window.addEventListener('gbl:sessionupdate',event=>{if(current&&current.id===event.detail?.id&&JSON.stringify(current)!==JSON.stringify(event.detail)){current=event.detail;notify();}});
  window.addEventListener('gbl:sessioninvalid',()=>{if(current&&!isGuest()){current=null;users=[];localStorage.removeItem(TOKEN_KEY);notify();window.GBLAuth?.open();}});
  function notify(){applyGuards();
    let banner=document.getElementById('pendingApprovalBanner');if(!banner){banner=document.createElement('div');banner.id='pendingApprovalBanner';banner.setAttribute('role','status');document.body.prepend(banner);}
    banner.hidden=current?.status!=='pending_approval';banner.textContent='⏳ Seu registro para comandar o time '+(current?.teamName||'')+' está aguardando liberação do administrador';window.dispatchEvent(new CustomEvent('gbl:rolechange'));window.dispatchEvent(new CustomEvent('gbl:profilechange'));}
  async function accept(session){sessionStorage.removeItem(GUEST_KEY);localStorage.setItem(TOKEN_KEY,session.access_token);current=session.user;await refreshUsers();notify();}
  async function restore(){if(!localStorage.getItem(TOKEN_KEY))return;current=await request('/api/auth/me');await refreshUsers();notify();}
  async function clearProfile(){try{if(localStorage.getItem(TOKEN_KEY))await request('/api/auth/logout',{method:'POST'});}finally{sessionStorage.removeItem(GUEST_KEY);current=null;users=[];localStorage.removeItem(TOKEN_KEY);notify();window.GBLAuth?.open();}}
  function showToast(msg, type = 'error') {
    const t = document.querySelector('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  /**
   * Modal personalizado de confirmação de exclusão (substitui o `confirm()` nativo do navegador).
   * Retorna uma `Promise<boolean>`.
   */
  let _confirmResolver = null;
  function confirmDelete({
    title = 'Confirmar Exclusão',
    message = 'Tem certeza que deseja excluir este registro?',
    confirmText = '🗑️ Sim, Excluir',
    cancelText = 'Cancelar',
  } = {}) {
    const modal = document.querySelector('#confirmDeleteModal');
    const titleEl = document.querySelector('#confirmDeleteTitle');
    const msgEl = document.querySelector('#confirmDeleteMessage');
    const okBtn = document.querySelector('#confirmDeleteOkBtn');
    const cancelBtn = document.querySelector('#confirmDeleteCancelBtn');

    if (!modal || !okBtn || !cancelBtn) {
      return Promise.resolve(false);
    }

    if (_confirmResolver) {
      _confirmResolver(false);
      _confirmResolver = null;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    okBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    modal.hidden = false;
    setTimeout(() => okBtn.focus(), 30);

    return new Promise((resolve) => {
      const cleanup = (result) => {
        modal.hidden = true;
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        modal.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKey);
        _confirmResolver = null;
        resolve(result);
      };

      const onOk = () => cleanup(true);
      const onCancel = () => cleanup(false);
      const onBackdrop = (e) => {
        if (e.target === modal) cleanup(false);
      };
      const onKey = (e) => {
        if (e.key === 'Escape') cleanup(false);
      };

      _confirmResolver = cleanup;
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      modal.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKey);
    });
  }

  /**
   * Guard de ação (Mock Backend / Action Guard)
   */
  function requireAdmin(actionDescription = 'realizar esta ação') {
    if (isAdmin()) return true;
    showToast(`🔒 Acesso restrito a administradores para ${actionDescription}.`, 'error');
    return false;
  }

  /**
   * Aplica proteção visual na página e nos elementos marcados com `[data-admin-only]`.
   */
  function applyGuards() {
    const admin = isAdmin();
    document.body.classList.toggle('role-guest', isGuest());
    document.body.classList.toggle('role-admin', admin);
    document.body.classList.toggle('role-player', !admin);

    document.querySelectorAll('[data-admin-only]').forEach((el) => {
      if (el.classList.contains('page')) {
        if (!admin) el.hidden = true;
      } else {
        el.hidden = !admin;
      }
    });
  }

  /**
   * Cadastra um novo usuário assumindo `role: "player"` por padrão (a menos que um admin defina outro role).
   */

  return {forgetSession,isGuest,enterGuest,requireMember,PROFILE_KEY,USERS_KEY,CURRENT_USER_KEY,SQUADS_KEY,CLUBS_KEY,onlyDigits,readUsers,getProfile,isIdentified,clearProfile,getCurrentUserId,getCurrentUser,getRole,isAdmin,AdminOnly,requireAdmin,applyGuards,showToast,confirmDelete,request,accept,restore,refreshUsers};
})();
const GBLBadges = (() => {
  const BADGES_KEY = 'gbl.badges.v1';
  const SQUADS_KEY = 'gbl.squads.v2';
  const CLUBS_KEY = 'gbl.clubs.v2';
  const RANKING_KEY = 'gbl.ranking.v2';
  const DEFAULT_PLACEHOLDER = 'assets/default-shield.svg';

  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function readBadgesMap() {
    try {
      const raw = GBLShared.getItem(BADGES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeBadgesMap(mapObj) {
    GBLShared.setItem(BADGES_KEY, JSON.stringify(mapObj || {}));
  }

  // Remove somente cópias que já estão preservadas no mapa central.
  // Assim liberamos espaço sem apagar escudos antigos ou outros dados dos clubes.
  function compactBadgeCopies(map) {
    [SQUADS_KEY, CLUBS_KEY, RANKING_KEY].forEach((key) => {
      try {
        const raw = GBLShared.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw);
        const rows = Array.isArray(data) ? data : [
          ...(data.historico || []), ...(data.temporada2026 || []),
        ];
        let changed = false;
        rows.forEach((row) => {
          const name = norm(row.name);
          if (!Object.prototype.hasOwnProperty.call(map, name)) return;
          ['badge_url', 'shield_image', 'custom_shield'].forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(row, field)) {
              delete row[field];
              changed = true;
            }
          });
        });
        if (changed) GBLShared.setItem(key, JSON.stringify(data));
      } catch {}
    });
  }

  function getInitials(teamName) {
    const words = String(teamName || '')
      .replace(/\b(fc|sc|ec|ac|md|m\.d|cf|de|da|do)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'GB';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  /**
   * Busca informações visuais e a URL do escudo (`badge_url` / `shield_image`) de qualquer clube por nome, ID ou objeto.
   */
  function getClubBadgeData(clubOrName) {
    const map = readBadgesMap();
    let name = '';
    let id = '';
    let directBadge = '';
    let primaryColor = '';
    let secondaryColor = '';

    if (clubOrName && typeof clubOrName === 'object') {
      name = String(clubOrName.name || clubOrName.teamName || '').trim();
      id = String(clubOrName.id || clubOrName.team_id || '').trim();
      directBadge = String(clubOrName.badge_url || clubOrName.shield_image || clubOrName.custom_shield || '').trim();
      primaryColor = clubOrName.primaryColor || '';
      secondaryColor = clubOrName.secondaryColor || '';
    } else {
      name = String(clubOrName || '').trim();
      id = name;
    }

    const keyName = norm(name);
    const keyId = norm(id);

    const hasMappedName = Object.prototype.hasOwnProperty.call(map, keyName);
    const hasMappedId = Object.prototype.hasOwnProperty.call(map, keyId);
    let hasMappedBadge = hasMappedName || hasMappedId;
    let customUrl = hasMappedName ? map[keyName] : hasMappedId ? map[keyId] : directBadge;

    try {
      const squads = JSON.parse(GBLShared.getItem(SQUADS_KEY) || '[]');
      const found = squads.find(
        (s) => (keyId && norm(s.id) === keyId) || (keyName && norm(s.name) === keyName)
      );
      if (found) {
        name = found.name || name;
        if (!id) id = found.id;
        if (!primaryColor) primaryColor = found.primaryColor || '';
        if (!secondaryColor) secondaryColor = found.secondaryColor || '';
        const foundName = norm(found.name);
        if (Object.prototype.hasOwnProperty.call(map, foundName)) {
          customUrl = map[foundName];
          hasMappedBadge = true;
        }
        if (!customUrl && !hasMappedBadge) {
          const fromSquad = String(found.badge_url || found.shield_image || found.custom_shield || '').trim();
          const fromMapBySquadName = map[norm(found.name)] || map[norm(found.id)] || '';
          customUrl = fromSquad || fromMapBySquadName || '';
        }
      }
    } catch {}

    if (customUrl === DEFAULT_PLACEHOLDER) {
      customUrl = '';
    }

    const hasCustom = Boolean(customUrl && customUrl.length > 0);
    return {
      id,
      name: name || 'Clube GBL',
      initials: getInitials(name),
      badge_url: hasCustom ? customUrl : DEFAULT_PLACEHOLDER,
      shield_image: hasCustom ? customUrl : DEFAULT_PLACEHOLDER,
      customUrl,
      hasCustom,
      primaryColor: primaryColor || '#1e40af',
      secondaryColor: secondaryColor || '#f5c84c',
    };
  }

  /**
   * Atualiza ou remove (`badgeUrl = ''`) o escudo de um clube e propaga para todas as coleções no LocalStorage.
   */
  function setClubBadge(clubIdOrName, badgeUrl) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('gerenciar escudos dos clubes')) {
      return false;
    }

    const cleanUrl = String(badgeUrl || '').trim();
    const targetKey = norm(clubIdOrName);
    if (!targetKey) return false;

    const map = readBadgesMap();
    let matchedName = '';
    let matchedId = '';
    try {
      const squads = JSON.parse(GBLShared.getItem(SQUADS_KEY) || '[]');
      const clubs = JSON.parse(GBLShared.getItem(CLUBS_KEY) || '[]');
      const found = [...squads, ...clubs].find(
        (club) => norm(club.id) === targetKey || norm(club.name) === targetKey
      );
      if (found) {
        matchedName = found.name;
        matchedId = found.id;
      }
      // As versões anteriores guardavam a mesma imagem por nome e por ID.
      [...squads, ...clubs].forEach((club) => {
        const name = norm(club.name);
        const id = norm(club.id);
        if (id !== name && map[name] !== undefined && map[id] === map[name]) delete map[id];
      });
      writeBadgesMap(map);
      compactBadgeCopies(map);

      // Uma única imagem por clube. O valor vazio também prevalece sobre cópias antigas.
      const key = norm(matchedName || clubIdOrName);
      map[key] = cleanUrl;
      if (matchedId && norm(matchedId) !== key) delete map[norm(matchedId)];
      writeBadgesMap(map);
    } catch {
      if (typeof RBAC !== 'undefined') {
        RBAC.showToast('Não foi possível salvar o escudo. O armazenamento do navegador pode estar cheio. Tente uma imagem menor.', 'error');
      }
      return false;
    }
    compactBadgeCopies(map);

    window.dispatchEvent(
      new CustomEvent('gbl:badgechange', {
        detail: { clubId: matchedId || clubIdOrName, clubName: matchedName || clubIdOrName, badge_url: cleanUrl },
      })
    );
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    return true;
  }

  function removeClubBadge(clubIdOrName) {
    return setClubBadge(clubIdOrName, '');
  }

  /**
   * Fallback automático `onError` para tags `<img>` de escudos
   */
  function onImgError(imgEl, clubOrName = '') {
    if (!imgEl) return;
    imgEl.onerror = null;
    if (imgEl.getAttribute('src') !== DEFAULT_PLACEHOLDER) {
      imgEl.src = DEFAULT_PLACEHOLDER;
    }
    imgEl.classList.remove('has-custom-badge');
    imgEl.classList.add('is-placeholder-shield');

    const shell = imgEl.closest('.gbl-aspect-crest') || imgEl.closest('#fifaCrestCircle') || imgEl.parentElement;
    if (shell) {
      shell.classList.remove('is-custom-crest', 'has-custom-badge');
      shell.classList.add('is-default-crest', 'is-placeholder-shield');
      const info = getClubBadgeData(clubOrName || imgEl.alt || '');
      shell.style.background = `radial-gradient(circle at 30% 25%, ${info.primaryColor || '#1e40af'}, #051131 88%)`;
      shell.style.borderColor = info.secondaryColor || '#f5c84c';
    }
  }

  /**
   * Renderiza a tag `<img>` padronizada (`aspect-square`, `object-contain`) com fallback `onError`.
   */
  function renderBadgeImg(clubOrName, extraClass = '') {
    const info = getClubBadgeData(clubOrName);
    const stateCls = info.hasCustom ? 'has-custom-badge' : 'is-placeholder-shield';
    const altText = info.hasCustom ? `Escudo ${info.name}` : `Emblema padrão ${info.name}`;
    const onErrorAttr = info.hasCustom
      ? `onerror="window.GBLBadges &amp;&amp; window.GBLBadges.onImgError(this);"`
      : '';
    return `<img src="${escapeHtml(info.badge_url)}" alt="${escapeHtml(altText)}" class="gbl-badge-img ${stateCls} ${escapeHtml(extraClass)}" loading="lazy" ${onErrorAttr} />`;
  }

  /**
   * Renderiza um container completo de escudo circular/quadrado com proporção 1:1.
   * Se existir escudo importado: renderiza única e exclusivamente a imagem do escudo enviado, sem qualquer fundo ou borda residual.
   * Se NÃO existir escudo importado: renderiza o emblema padrão da liga com cores oficiais como fallback.
   */
  function renderCrestShell(clubOrName, { shellClass = 'gbl-crest-shell', imgClass = '' } = {}) {
    const info = getClubBadgeData(clubOrName);
    if (info.hasCustom) {
      return `<span class="${escapeHtml(shellClass)} gbl-aspect-crest is-custom-crest has-custom-badge" title="${escapeHtml(info.name)}"><img src="${escapeHtml(info.badge_url)}" alt="Escudo ${escapeHtml(info.name)}" class="gbl-badge-img has-custom-badge ${escapeHtml(imgClass)}" loading="lazy" onerror="window.GBLBadges &amp;&amp; window.GBLBadges.onImgError(this);" /></span>`;
    }

    const bgStyle = `background: radial-gradient(circle at 30% 25%, ${escapeHtml(info.primaryColor || '#1e40af')}, #051131 88%); border-color: ${escapeHtml(info.secondaryColor || '#f5c84c')};`;
    return `<span class="${escapeHtml(shellClass)} gbl-aspect-crest is-default-crest is-placeholder-shield" style="${bgStyle}" title="${escapeHtml(info.name)}"><img src="${DEFAULT_PLACEHOLDER}" alt="Emblema padrão ${escapeHtml(info.name)}" class="gbl-badge-img is-placeholder-shield ${escapeHtml(imgClass)}" loading="lazy" /></span>`;
  }

  /**
   * Cria uma prévia temporária de imagem local (PNG, JPG, WEBP, SVG)
   * sem persistir arquivos ou gerar Base64.
   */
  function processUploadedBadgeFile(file){
    // Compatibility helper for previews only: never create or persist Base64.
    return new Promise((resolve,reject)=>{try{window.GBLUploads.validate(file);resolve(URL.createObjectURL(file));}catch(error){reject(error);}});
  }

  return {
    BADGES_KEY,
    DEFAULT_PLACEHOLDER,
    getInitials,
    getClubBadgeData,
    setClubBadge,
    removeClubBadge,
    onImgError,
    renderBadgeImg,
    renderCrestShell,
    processUploadedBadgeFile,
  };
})();

window.GBLBadges = GBLBadges;
