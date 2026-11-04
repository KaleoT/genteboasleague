/* ===== Gente Boa's League — Onboarding, Autenticação, RBAC, Painel Admin & Propostas via WhatsApp ===== */
(() => {
  let sendingProposal=false;
  const PROPOSALS_KEY = 'gbl.proposals.v2';
  const SQUADS_KEY = 'gbl.squads.v2';
  const CLUBS_KEY = 'gbl.clubs.v2';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Persistência Auxiliar ---------- */
  function readSquads() {
    try {
      return JSON.parse(GBLShared.getItem(SQUADS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function writeSquads(list) {
    window.GBLTeams ? window.GBLTeams.save(list) : GBLShared.setItem(SQUADS_KEY, JSON.stringify(list));
  }

  function readClubs() {
    try {
      return JSON.parse(GBLShared.getItem(CLUBS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function writeClubs(list) {
    GBLShared.setItem(CLUBS_KEY, JSON.stringify(list));
  }

  function readUsers() {
    return RBAC.readUsers();
  }


  function getCurrentUser() {
    return RBAC.getCurrentUser();
  }

  function getClubByTeamId(teamId) {
    return readSquads().find((s) => s.id === teamId || norm(s.name) === norm(teamId)) || null;
  }

  function getManagerUserByTeamId(teamId) {
    return readUsers().find((u) => u.team_id === teamId) || null;
  }

  function readProposals() {
    try {
      return JSON.parse(GBLShared.getItem(PROPOSALS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function writeProposals(list) {
    GBLShared.setItem(PROPOSALS_KEY, JSON.stringify(list));
  }

  /* ---------- Utilitários de Formatação e Máscara ---------- */
  function getInitials(teamName) {
    const words = String(teamName || '')
      .replace(/\b(fc|sc|ec|ac|md|cf|de|da|do)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'GB';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function normalizeNationalWhatsapp(rawPhone) {
    let digits = String(rawPhone || '').replace(/\D+/g, '');
    if (!digits) return '';
    if (digits.startsWith('55') && digits.length >= 12) {
      digits = digits.slice(2);
    }
    return digits.slice(0, 11);
  }

  /**
   * Aplica máscara automática `(XX) XXXXX-XXXX` ao digitar
   */
  function applyWhatsappMask(rawValue) {
    const d = normalizeNationalWhatsapp(rawValue);
    if (!d.length) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  }

  function formatPhoneDisplay(rawPhone) {
    const nat = normalizeNationalWhatsapp(rawPhone);
    if (!nat) return 'Sem WhatsApp cadastrado';
    if (nat.length === 11) {
      return `+55 (${nat.slice(0, 2)}) ${nat.slice(2, 7)}-${nat.slice(7)}`;
    }
    if (nat.length === 10) {
      return `+55 (${nat.slice(0, 2)}) ${nat.slice(2, 6)}-${nat.slice(6)}`;
    }
    return `+55 ${nat}`;
  }

  function showToast(msg, type = 'info') {
    RBAC.showToast(msg, type);
  }

  function openOnboardingModal(){ window.GBLAuth.open(); }
  function closeOnboardingModal(){ window.GBLAuth.close(); }
  $('#resetProfileBtn')?.addEventListener('click', () => {if(RBAC.isGuest())window.GBLAuth.open();else RBAC.clearProfile().catch(error=>showToast(error.message));});
  window.addEventListener('gbl:profilechange', renderAuthUI);
  /* ---------- Estado do Modal Fazer Proposta ---------- */
  const proposalState = {
    targetTeamId: '',
    negoType: 'definitivo',
    offeredPlayers: new Set(),
    requestedPlayers: new Set(),
  };

  /* ---------- Renderização do Header de Autenticação + Guards RBAC ---------- */
  window.addEventListener('gbl:datachange',()=>{renderAuthUI();});
  function renderAuthUI() {
    RBAC.applyGuards();

    const profile = RBAC.getProfile();
    const user = getCurrentUser();
    const crestEl = $('#authHeaderCrest');
    const labelEl = $('#authHeaderLabel');
    const clubEl = $('#authHeaderClub');
    const roleEl = $('#authHeaderRole');
    const resetBtn = $('#resetProfileBtn');
    const proposeBtn = $('#openProposalModalBtn');
    const loginHintBtn = $('#loginToProposeHintBtn');

    if (profile && user && user.team_id) {
      const club = getClubByTeamId(user.team_id);
      const clubName = club?.name || profile.team_name || user.teamName || 'Clube Vinculado';
      const isAdmin = RBAC.isAdmin();

      if (crestEl) {
        const badgeInfo = typeof window.GBLBadges !== 'undefined' ? window.GBLBadges.getClubBadgeData(club || clubName) : null;
        if (badgeInfo && badgeInfo.hasCustom) {
          crestEl.innerHTML = window.GBLBadges.renderBadgeImg(club || clubName, 'gbl-badge-img has-custom-badge');
          crestEl.style.background = 'transparent';
          crestEl.style.borderColor = 'transparent';
          crestEl.classList.add('gbl-aspect-crest', 'is-custom-crest', 'has-custom-badge');
          crestEl.classList.remove('is-default-crest', 'is-placeholder-shield');
        } else {
          crestEl.innerHTML = typeof window.GBLBadges !== 'undefined'
            ? window.GBLBadges.renderBadgeImg(club || clubName, 'gbl-badge-img is-placeholder-shield')
            : escapeHtml(getInitials(clubName));
          crestEl.style.background = `radial-gradient(circle at 30% 25%, ${club?.primaryColor || '#22e07a'}, #051238 88%)`;
          crestEl.style.borderColor = club?.secondaryColor || '#f5c84c';
          crestEl.classList.remove('has-custom-badge', 'is-custom-crest');
          crestEl.classList.add('gbl-aspect-crest', 'is-default-crest', 'is-placeholder-shield');
        }
      }
      if (labelEl) labelEl.textContent = profile.user_name || user.name;
      if (clubEl) clubEl.textContent = clubName;
      if (roleEl) {
        roleEl.hidden = false;
        roleEl.textContent = isAdmin ? 'ADMIN' : 'PLAYER';
        roleEl.classList.toggle('is-admin', isAdmin);
        roleEl.classList.toggle('is-player', !isAdmin);
      }
      if (resetBtn) resetBtn.hidden = false;
      if (proposeBtn) proposeBtn.hidden = false;
      if (loginHintBtn) loginHintBtn.hidden = true;
    } else {
      if (crestEl) {
        crestEl.textContent = '👤';
        crestEl.style.background = 'rgba(255,255,255,0.12)';
        crestEl.style.color = '#ffffff';
      }
      if (labelEl) labelEl.textContent = 'Não identificado';
      if (clubEl) clubEl.textContent = 'Vincular Clube';
      if (roleEl) roleEl.hidden = true;
      if (resetBtn) resetBtn.hidden = true;

      if (proposeBtn) proposeBtn.hidden = true;
      if (loginHintBtn) loginHintBtn.hidden = false;
    }

    if(RBAC.isGuest()) {
      if(crestEl)crestEl.textContent='👁';
      if(labelEl)labelEl.textContent='Visitante';
      if(clubEl)clubEl.textContent='Navegação pública';
      if(roleEl){roleEl.hidden=false;roleEl.textContent='Modo Visitante';roleEl.classList.remove('is-admin','is-player');}
      if(resetBtn){resetBtn.hidden=false;resetBtn.textContent='Fazer Login / Cadastrar Time';resetBtn.title='Entrar ou cadastrar seu time';}
      if(proposeBtn)proposeBtn.hidden=false;
      if(loginHintBtn)loginHintBtn.hidden=true;
    } else if(resetBtn){resetBtn.textContent='Sair';resetBtn.title='Sair da conta';}
    const sendButton=$('#sendProposalWhatsapp');if(sendButton)sendButton.disabled=sendingProposal||!RBAC.isIdentified()||user?.status==='pending_approval'||!user?.team_id;
    if(!RBAC.isIdentified()){const result=$('#whatsappProposalResult');if(result){result.hidden=true;result.replaceChildren();}}
    renderProposalsHistory();
    renderAdminDashboard();
  }

  /* ---------- Botão "Painel Admin" no Header ---------- */
  $('#openAdminPanelBtn')?.addEventListener('click', () => {
    if (!RBAC.requireAdmin('acessar o Painel Admin')) return;
    location.hash = '#admin';
  });

  $('#openAuthModalBtn')?.addEventListener('click', () => window.GBLAuth.open());
  $('#loginToProposeHintBtn')?.addEventListener('click', openOnboardingModal);
  /* ---------- PAINEL ADMIN (#admin) — Gestão Centralizada ---------- */
  function renderAdminDashboard() {
    if (!RBAC.isAdmin()) return;

    const squads = readSquads();
    const clubs = readClubs();
    const users = readUsers();

    const clubOptions = squads
      .map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.manager)})</option>`)
      .join('');

    if ($('#admNewUserTeam')) $('#admNewUserTeam').innerHTML = clubOptions;

    const originSel = $('#admRosterOriginClub');
    const targetSel = $('#admRosterTargetClub');
    const quickSel = $('#admQuickClubSelect');
    if (originSel && !originSel.value) originSel.innerHTML = clubOptions;
    else if (originSel) {
      const prev = originSel.value;
      originSel.innerHTML = clubOptions;
      if (squads.some((s) => s.id === prev)) originSel.value = prev;
    }

    if (targetSel) {
      const prevT = targetSel.value;
      targetSel.innerHTML = clubOptions;
      if (squads.some((s) => s.id === prevT)) targetSel.value = prevT;
      else if (squads.length > 1) targetSel.selectedIndex = 1;
    }

    if (quickSel) {
      const prevQ = quickSel.value;
      quickSel.innerHTML = clubOptions;
      if (squads.some((s) => s.id === prevQ)) quickSel.value = prevQ;
    }

    const usersListEl = $('#adminUsersList');
    if (usersListEl) {
      usersListEl.innerHTML = users
        .map((u) => {
          const teamOpts = squads
            .map(
              (s) =>
                `<option value="${escapeHtml(s.id)}" ${s.id === u.team_id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`
            )
            .join('');

          return `
            <div class="admin-user-row" data-adm-user-id="${escapeHtml(u.id)}">
              <div class="adm-user-main">
                <input type="text" class="adm-input adm-u-name" value="${escapeHtml(u.name)}" title="Nome do usuário" />
                <input type="tel" class="adm-input adm-u-phone" value="${escapeHtml(u.phone || '')}" placeholder="WhatsApp (DDD+Número)" title="WhatsApp" />
              </div>
              <div class="adm-user-controls">
                <select class="select-input adm-u-team" title="Time vinculado (team_id)">
                  ${teamOpts}
                </select>
                <select class="select-input adm-u-role ${u.role === 'admin' ? 'role-sel-admin' : ''}" title="Papel RBAC">
                  <option value="player" ${u.role !== 'admin' ? 'selected' : ''}>player</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                </select>
                <div class="adm-user-btns">
                  <button type="button" class="btn btn-primary btn-sm" data-adm-save-user="${escapeHtml(u.id)}">Salvar</button>
                  <button type="button" class="club-action-btn danger adm-u-del-btn" data-adm-delete-user="${escapeHtml(u.id)}" title="Excluir cadastro deste usuário">🗑️</button>
                </div>
              </div>
            </div>`;
        })
        .join('');
    }

    const selectMeta = $('#admSelectClubForMeta');
    if (selectMeta) {
      const curVal = selectMeta.value;
      selectMeta.innerHTML = squads
        .map(
          (s) =>
            `<option value="${escapeHtml(s.id)}" ${s.id === curVal ? 'selected' : ''}>${escapeHtml(s.name)} (${escapeHtml(s.manager || 'Sem Dono')})</option>`
        )
        .join('');
    }

    const clubsWrap = $('#adminClubsTableWrap');
    if (clubsWrap) {
      clubsWrap.innerHTML = squads
        .map((sq) => {
          const transferClub = clubs.find((c) => norm(c.name) === norm(sq.name));
          const maxTrades = transferClub ? Number(transferClub.maxTrades) || 3 : 3;
          const reserves = transferClub ? transferClub.reserves ?? 5 : 5;
          const badgeImgHtml =
            typeof window.GBLBadges !== 'undefined'
              ? window.GBLBadges.renderBadgeImg(sq, 'gbl-badge-img')
              : escapeHtml(getInitials(sq.name));

          const calcOvr =
            sq.roster && sq.roster.length
              ? Math.round(sq.roster.reduce((sum, p) => sum + (Number(p.ovr) || 80), 0) / sq.roster.length)
              : 80;
          const displayOvr =
            Number(sq.customOvr || sq.avgOvr) > 0 ? Math.round(Number(sq.customOvr || sq.avgOvr)) : calcOvr;
          const displayStars = (Number(sq.stars) || 4).toFixed(1).replace('.0', '');
          const shortCaptain = sq.captain ? sq.captain.split('(')[0].trim() : '—';

          return `
            <div class="admin-club-card" data-adm-squad-id="${escapeHtml(sq.id)}" data-adm-orig-name="${escapeHtml(sq.name)}">
              <div class="adm-club-head">
                <span class="mp-crest gbl-aspect-crest" style="background:radial-gradient(circle at 30% 25%, ${escapeHtml(sq.primaryColor || '#22e07a')}, #051238 88%)">${badgeImgHtml}</span>
                <input type="text" class="adm-input adm-c-name" value="${escapeHtml(sq.name)}" title="Nome do Clube" />
                <input type="color" class="adm-color-picker adm-c-color" value="${escapeHtml(sq.primaryColor || '#22e07a')}" title="Cor do Escudo" />
              </div>
              <div class="adm-club-fields">
                <label>
                  <small>Dono / Treinador</small>
                  <input type="text" class="adm-input adm-c-manager" value="${escapeHtml(sq.manager || '')}" />
                </label>
                <label>
                  <small>Limite Trocas</small>
                  <input type="number" class="adm-input adm-c-trades" value="${maxTrades}" min="0" max="20" />
                </label>
                <label>
                  <small>Vagas Reserva</small>
                  <input type="number" class="adm-input adm-c-reserves" value="${reserves}" min="0" max="30" />
                </label>
              </div>
              <div class="adm-club-meta-badges">
                <span class="badge-mini-gold" title="Estrelas do Clube">${displayStars}★</span>
                <span class="badge-mini-blue" title="Overall Médio">OVR ${displayOvr}</span>
                <span class="badge-mini-sub" title="Capitão e Esquema">${escapeHtml(shortCaptain)} · ${escapeHtml(sq.formation || '4-3-3')}</span>
              </div>
              <div class="adm-club-action-btns">
                <button type="button" class="btn btn-secondary btn-sm" data-adm-edit-metadata="${escapeHtml(sq.id)}" title="Editar todos os atributos e textos do banner">
                  ⚙️ Editar Dados do Clube
                </button>
                <button type="button" class="btn btn-primary btn-sm" data-adm-save-club="${escapeHtml(sq.id)}" title="Salvar alterações rápidas deste card">
                  💾 Salvar Rápido
                </button>
              </div>
            </div>`;
        })
        .join('');
    }

    const badgesWrap = $('#adminBadgesGridWrap');
    if (badgesWrap && typeof window.GBLBadges !== 'undefined') {
      badgesWrap.innerHTML = squads
        .map((sq) => {
          const info = window.GBLBadges.getClubBadgeData(sq);
          const badgeImgHtml = window.GBLBadges.renderBadgeImg(sq, 'gbl-badge-img');
          return `
            <article class="admin-badge-card ${info.hasCustom ? 'has-custom-badge' : ''}" data-adm-badge-club="${escapeHtml(sq.id)}">
              <div class="admin-badge-preview-stage">
                <div class="admin-badge-circle gbl-aspect-crest" style="border-color:${escapeHtml(sq.secondaryColor || '#f5c84c')}">
                  ${badgeImgHtml}
                </div>
                <span class="admin-badge-status ${info.hasCustom ? 'is-custom' : 'is-placeholder'}">
                  ${info.hasCustom ? '✓ Escudo Personalizado' : '🛡️ Placeholder Padrão'}
                </span>
              </div>
              <div class="admin-badge-info">
                <strong>${escapeHtml(sq.name)}</strong>
                <small>Treinador: ${escapeHtml(sq.manager || '—')}</small>
              </div>
              <div class="admin-badge-actions">
                <button type="button" class="btn btn-primary btn-sm" data-adm-open-badge="${escapeHtml(sq.id)}">
                  📷 ${info.hasCustom ? 'Editar Escudo' : 'Adicionar Escudo'}
                </button>
                ${
                  info.hasCustom
                    ? `<button type="button" class="btn btn-danger-outline btn-sm" data-adm-remove-badge="${escapeHtml(sq.id)}" title="Remover escudo personalizado e restaurar padrão">
                        🗑️ Remover
                      </button>`
                    : ''
                }
              </div>
            </article>
          `;
        })
        .join('');
    }

    renderAdminRosterManager();
  }

  function renderAdminRosterManager() {
    const originSel = $('#admRosterOriginClub');
    const playerSel = $('#admRosterPlayerSelect');
    const listEl = $('#adminRosterPlayersList');
    const badgeEl = $('#admRosterCountBadge');
    if (!originSel || !playerSel || !listEl) return;

    const squads = readSquads();
    const club = squads.find((s) => s.id === originSel.value) || squads[0];
    if (!club) return;

    const roster = [...(club.roster || [])].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0));
    if (badgeEl) badgeEl.textContent = `${club.name}: ${roster.length} atletas`;

    playerSel.innerHTML = roster.length
      ? roster.map((p) => `<option value="${escapeHtml(p.id)}">[${escapeHtml(p.pos)} · OVR ${escapeHtml(p.ovr)}] ${escapeHtml(p.name)}</option>`).join('')
      : `<option value="">Nenhum atleta no elenco</option>`;

    listEl.innerHTML = roster
      .map(
        (p) => `
        <div class="adm-roster-item">
          <span class="prop-chip-ovr">${escapeHtml(p.ovr)}</span>
          <span class="prop-chip-pos">${escapeHtml(p.pos)}</span>
          <strong class="adm-r-name">${escapeHtml(p.name)}</strong>
          <button type="button" class="club-action-btn danger" data-adm-remove-player="${escapeHtml(p.id)}" data-adm-club="${escapeHtml(club.id)}" title="Remover jogador do elenco">✕</button>
        </div>`
      )
      .join('');
  }

  $('#adminSubTabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-admin-pane]');
    if (!btn) return;
    if (!RBAC.requireAdmin('navegar no Painel Admin')) return;
    const pane = btn.dataset.adminPane;
    document.querySelectorAll('#adminSubTabs .pill').forEach((p) => p.classList.toggle('active', p === btn));
    $('#adminPaneUsers').hidden = pane !== 'users';
    $('#adminPaneClubs').hidden = pane !== 'clubs';
    $('#adminPaneRosters').hidden = pane !== 'rosters';
    if ($('#adminPaneBadges')) $('#adminPaneBadges').hidden = pane !== 'badges';
    if ($('#adminPaneKits')) $('#adminPaneKits').hidden = pane !== 'kits';
    if ($('#adminPaneBackup')) $('#adminPaneBackup').hidden = pane !== 'backup';
    if(pane==='backup')window.GBLBackup?.refreshPoints();
    if ($('#adminPaneAccess')) $('#adminPaneAccess').hidden = pane !== 'access';
    if(pane==='access')window.GBLAdmission?.refresh();
    if ($('#adminPaneSync')) $('#adminPaneSync').hidden = pane !== 'sync';
    if (pane === 'kits') window.GBLKits?.refresh();
  });

  $('#openBadgeManagerFromAdminBtn')?.addEventListener('click', () => {
    if (!RBAC.requireAdmin('gerenciar escudos dos clubes')) return;
    const badgeTabBtn = document.querySelector('#adminSubTabs [data-admin-pane="badges"]');
    if (badgeTabBtn) badgeTabBtn.click();
    if (typeof window.GBLBadgeModal !== 'undefined') {
      window.GBLBadgeModal.open();
    }
  });

  $('#openBadgeModalFromPaneBtn')?.addEventListener('click', () => {
    if (!RBAC.requireAdmin('gerenciar escudos dos clubes')) return;
    if (typeof window.GBLBadgeModal !== 'undefined') {
      window.GBLBadgeModal.open();
    }
  });

  $('#adminBadgesGridWrap')?.addEventListener('click', async (e) => {
    const openBtn = e.target.closest('[data-adm-open-badge]');
    if (openBtn) {
      if (!RBAC.requireAdmin('editar escudos dos clubes')) return;
      window.GBLBadgeModal?.open(openBtn.dataset.admOpenBadge);
      return;
    }

    const remBtn = e.target.closest('[data-adm-remove-badge]');
    if (remBtn) {
      if (!RBAC.requireAdmin('remover escudos dos clubes')) return;
      const clubId = remBtn.dataset.admRemoveBadge;
      const club = getClubByTeamId(clubId);
      try{await GBLUploads.remove(clubId,'badge');}catch(error){showToast(error.message);return;}
      renderAdminDashboard();
      showToast(`Escudo de "${club?.name || 'Clube'}" removido e restaurado ao padrão da liga.`, 'info');
    }
  });

  $('#adminNewUserForm')?.remove();
  $('#adminUsersList')?.addEventListener('click', async e => {
    const del=e.target.closest('[data-adm-delete-user]');
    const save=e.target.closest('[data-adm-save-user]');
    if (!del && !save) return;
    if (!RBAC.requireAdmin('gerenciar usuários')) return;
    try {
      if(del){
        if(!await RBAC.confirmDelete({message:'Excluir este cadastro e liberar seu time?'}))return;
        await RBAC.request('/api/admin/users/'+encodeURIComponent(del.dataset.admDeleteUser),{method:'DELETE'});
      } else {
        const row=save.closest('[data-adm-user-id]');
        const updated = await RBAC.request('/api/admin/users/'+encodeURIComponent(save.dataset.admSaveUser),{method:'PATCH',body:JSON.stringify({name:row.querySelector('.adm-u-name').value,phone:row.querySelector('.adm-u-phone').value,team_id:row.querySelector('.adm-u-team').value,role:row.querySelector('.adm-u-role').value})});
        window.GBLTeams.save(readSquads().map(club=>club.id===updated.team_id?{...club,manager:updated.name}:club));
        window.dispatchEvent(new CustomEvent('gbl:datachange'));
      }
      await RBAC.restore();renderAuthUI();showToast(save?'Dados do clube e treinador atualizados com sucesso em todas as seções!':'Cadastro atualizado.','info');
    }catch(error){showToast(error.message);}
  });
  $('#openEditClubMetaModalBtn')?.addEventListener('click', () => {
    if (!RBAC.requireAdmin('editar dados de clubes')) return;
    const selectedClubId = $('#admSelectClubForMeta')?.value;
    if (window.GBLClubMetadataModal) {
      window.GBLClubMetadataModal.open(selectedClubId);
    }
  });

  $('#adminClubsTableWrap')?.addEventListener('click', (e) => {
    const editMetaBtn = e.target.closest('[data-adm-edit-metadata]');
    if (editMetaBtn) {
      if (!RBAC.requireAdmin('editar dados de clubes')) return;
      const squadId = editMetaBtn.dataset.admEditMetadata;
      if (window.GBLClubMetadataModal) {
        window.GBLClubMetadataModal.open(squadId);
      }
      return;
    }

    const btn = e.target.closest('[data-adm-save-club]');
    if (!btn) return;
    if (!RBAC.requireAdmin('editar dados de clubes')) return;

    const squadId = btn.dataset.admSaveClub;
    const card = btn.closest('[data-adm-squad-id]');
    if (!card) return;

    const origName = card.dataset.admOrigName;
    const newName = card.querySelector('.adm-c-name').value.trim();
    const newColor = card.querySelector('.adm-c-color').value;
    const newManager = card.querySelector('.adm-c-manager').value.trim();
    const newMaxTrades = Math.max(0, Number(card.querySelector('.adm-c-trades').value) || 3);
    const newReserves = Math.max(0, Number(card.querySelector('.adm-c-reserves').value) || 5);

    if (!newName) return showToast('O nome do clube não pode ficar vazio.', 'error');

    const squads = readSquads().map((s) =>
      s.id === squadId ? { ...s, name: newName, primaryColor: newColor, manager: newManager } : s
    );
    writeSquads(squads);

    const clubs = readClubs();
    const existingIdx = clubs.findIndex((c) => norm(c.name) === norm(origName) || norm(c.name) === norm(newName));
    if (existingIdx >= 0) {
      clubs[existingIdx] = { ...clubs[existingIdx], name: newName, maxTrades: newMaxTrades, reserves: newReserves };
    } else {
      clubs.push({ id: 'c_' + uid(), name: newName, maxTrades: newMaxTrades, reserves: newReserves });
    }
    writeClubs(clubs);

    renderAuthUI();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast("Dados do clube e treinador atualizados com sucesso em todas as seções!", 'info');
  });

  $('#admRosterOriginClub')?.addEventListener('change', renderAdminRosterManager);

  $('#adminTransferPlayerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!RBAC.requireAdmin('transferir jogadores manualmente')) return;

    const originId = $('#admRosterOriginClub').value;
    const playerId = $('#admRosterPlayerSelect').value;
    const targetId = $('#admRosterTargetClub').value;

    if (!originId || !targetId || !playerId) {
      return showToast('Selecione o clube de origem, o atleta e o clube de destino.', 'error');
    }
    if (originId === targetId) {
      return showToast('Escolha um clube de destino diferente do clube de origem.', 'error');
    }

    const squads = readSquads();
    const originClub = squads.find((s) => s.id === originId);
    const targetClub = squads.find((s) => s.id === targetId);
    const player = originClub?.roster?.find((p) => p.id === playerId);

    if (!originClub || !targetClub || !player) return;

    originClub.roster = originClub.roster.filter((p) => p.id !== playerId);
    if (!Array.isArray(targetClub.roster)) targetClub.roster = [];
    targetClub.roster.push(player);

    writeSquads(squads);
    renderAdminRosterManager();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast(`"${player.name}" transferido do ${originClub.name} para ${targetClub.name}!`, 'info');
  });

  $('#adminQuickAddPlayerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!RBAC.requireAdmin('adicionar jogadores')) return;

    const clubId = $('#admQuickClubSelect').value;
    const name = $('#admQuickPlayerName').value.trim();
    const pos = $('#admQuickPlayerPos').value;
    const ovr = Math.max(50, Math.min(99, Number($('#admQuickPlayerOvr').value) || 84));

    if (!name) return showToast('Informe o nome do atleta.', 'error');

    const squads = readSquads();
    const club = squads.find((s) => s.id === clubId);
    if (!club) return;

    if (!Array.isArray(club.roster)) club.roster = [];
    club.roster.push({ id: 'p_' + uid(), name, pos, ovr });

    writeSquads(squads);
    $('#admQuickPlayerName').value = '';
    $('#admRosterOriginClub').value = clubId;
    renderAdminRosterManager();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast(`"${name}" adicionado ao elenco do ${club.name}!`, 'info');
  });

  $('#adminRosterPlayersList')?.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('[data-adm-remove-player]');
    if (!delBtn) return;
    if (!RBAC.requireAdmin('remover jogadores')) return;

    const playerId = delBtn.dataset.admRemovePlayer;
    const clubId = delBtn.dataset.admClub;
    const squads = readSquads();
    const club = squads.find((s) => s.id === clubId);
    const player = club?.roster?.find((p) => p.id === playerId);
    if (!club || !player) return;

    const ok = await RBAC.confirmDelete({
      title: 'Remover Jogador do Elenco',
      message: `Deseja remover "${player.name}" (${player.pos} · OVR ${player.ovr}) do elenco do ${club.name}?`,
      confirmText: '🗑️ Remover Jogador',
    });
    if (!ok) return;

    club.roster = club.roster.filter((p) => p.id !== playerId);
    writeSquads(squads);
    renderAdminRosterManager();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast(`"${player.name}" removido do ${club.name}.`, 'info');
  });

  /* ---------- Modal: Fazer Proposta de Transferência (WhatsApp) ---------- */
  function openProposalModal() {
    if(!RBAC.requireMember())return;
    const profile = RBAC.getProfile();
    const user = getCurrentUser();
    if (!profile || !user || !user.team_id) {
      showToast('Identifique-se e vincule seu clube antes de fazer uma proposta.', 'error');
      openOnboardingModal();
      return;
    }

    const squads = readSquads();
    const originClub = getClubByTeamId(profile.team_id || user.team_id);
    if (!originClub) {
      return showToast('Clube vinculado não encontrado.', 'error');
    }

    const senderName = profile.user_name || user.name;
    const senderWhatsapp = formatPhoneDisplay(profile.whatsapp || user.phone);

    const crestEl = $('#propOriginCrest');
    if (crestEl) {
      const badgeInfo = typeof window.GBLBadges !== 'undefined' ? window.GBLBadges.getClubBadgeData(originClub) : null;
      if (badgeInfo && badgeInfo.hasCustom) {
        crestEl.innerHTML = window.GBLBadges.renderBadgeImg(originClub, 'gbl-badge-img has-custom-badge');
        crestEl.style.background = 'transparent';
        crestEl.style.borderColor = 'transparent';
        crestEl.classList.add('gbl-aspect-crest', 'is-custom-crest', 'has-custom-badge');
        crestEl.classList.remove('is-default-crest', 'is-placeholder-shield');
      } else {
        crestEl.innerHTML = typeof window.GBLBadges !== 'undefined'
          ? window.GBLBadges.renderBadgeImg(originClub, 'gbl-badge-img is-placeholder-shield')
          : escapeHtml(getInitials(originClub.name));
        crestEl.style.background = `radial-gradient(circle at 30% 25%, ${originClub.primaryColor || '#22e07a'}, #051238 88%)`;
        crestEl.style.borderColor = originClub.secondaryColor || '#f5c84c';
        crestEl.classList.remove('has-custom-badge', 'is-custom-crest');
        crestEl.classList.add('gbl-aspect-crest', 'is-default-crest', 'is-placeholder-shield');
      }
    }
    $('#propOriginTeamName').textContent = originClub.name;
    $('#propOriginManagerName').textContent = `Treinador: ${senderName} · ${senderWhatsapp}`;

    const opponents = squads.filter((s) => s.id !== originClub.id);
    const targetSelect = $('#propTargetTeamSelect');
    targetSelect.innerHTML = opponents
      .map((c) => {
        const oppUser = getManagerUserByTeamId(c.id);
        const mgrName = oppUser?.name || c.manager;
        return `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} (Treinador: ${escapeHtml(mgrName)})</option>`;
      })
      .join('');

    proposalState.targetTeamId = opponents[0]?.id || '';
    proposalState.negoType = 'definitivo';
    proposalState.offeredPlayers.clear();
    proposalState.requestedPlayers.clear();

    document.querySelectorAll('#propTypeToggle .nego-opt').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.negoType === 'definitivo');
    });
    $('#propLoanPeriodWrap').hidden = true;
    $('#propLoanPeriod').value = '';
    $('#propObservation').value = '';

    renderOriginPlayersPicker(originClub);
    renderTargetPlayersPicker();
    $('#proposalModal').hidden = false;
  }

  function closeProposalModal() {
    $('#proposalModal').hidden = true;
  }

  function renderOriginPlayersPicker(originClub) {
    const container = $('#propOfferPlayersList');
    const counter = $('#propOfferCounter');
    if (!container || !originClub) return;

    const roster = [...(originClub.roster || [])].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0));
    counter.textContent = `${proposalState.offeredPlayers.size} / 5`;

    container.innerHTML = roster
      .map((p) => {
        const selected = proposalState.offeredPlayers.has(p.name);
        return `
          <button type="button" class="prop-player-chip ${selected ? 'selected' : ''}" data-offer-player="${escapeHtml(p.name)}">
            <span class="prop-chip-ovr">${escapeHtml(p.ovr)}</span>
            <span class="prop-chip-pos">${escapeHtml(p.pos)}</span>
            <span class="prop-chip-name">${escapeHtml(p.name)}</span>
            <span class="prop-chip-check">${selected ? '✓' : '+'}</span>
          </button>`;
      })
      .join('');
  }

  function renderTargetPlayersPicker() {
    const container = $('#propRequestPlayersList');
    const counter = $('#propRequestCounter');
    const infoEl = $('#propTargetManagerInfo');
    if (!container) return;

    const targetClub = getClubByTeamId(proposalState.targetTeamId);
    const targetUser = getManagerUserByTeamId(proposalState.targetTeamId);

    if (infoEl && targetClub) {
      const managerName = targetUser?.name || targetClub.manager || 'Treinador';
      infoEl.replaceChildren();
      const label=document.createElement('span');label.textContent='👔 Treinador: '+managerName;
      const hint=document.createElement('span');hint.className='wa-status-pill';hint.textContent='Contato consultado com segurança ao enviar.';
      infoEl.append(label,hint);
    }

    const roster = [...(targetClub?.roster || [])].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0));
    counter.textContent = `${proposalState.requestedPlayers.size} / 5`;

    container.innerHTML = roster
      .map((p) => {
        const selected = proposalState.requestedPlayers.has(p.name);
        return `
          <button type="button" class="prop-player-chip ${selected ? 'selected' : ''}" data-request-player="${escapeHtml(p.name)}">
            <span class="prop-chip-ovr">${escapeHtml(p.ovr)}</span>
            <span class="prop-chip-pos">${escapeHtml(p.pos)}</span>
            <span class="prop-chip-name">${escapeHtml(p.name)}</span>
            <span class="prop-chip-check">${selected ? '✓' : '+'}</span>
          </button>`;
      })
      .join('');
  }

  $('#openProposalModalBtn')?.addEventListener('click', openProposalModal);
  $('#closeProposalModal')?.addEventListener('click', closeProposalModal);
  $('#cancelProposalBtn')?.addEventListener('click', closeProposalModal);
  $('#proposalModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'proposalModal') closeProposalModal();
  });

  $('#propTargetTeamSelect')?.addEventListener('change', (e) => {
    proposalState.targetTeamId = e.target.value;
    proposalState.requestedPlayers.clear();
    renderTargetPlayersPicker();
  });

  $('#propTypeToggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nego-type]');
    if (!btn) return;
    proposalState.negoType = btn.dataset.negoType;
    document.querySelectorAll('#propTypeToggle .nego-opt').forEach((b) => b.classList.toggle('active', b === btn));
    $('#propLoanPeriodWrap').hidden = proposalState.negoType !== 'emprestimo';
  });

  $('#propOfferPlayersList')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-offer-player]');
    if (!chip) return;
    const playerName = chip.dataset.offerPlayer;
    if (proposalState.offeredPlayers.has(playerName)) {
      proposalState.offeredPlayers.delete(playerName);
    } else {
      if (proposalState.offeredPlayers.size >= 5) {
        return showToast('Você pode selecionar no máximo 5 jogadores por equipe.', 'error');
      }
      proposalState.offeredPlayers.add(playerName);
    }
    const profile = RBAC.getProfile();
    const user = getCurrentUser();
    const originClub = getClubByTeamId(profile?.team_id || user?.team_id);
    renderOriginPlayersPicker(originClub);
  });

  $('#propRequestPlayersList')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-request-player]');
    if (!chip) return;
    const playerName = chip.dataset.requestPlayer;
    if (proposalState.requestedPlayers.has(playerName)) {
      proposalState.requestedPlayers.delete(playerName);
    } else {
      if (proposalState.requestedPlayers.size >= 5) {
        return showToast('Você pode selecionar no máximo 5 jogadores do clube alvo.', 'error');
      }
      proposalState.requestedPlayers.add(playerName);
    }
    renderTargetPlayersPicker();
  });

  async function sendPreparedProposal(payload,button){
    if(sendingProposal||!RBAC.requireMember())return;
    sendingProposal=true;const original=button.textContent;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Preparando proposta…';
    const resultEl=$('#whatsappProposalResult');resultEl.hidden=true;resultEl.replaceChildren();
    try{
      const result=await RBAC.request('/api/transfers/prepare-proposal',{method:'POST',body:JSON.stringify(payload)});
      const url=new URL(result.whatsapp_url);if(url.origin!=='https://wa.me'||!/^\/55[0-9]{10,11}$/.test(url.pathname))throw Error('O servidor retornou um link inválido.');
      const link=document.createElement('a');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Abrir proposta no WhatsApp';
      resultEl.append(document.createTextNode('Proposta preparada. Se a nova aba não abriu: '),link);resultEl.hidden=false;
      window.open(url.href,'_blank','noopener,noreferrer');
      closeProposalModal();await GBLShared.refresh();renderProposalsHistory();showToast('Proposta preparada! Continue a negociação no WhatsApp.','info');
    }catch(error){showToast(error.message,'error');}
    finally{sendingProposal=false;button.textContent=original;button.removeAttribute('aria-busy');button.disabled=!RBAC.isIdentified()||!RBAC.getProfile()?.team_id;}
  }
  $('#proposalForm')?.addEventListener('submit',async e=>{
    e.preventDefault();if(!RBAC.requireMember())return;
    const offered=[...proposalState.offeredPlayers],requested=[...proposalState.requestedPlayers];
    const amount=Number($('#propCashAmount').value||0);
    if(!requested.length||(!offered.length&&!(amount>0)))return showToast('Selecione um jogador de interesse e ofereça jogadores ou uma compensação.','error');
    await sendPreparedProposal({target_team_id:proposalState.targetTeamId,player_wanted:requested,player_offered:offered,cash_amount:amount,type:proposalState.negoType,observation:$('#propObservation').value.trim()},e.target.querySelector('[type="submit"]'));
  });
  $('#proposalsList')?.addEventListener('click',async e=>{
    const button=e.target.closest('[data-prepare-proposal]');if(!button)return;
    const proposal=readProposals().find(p=>p.id===button.dataset.prepareProposal);if(!proposal||proposal.from_user_id!==RBAC.getCurrentUserId())return;
    await sendPreparedProposal({target_team_id:proposal.to_team_id,player_wanted:proposal.requested,player_offered:proposal.offered,cash_amount:proposal.cash_amount||0,type:proposal.type},button);
  });

  function renderProposalsHistory() {
    const wrap = $('#proposalsHistorySection');
    const listEl = $('#proposalsList');
    if (!wrap || !listEl) return;

    const proposals = readProposals();
    if (!proposals.length) {
      wrap.hidden = true;
      return;
    }

    const admin = RBAC.isAdmin();
    wrap.hidden = false;
    listEl.innerHTML = proposals
      .slice(0, 6)
      .map((pr) => {
        const dt = new Date(pr.createdAt);
        const pad = (n) => String(n).padStart(2, '0');
        const dateLabel = !isNaN(dt)
          ? `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} às ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
          : '';

        return `
          <article class="card proposal-history-card">
            <div class="ph-top">
              <span class="ph-status-badge">${escapeHtml(pr.status || 'Pendente')}</span>
              <span class="ph-type">${escapeHtml(pr.type)}</span>
              <span class="ph-date">${escapeHtml(dateLabel)}</span>
              <div class="ph-actions">
                ${pr.from_user_id===RBAC.getCurrentUserId()?`<button type="button" class="ph-resend-link" data-prepare-proposal="${escapeHtml(pr.id)}">📲 Preparar novamente</button>`:''}
                ${
                  admin
                    ? `<button type="button" class="club-action-btn danger" data-delete-proposal="${escapeHtml(pr.id)}" title="Remover proposta">✕</button>`
                    : ''
                }
              </div>
            </div>
            <div class="ph-body">
              <div class="ph-side">
                <strong class="ph-club-line">
                  ${
                    typeof window.GBLBadges !== 'undefined'
                      ? window.GBLBadges.renderCrestShell(pr.fromClub, { shellClass: 'ph-mini-crest gbl-aspect-crest' })
                      : ''
                  }
                  <span>${escapeHtml(pr.fromClub)} <small>(${escapeHtml(pr.fromTrainer)})</small></span>
                </strong>
                <span>📤 ${escapeHtml((pr.offered || []).join(', '))}</span>
              </div>
              <span class="ph-arrow">⇄</span>
              <div class="ph-side">
                <strong class="ph-club-line">
                  ${
                    typeof window.GBLBadges !== 'undefined'
                      ? window.GBLBadges.renderCrestShell(pr.toClub, { shellClass: 'ph-mini-crest gbl-aspect-crest' })
                      : ''
                  }
                  <span>${escapeHtml(pr.toClub)} <small>(${escapeHtml(pr.toTrainer)})</small></span>
                </strong>
                <span>📥 ${escapeHtml((pr.requested || []).join(', '))}</span>
              </div>
            </div>
            ${pr.observation ? `<div class="ph-obs">📝 Obs: ${escapeHtml(pr.observation)}</div>` : ''}
          </article>`;
      })
      .join('');
  }

  $('#proposalsList')?.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('[data-delete-proposal]');
    if (!delBtn) return;
    if (!RBAC.requireAdmin('excluir propostas do histórico')) return;

    const ok = await RBAC.confirmDelete({
      title: 'Excluir Proposta do Histórico',
      message: 'Tem certeza que deseja excluir esta proposta do histórico da liga?',
      confirmText: '🗑️ Excluir Proposta',
    });
    if (!ok) return;

    const list = readProposals().filter((p) => p.id !== delBtn.dataset.deleteProposal);
    writeProposals(list);
    renderProposalsHistory();
    showToast('Proposta removida do histórico.', 'info');
  });

  /* ==========================================================================
   * MODAL DE GESTÃO DE ESCUDO DO CLUBE (#clubBadgeModal) — ACESSO ADMIN
   * ========================================================================== */
  let badgePendingFile=null,badgePreviewURL='';
  const badgeModalState = {
    activeClubId: '',
    pendingBadgeData: '',
    hasPendingChange: false,
    uploadVersion: 0,
    isProcessing: false,
  };

  function resetBadgeUpload() {
    badgeModalState.uploadVersion++;
    badgeModalState.isProcessing = false;
    const saveBtn = $('#saveClubBadgeBtn');
    if (saveBtn) saveBtn.disabled = false;
  }

  function resolveClubForBadgeModal(clubIdOrName) {
    const squads = readSquads();
    if (!squads.length) return null;
    if (!clubIdOrName) return squads[0];
    const q = norm(clubIdOrName);
    return squads.find((s) => norm(s.id) === q || norm(s.name) === q) || squads[0];
  }

  function syncBadgeModalPreviewUI(club, previewUrl, isCustomPreview, statusTextOverride = '') {
    const circleEl = $('#badgePreviewCircle');
    const imgEl = $('#badgePreviewImg');
    const clubNameEl = $('#badgePreviewClubName');
    const statusPillEl = $('#badgePreviewStatusPill');
    const removeBtn = $('#removeClubBadgeBtn');

    const fallbackPlaceholder =
      (typeof window.GBLBadges !== 'undefined' && window.GBLBadges.DEFAULT_PLACEHOLDER) ||
      'assets/default-shield.svg';

    const finalSrc = previewUrl || fallbackPlaceholder;

    if (imgEl) {
      imgEl.dataset.fallbackApplied = '';
      imgEl.onerror = function () {
        if (this.dataset.fallbackApplied === '1') return;
        this.dataset.fallbackApplied = '1';
        this.src = fallbackPlaceholder;
        this.classList.remove('has-custom-badge');
        this.classList.add('is-placeholder-badge', 'is-placeholder-shield');
        if (circleEl) {
          circleEl.style.background = 'radial-gradient(circle at 30% 25%, rgba(29, 78, 216, 0.35), rgba(5, 21, 65, 0.88) 85%)';
          circleEl.style.borderColor = club?.secondaryColor || '#f5c84c';
        }
        if (statusPillEl) {
          statusPillEl.textContent = '⚠️ Link inválido — Exibindo Placeholder Padrão';
          statusPillEl.className = 'badge-preview-status is-placeholder';
        }
      };
      imgEl.src = finalSrc;
      imgEl.alt = `Prévia do escudo de ${club?.name || 'Clube'}`;
      imgEl.classList.toggle('has-custom-badge', Boolean(isCustomPreview));
      imgEl.classList.toggle('is-placeholder-badge', !isCustomPreview);
      imgEl.classList.toggle('is-placeholder-shield', !isCustomPreview);
    }

    if (circleEl && club) {
      if (isCustomPreview) {
        circleEl.style.background = 'transparent';
        circleEl.style.borderColor = 'transparent';
      } else {
        circleEl.style.background = 'radial-gradient(circle at 30% 25%, rgba(29, 78, 216, 0.35), rgba(5, 21, 65, 0.88) 85%)';
        circleEl.style.borderColor = club.secondaryColor || '#f5c84c';
      }
    }
    if (clubNameEl) {
      clubNameEl.textContent = club ? `${club.name} (${club.manager || 'Treinador'})` : 'Clube';
    }
    if (statusPillEl) {
      if (statusTextOverride) {
        statusPillEl.textContent = statusTextOverride;
      } else {
        statusPillEl.textContent = isCustomPreview
          ? '✨ Escudo Personalizado Ativo'
          : '🛡️ Placeholder Padrão da Liga';
      }
      statusPillEl.className = `badge-preview-status ${isCustomPreview ? 'is-custom' : 'is-placeholder'}`;
    }

    if (removeBtn && club) {
      const savedInfo =
        typeof window.GBLBadges !== 'undefined'
          ? window.GBLBadges.getClubBadgeData(club)
          : { hasCustom: false };
      removeBtn.disabled = !savedInfo.hasCustom && !isCustomPreview;
    }
  }

  function loadClubIntoBadgeModal(clubIdOrName) {
    badgePendingFile=null;if(badgePreviewURL){URL.revokeObjectURL(badgePreviewURL);badgePreviewURL='';}
    resetBadgeUpload();
    const squads = readSquads();
    const club = resolveClubForBadgeModal(clubIdOrName);
    if (!club) return;

    badgeModalState.activeClubId = club.id;
    const selectEl = $('#badgeModalClubSelect');
    if (selectEl) {
      selectEl.innerHTML = squads
        .map(
          (s) =>
            `<option value="${escapeHtml(s.id)}" ${s.id === club.id ? 'selected' : ''}>${escapeHtml(s.name)} — Treinador: ${escapeHtml(s.manager || '—')}</option>`
        )
        .join('');
      selectEl.value = club.id;
    }

    const info =
      typeof window.GBLBadges !== 'undefined'
        ? window.GBLBadges.getClubBadgeData(club)
        : { badge_url: 'assets/default-shield.svg', hasCustom: false, customUrl: '' };

    badgeModalState.pendingBadgeData = info.customUrl || '';
    badgeModalState.hasPendingChange = false;

    const fileInput = $('#badgeFileInput');
    if (fileInput) fileInput.value = '';
    const fileLabel = $('#badgeUploadFileName');
    if (fileLabel) fileLabel.textContent = 'Clique para escolher uma imagem do computador';

    const urlInput = $('#badgeUrlInput');
    if (urlInput) {
      urlInput.value = info.customUrl && !info.customUrl.startsWith('data:') ? info.customUrl : '';
    }

    syncBadgeModalPreviewUI(club, info.badge_url, info.hasCustom);
  }

  function openClubBadgeModal(clubIdOrName = '') {
    if (!RBAC.requireAdmin('gerenciar escudos dos clubes')) return;
    const modal = $('#clubBadgeModal');
    if (!modal) return;
    loadClubIntoBadgeModal(clubIdOrName);
    modal.hidden = false;
  }

  function closeClubBadgeModal() {
    resetBadgeUpload();
    const modal = $('#clubBadgeModal');
    if (modal) modal.hidden = true;
  }

  $('#closeClubBadgeModal')?.addEventListener('click', closeClubBadgeModal);
  $('#cancelClubBadgeBtn')?.addEventListener('click', closeClubBadgeModal);
  $('#clubBadgeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'clubBadgeModal') closeClubBadgeModal();
  });

  $('#badgeModalClubSelect')?.addEventListener('change', (e) => {
    loadClubIntoBadgeModal(e.target.value);
  });

  function selectBadgeFile(file){
    try{GBLUploads.validate(file);if(badgePreviewURL)URL.revokeObjectURL(badgePreviewURL);badgePendingFile=file;badgePreviewURL=GBLUploads.preview(file);badgeModalState.pendingBadgeData=badgePreviewURL;badgeModalState.hasPendingChange=true;
      $('#badgeUploadFileName').textContent=file.name+' — prévia local, ainda não enviada';$('#badgeUrlInput').value='';syncBadgeModalPreviewUI(resolveClubForBadgeModal(badgeModalState.activeClubId),badgePreviewURL,true,'Prévia pronta — clique em Salvar');
    }catch(error){showToast(error.message,'error');}
  }
  $('#badgeFileInput')?.addEventListener('change',e=>{if(e.target.files?.[0])selectBadgeFile(e.target.files[0]);});
  GBLUploads.dropzone(document.querySelector('.badge-upload-dropzone'),selectBadgeFile);
  $('#badgeUrlInput')?.addEventListener('input', (e) => {
    badgePendingFile=null;if(badgePreviewURL){URL.revokeObjectURL(badgePreviewURL);badgePreviewURL='';}
    resetBadgeUpload();
    const val = e.target.value.trim();
    const club = resolveClubForBadgeModal(badgeModalState.activeClubId);
    if (!club) return;

    const fileInput = $('#badgeFileInput');
    if (fileInput) fileInput.value = '';
    const fileLabel = $('#badgeUploadFileName');
    if (fileLabel) fileLabel.textContent = 'Clique para escolher uma imagem do computador';

    badgeModalState.pendingBadgeData = val;
    badgeModalState.hasPendingChange = true;

    const fallbackPlaceholder =
      (typeof window.GBLBadges !== 'undefined' && window.GBLBadges.DEFAULT_PLACEHOLDER) ||
      'assets/default-shield.svg';

    if (val) {
      syncBadgeModalPreviewUI(club, val, true, '🔗 Prévia por URL — Clique em Salvar');
    } else {
      syncBadgeModalPreviewUI(club, fallbackPlaceholder, false, '🛡️ Placeholder Padrão da Liga');
    }
  });

  $('#removeClubBadgeBtn')?.addEventListener('click', async () => {
    if (!RBAC.requireAdmin('remover escudos dos clubes')) return;
    const club = resolveClubForBadgeModal(badgeModalState.activeClubId);
    if (!club || typeof window.GBLBadges === 'undefined') return;

    try{await GBLUploads.remove(club.id,'badge');}catch(error){showToast(error.message);return;}
    loadClubIntoBadgeModal(club.id);
    renderAuthUI();
    showToast(`Escudo de "${club.name}" removido! Placeholder padrão restaurado em todo o site.`, 'info');
  });

  $('#clubBadgeForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (badgeModalState.isProcessing) return;
    if (!RBAC.requireAdmin('salvar escudos dos clubes')) return;
    const club = resolveClubForBadgeModal(badgeModalState.activeClubId);
    if (!club || typeof window.GBLBadges === 'undefined') return;

    const urlToSave = String(badgeModalState.pendingBadgeData || '').trim();
    const button=$('#saveClubBadgeBtn');badgeModalState.isProcessing=true;button.disabled=true;button.setAttribute('aria-busy','true');
    try{await GBLShared.idle();if(badgePendingFile)await GBLUploads.upload(club.id,'badge',badgePendingFile,null,p=>{button.textContent='Enviando '+p+'%…';});else if(!urlToSave)await GBLUploads.remove(club.id,'badge');else{await RBAC.request('/api/teams/'+encodeURIComponent(club.id),{method:'PUT',body:JSON.stringify({badge_url:urlToSave,shield_image:urlToSave})});await GBLShared.refresh();}}
    catch(error){showToast(error.message);return;}finally{badgeModalState.isProcessing=false;button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Salvar Escudo';}
    renderAuthUI();
    closeClubBadgeModal();

    if (urlToSave) {
      showToast(`Escudo de "${club.name}" atualizado em todo o site! 🛡️`, 'info');
    } else {
      showToast(`Escudo de "${club.name}" restaurado para o placeholder padrão.`, 'info');
    }
  });

  window.GBLBadgeModal = {
    open: openClubBadgeModal,
    close: closeClubBadgeModal,
  };

  /* ==========================================================================
   * MODAL DE EDIÇÃO DE ATRIBUTOS, METADADOS & BANNER DO CLUBE (#modalAdminClubMetadata)
   * ========================================================================== */
  const clubMetaModalState = {
    activeClubId: '',
  };

  function updateMetaModalPreviews() {
    const starsVal = Number($('#metaFieldStars')?.value) || 4;
    const customOvrVal = $('#metaFieldAvgOvr')?.value.trim();
    const ovrNum = customOvrVal ? Number(customOvrVal) : null;

    const starsContainer = $('#metaStarsLivePreview');
    if (starsContainer) {
      if (typeof window.GBLRenderStars === 'function') {
        starsContainer.innerHTML = window.GBLRenderStars(starsVal);
      } else {
        const full = Math.floor(starsVal);
        const half = starsVal - full >= 0.5 ? 1 : 0;
        const empty = Math.max(0, 5 - full - half);
        starsContainer.innerHTML =
          '<span class="star-full">' + '★'.repeat(full) + '</span>' +
          (half ? '<span class="star-half">★</span>' : '') +
          '<span class="star-empty">' + '☆'.repeat(empty) + '</span>';
      }
    }

    const badgePreview = $('#metaBadgeLivePreview');
    if (badgePreview) {
      const squads = readSquads();
      const club = squads.find((s) => s.id === clubMetaModalState.activeClubId) || {};
      const roster = club.roster || [];
      const calcOvr = roster.length
        ? Math.round(roster.reduce((sum, p) => sum + (Number(p.ovr) || 80), 0) / roster.length)
        : 80;
      const displayOvr = ovrNum && ovrNum > 0 ? Math.round(ovrNum) : calcOvr;
      const starsFormatted = starsVal.toFixed(1).replace('.0', '');
      badgePreview.textContent = `OVR MÉDIO ${displayOvr} · ${starsFormatted}★`;
    }
  }

  function openClubMetadataModal(clubIdOrName = '') {
    if (!RBAC.requireAdmin('editar atributos e dados dos clubes')) return;
    const modal = $('#modalAdminClubMetadata');
    if (!modal) return;

    const squads = readSquads();
    if (!squads.length) return;

    let club = null;
    if (clubIdOrName) {
      club = squads.find((s) => s.id === clubIdOrName || norm(s.name) === norm(clubIdOrName));
    }
    if (!club) {
      const sel = $('#admSelectClubForMeta');
      if (sel && sel.value) {
        club = squads.find((s) => s.id === sel.value);
      }
    }
    if (!club) club = squads[0];

    clubMetaModalState.activeClubId = club.id;

    // Header do modal
    const heading = $('#metaModalHeading');
    if (heading) heading.textContent = `⚙️ Editar Dados: ${club.name}`;
    const sub = $('#metaModalSub');
    if (sub) sub.textContent = `Treinador: ${club.manager || '—'} · Plantel PES: ${club.roster ? club.roster.length : 0} atletas`;

    // Escudo no Header
    const crestBox = $('#metaModalClubCrest');
    if (crestBox && typeof window.GBLBadges !== 'undefined') {
      crestBox.innerHTML = window.GBLBadges.renderCrestShell(club, { className: 'gbl-aspect-crest' });
    }

    // Hidden ID
    const hidId = $('#metaClubId');
    if (hidId) hidId.value = club.id;

    // Seção 1: Banner & Identidade
    if ($('#metaFieldLeagueName')) $('#metaFieldLeagueName').value = club.leagueName || "XUPÉ GENTE BOA'S LEAGUE";
    if ($('#metaFieldSeasonTitle')) $('#metaFieldSeasonTitle').value = club.seasonTitle || "Temporada PES 21";
    if ($('#metaFieldCountryLabel')) $('#metaFieldCountryLabel').value = club.countryLabel || "BRASIL · LIGA OFICIAL";
    if ($('#metaFieldClubTag')) $('#metaFieldClubTag').value = club.clubTag || "CLUBE OFICIAL PES 21";

    // Seção 2: Força & OVR
    if ($('#metaFieldStars')) $('#metaFieldStars').value = String(club.stars || 4);
    if ($('#metaFieldAvgOvr')) {
      const curOvr = Number(club.customOvr || club.avgOvr);
      $('#metaFieldAvgOvr').value = curOvr > 0 ? curOvr : '';
    }

    // Seção 3: Capitão & Tática
    const rosterSelect = $('#metaSelectRosterCaptain');
    if (rosterSelect) {
      const roster = club.roster || [];
      rosterSelect.innerHTML =
        '<option value="">-- Escolher atleta do elenco --</option>' +
        roster
          .map((p) => `<option value="${escapeHtml(p.name)} (${p.ovr})">${escapeHtml(p.name)} (${p.pos || 'JOG'} · OVR ${p.ovr})</option>`)
          .join('');
    }
    if ($('#metaFieldCaptain')) $('#metaFieldCaptain').value = club.captain || '';
    if ($('#metaFieldFormation')) $('#metaFieldFormation').value = club.formation || 'Esquema 4-2-3-1 Equilibrado';
    if ($('#metaFieldManager')) $('#metaFieldManager').value = club.manager || '';

    // Seção 4: Cores & Limites
    const clubs = readClubs();
    const cObj = clubs.find((c) => norm(c.name) === norm(club.name)) || {};
    const maxTrades = cObj.maxTrades ?? 3;
    const reserves = cObj.reserves ?? 5;

    if ($('#metaFieldName')) $('#metaFieldName').value = club.name;
    if ($('#metaFieldPrimaryColor')) $('#metaFieldPrimaryColor').value = club.primaryColor || '#991b1b';
    if ($('#metaFieldSecondaryColor')) $('#metaFieldSecondaryColor').value = club.secondaryColor || '#f5c84c';
    if ($('#metaFieldMaxTrades')) $('#metaFieldMaxTrades').value = maxTrades;
    if ($('#metaFieldReserves')) $('#metaFieldReserves').value = reserves;

    // Reset para primeira aba (banner)
    $$('#metaModalTabs .pill').forEach((p) => p.classList.toggle('active', p.dataset.metaTab === 'banner'));
    $$('.meta-tab-section').forEach((sec) => (sec.hidden = sec.id !== 'metaTabSectionBanner'));

    updateMetaModalPreviews();
    modal.hidden = false;
  }

  function closeClubMetadataModal() {
    const modal = $('#modalAdminClubMetadata');
    if (modal) modal.hidden = true;
  }

  // Abas internas do modal
  $('#metaModalTabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-meta-tab]');
    if (!btn) return;
    const targetTab = btn.dataset.metaTab;
    $$('#metaModalTabs .pill').forEach((p) => p.classList.toggle('active', p === btn));
    const mapSec = {
      banner: 'metaTabSectionBanner',
      force: 'metaTabSectionForce',
      tactics: 'metaTabSectionTactics',
      general: 'metaTabSectionGeneral',
    };
    $$('.meta-tab-section').forEach((sec) => {
      sec.hidden = sec.id !== mapSec[targetTab];
    });
  });

  // Atualização em tempo real das prévias
  $('#metaFieldStars')?.addEventListener('change', updateMetaModalPreviews);
  $('#metaFieldAvgOvr')?.addEventListener('input', updateMetaModalPreviews);

  // Seleção rápida de capitão do elenco
  $('#metaSelectRosterCaptain')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && $('#metaFieldCaptain')) {
      $('#metaFieldCaptain').value = val;
    }
  });

  // Sugestões de formação tática
  $('#metaQuickFormations')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-formation]');
    if (!btn) return;
    if ($('#metaFieldFormation')) {
      $('#metaFieldFormation').value = btn.dataset.formation;
    }
  });

  // Fechar modal
  $('#closeClubMetaModal')?.addEventListener('click', closeClubMetadataModal);
  $('#cancelClubMetaModalBtn')?.addEventListener('click', closeClubMetadataModal);
  $('#modalAdminClubMetadata')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalAdminClubMetadata') closeClubMetadataModal();
  });

  // Salvar alterações
  $('#adminClubMetadataForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!RBAC.requireAdmin('salvar metadados do clube')) return;

    const clubId = $('#metaClubId').value;
    const squads = readSquads();
    const idx = squads.findIndex((s) => s.id === clubId);
    if (idx === -1) return;

    const origClub = squads[idx];
    const origName = origClub.name;

    const newName = $('#metaFieldName').value.trim() || origName;
    const newManager = $('#metaFieldManager').value.trim();
    const newPrimaryColor = $('#metaFieldPrimaryColor').value;
    const newSecondaryColor = $('#metaFieldSecondaryColor').value;
    const newStars = Number($('#metaFieldStars').value) || 4;
    const avgOvrInput = $('#metaFieldAvgOvr').value.trim();
    const newCustomOvr = avgOvrInput ? Math.max(50, Math.min(99, Number(avgOvrInput))) : null;

    const newLeagueName = $('#metaFieldLeagueName').value.trim();
    const newSeasonTitle = $('#metaFieldSeasonTitle').value.trim();
    const newCountryLabel = $('#metaFieldCountryLabel').value.trim();
    const newClubTag = $('#metaFieldClubTag').value.trim();

    const newCaptain = $('#metaFieldCaptain').value.trim();
    const newFormation = $('#metaFieldFormation').value.trim();

    const newMaxTrades = Math.max(0, Number($('#metaFieldMaxTrades').value) || 3);
    const newReserves = Math.max(0, Number($('#metaFieldReserves').value) || 5);

    // Salvar no squads
    squads[idx] = {
      ...origClub,
      name: newName,
      manager: newManager,
      primaryColor: newPrimaryColor,
      secondaryColor: newSecondaryColor,
      stars: newStars,
      customOvr: newCustomOvr,
      avgOvr: newCustomOvr,
      leagueName: newLeagueName,
      seasonTitle: newSeasonTitle,
      countryLabel: newCountryLabel,
      clubTag: newClubTag,
      captain: newCaptain,
      formation: newFormation,
    };
    writeSquads(squads);

    // Salvar no clubs
    const clubs = readClubs();
    const cIdx = clubs.findIndex((c) => norm(c.name) === norm(origName) || norm(c.name) === norm(newName));
    if (cIdx >= 0) {
      clubs[cIdx] = {
        ...clubs[cIdx],
        name: newName,
        maxTrades: newMaxTrades,
        reserves: newReserves,
        primaryColor: newPrimaryColor,
        secondaryColor: newSecondaryColor,
        stars: newStars,
        customOvr: newCustomOvr,
        captain: newCaptain,
        formation: newFormation,
        leagueName: newLeagueName,
        seasonTitle: newSeasonTitle,
      };
    } else {
      clubs.push({
        id: 'c_' + uid(),
        name: newName,
        maxTrades: newMaxTrades,
        reserves: newReserves,
        primaryColor: newPrimaryColor,
        secondaryColor: newSecondaryColor,
        stars: newStars,
        customOvr: newCustomOvr,
        captain: newCaptain,
        formation: newFormation,
        leagueName: newLeagueName,
        seasonTitle: newSeasonTitle,
      });
    }
    writeClubs(clubs);

    closeClubMetadataModal();
    renderAuthUI();
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
    showToast("Dados do clube e treinador atualizados com sucesso em todas as seções!", 'info');
  });

  window.GBLClubMetadataModal = {
    open: openClubMetadataModal,
    close: closeClubMetadataModal,
  };

  window.addEventListener('gbl:badgechange', () => {
    renderAuthUI();
  });

  /* ---------- Inicialização Geral ---------- */
  renderAuthUI();
  if (!RBAC.isIdentified() && !RBAC.isGuest()) {
    openOnboardingModal();
  }
})();
