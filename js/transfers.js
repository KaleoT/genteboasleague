/* ===== Gente Boa's League — Transferências & Situação dos Clubes ===== */
(() => {
  const CLUBS_KEY = 'gbl.clubs.v2';
  const TRANSFERS_KEY = 'gbl.transfers.v2';

  const DEFAULT_CLUBS = [
    { id: 'c1', name: 'Joker FC', maxTrades: 3, reserves: 5 },
    { id: 'c2', name: 'Al Kabib', maxTrades: 3, reserves: 5 },
    { id: 'c3', name: 'Frog FC', maxTrades: 3, reserves: 5 },
    { id: 'c4', name: 'Sorriso FC', maxTrades: 3, reserves: 5 },
    { id: 'c5', name: 'Carvalhaes FC', maxTrades: 3, reserves: 5 },
    { id: 'c6', name: 'Beni FC', maxTrades: 3, reserves: 5 },
    { id: 'c7', name: 'Crew FC', maxTrades: 3, reserves: 5 },
    { id: 'c8', name: 'Mazili M.D FC', maxTrades: 3, reserves: 5 },
    { id: 'c9', name: 'The Beatles', maxTrades: 3, reserves: 5 },
    { id: 'c10', name: 'Gustavo FC', maxTrades: 3, reserves: 5 },
    { id: 'c11', name: 'Ashen Lords', maxTrades: 3, reserves: 5 },
    { id: 'c12', name: 'Fabricio FC', maxTrades: 3, reserves: 5 },
    { id: 'c13', name: 'Cannabis Crew', maxTrades: 3, reserves: 5 },
    { id: 'c14', name: 'Justin FC', maxTrades: 3, reserves: 5 },
    { id: 'c15', name: 'Augusto FC', maxTrades: 3, reserves: 5 },
    { id: 'c16', name: 'Adevogados FC', maxTrades: 3, reserves: 5 },
    { id: 'c17', name: 'Panissa FC', maxTrades: 3, reserves: 5 },
  ];

  const DEFAULT_TRANSFERS = [
    {
      id: 't1',
      date: '2026-07-18',
      time: '21:30',
      type: 'definitivo',
      expiryDate: '',
      teamA: 'Gustavo FC',
      assetsA: ['Di Maria', 'Saúl'],
      teamB: 'Joker FC',
      assetsB: ['Pavón', 'Kanté'],
      createdAt: '2026-07-18T21:30:00Z',
    },
    {
      id: 't2',
      date: '2026-07-19',
      time: '19:15',
      type: 'emprestimo',
      expiryDate: '2026-07-26',
      teamA: 'Mazili M.D FC',
      assetsA: ['Lukaku', 'PICK 11'],
      teamB: 'Gustavo FC',
      assetsB: ['Verratti'],
      createdAt: '2026-07-19T19:15:00Z',
    },
    {
      id: 't3',
      date: '2026-07-20',
      time: '15:40',
      type: 'definitivo',
      expiryDate: '',
      teamA: 'Al Kabib',
      assetsA: ['Hakimi'],
      teamB: 'Frog FC',
      assetsB: ['Robertson', 'PICK 04'],
      createdAt: '2026-07-20T15:40:00Z',
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').trim().toLowerCase();

  /* ---------- Persistência ---------- */
  function readClubs() {
    try {
      const raw = GBLShared.getItem(CLUBS_KEY);
      if (!raw) {
        GBLShared.setItem(CLUBS_KEY, JSON.stringify(DEFAULT_CLUBS));
        return [...DEFAULT_CLUBS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_CLUBS];
    }
  }

  function writeClubs(list) {
    GBLShared.setItem(CLUBS_KEY, JSON.stringify(list));
  }

  function readTransfers() {
    try {
      const raw = GBLShared.getItem(TRANSFERS_KEY);
      if (!raw) {
        GBLShared.setItem(TRANSFERS_KEY, JSON.stringify(DEFAULT_TRANSFERS));
        return [...DEFAULT_TRANSFERS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_TRANSFERS];
    }
  }

  function writeTransfers(list) {
    GBLShared.setItem(TRANSFERS_KEY, JSON.stringify(list));
  }

  /* ---------- Estado da UI ---------- */
  const state = {
    clubQuery: '',
    typeFilter: 'all', // 'all' | 'definitivo' | 'emprestimo'
    clubFilter: 'all', // 'all' | nome do clube
  };

  /* ---------- Utilitários ---------- */
  function parseAssets(input) {
    return String(input || '')
      .split(/,|;|\s+e\s+/i)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function isDraftPick(assetName) {
    return /^pick\b/i.test(assetName.trim()) || /\bpick\s*#?\d+/i.test(assetName.trim());
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatShortDateBR(isoDate) {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}`;
  }

  function showToast(msg, type = 'error') {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /** Calcula quantas trocas cada clube já realizou com base no histórico de negociações */
  function computeUsedTradesMap(transfers) {
    const map = new Map();
    transfers.forEach((tr) => {
      const a = norm(tr.teamA);
      const b = norm(tr.teamB);
      if (a) map.set(a, (map.get(a) || 0) + 1);
      if (b) map.set(b, (map.get(b) || 0) + 1);
    });
    return map;
  }

  /* ---------- Renderização: Coluna da Esquerda (Situação dos Clubes) ---------- */
  function renderClubs() {
    const clubs = readClubs();
    const transfers = readTransfers();
    const usedMap = computeUsedTradesMap(transfers);
    const q = norm(state.clubQuery);

    const filtered = clubs.filter((c) => !q || norm(c.name).includes(q));
    const container = $('#clubsList');

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state">Nenhuma equipa encontrada para "${escapeHtml(state.clubQuery)}".</div>`;
      return;
    }

    container.innerHTML = filtered
      .map((club) => {
        const max = Number(club.maxTrades) || 3;
        const used = usedMap.get(norm(club.name)) || 0;
        const available = Math.max(0, max - used);
        const exhausted = available === 0;
        const pct = Math.min(100, Math.round((available / max) * 100));
        const reserves = club.reserves ?? 5;
        const isSelectedClub = norm(state.clubFilter) === norm(club.name);

        const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : true;
        const shieldHtml =
          typeof window.GBLBadges !== 'undefined'
            ? window.GBLBadges.renderCrestShell(club.name, { shellClass: 'club-shield gbl-aspect-crest' })
            : `<span class="club-shield">${exhausted ? '🔒' : '🛡️'}</span>`;

        return `
        <article class="club-card ${exhausted ? 'is-exhausted' : 'is-available'} ${isSelectedClub ? 'is-filtered' : ''}" data-club-name="${escapeHtml(club.name)}">
          <div class="club-card-top">
            <div class="club-name-wrap">
              ${shieldHtml}
              <h4 class="club-name">${escapeHtml(club.name)}</h4>
            </div>
            <div class="club-top-right">
              <span class="trade-status-badge ${exhausted ? 'badge-exhausted' : 'badge-available'}">
                ${exhausted ? `Esgotado: 0/${max}` : `Disponível: ${available}/${max}`}
              </span>
              ${
                admin
                  ? `<div class="club-actions">
                      <button type="button" class="club-action-btn" data-edit-club="${club.id}" title="Editar equipa" aria-label="Editar ${escapeHtml(club.name)}">✎</button>
                      <button type="button" class="club-action-btn danger" data-delete-club="${club.id}" title="Excluir equipa" aria-label="Excluir ${escapeHtml(club.name)}">✕</button>
                    </div>`
                  : ''
              }
            </div>
          </div>

          <div class="trade-progress-track" aria-label="Limite de trocas">
            <div class="trade-progress-fill" style="width: ${pct}%"></div>
          </div>

          <div class="club-card-bottom">
            <div class="reserves-counter" title="Saldo de vagas restantes no banco de reservas">
              <span>🪑 Saldo de Reservas: <strong>${reserves}</strong></span>
              ${
                admin
                  ? `<div class="reserves-stepper">
                      <button type="button" class="step-btn" data-step-club="${club.id}" data-step="-1" aria-label="Diminuir vagas de reserva">−</button>
                      <button type="button" class="step-btn" data-step-club="${club.id}" data-step="1" aria-label="Aumentar vagas de reserva">+</button>
                    </div>`
                  : ''
              }
            </div>
            <button type="button" class="club-history-link" data-filter-club="${escapeHtml(club.name)}">
              ${isSelectedClub ? 'Ver todos' : 'Histórico →'}
            </button>
          </div>
        </article>`;
      })
      .join('');
  }

  /* ---------- Renderização: Dropdowns de Clubes ---------- */
  function syncClubDropdowns() {
    const clubs = readClubs();
    const filterSelect = $('#transferClubFilter');
    const prevValue = filterSelect.value || 'all';

    filterSelect.innerHTML =
      `<option value="all">Todos os clubes</option>` +
      clubs.map((c) => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');

    if ([...filterSelect.options].some((o) => o.value === prevValue)) {
      filterSelect.value = prevValue;
    } else {
      filterSelect.value = 'all';
      state.clubFilter = 'all';
    }
  }

  function populateModalTeamSelects() {
    const clubs = readClubs();
    const transfers = readTransfers();
    const usedMap = computeUsedTradesMap(transfers);

    const optionsHtml = clubs
      .map((c) => {
        const max = Number(c.maxTrades) || 3;
        const used = usedMap.get(norm(c.name)) || 0;
        const avail = Math.max(0, max - used);
        const label = avail === 0 ? `${c.name} (Esgotado 0/${max})` : `${c.name} (${avail}/${max} livres)`;
        return `<option value="${escapeHtml(c.name)}" ${avail === 0 ? 'data-exhausted="true"' : ''}>${escapeHtml(label)}</option>`;
      })
      .join('');

    const selA = $('#trTeamA');
    const selB = $('#trTeamB');
    selA.innerHTML = optionsHtml;
    selB.innerHTML = optionsHtml;
    if (clubs.length > 1) selB.selectedIndex = 1;
  }

  /* ---------- Renderização: Coluna da Direita (Feed de Negociações) ---------- */
  function renderAssetChip(asset) {
    const pick = isDraftPick(asset);
    return `<span class="asset-chip ${pick ? 'is-pick' : 'is-player'}">
      <span class="asset-icon">${pick ? '🎟️' : '⚽'}</span>
      ${escapeHtml(asset)}
    </span>`;
  }

  function renderFeed() {
    const transfers = readTransfers();
    const container = $('#transfersFeed');

    const filtered = transfers
      .filter((tr) => {
        if (state.typeFilter === 'definitivo' && tr.type !== 'definitivo') return false;
        if (state.typeFilter === 'emprestimo' && tr.type !== 'emprestimo') return false;
        if (state.clubFilter !== 'all') {
          const target = norm(state.clubFilter);
          if (norm(tr.teamA) !== target && norm(tr.teamB) !== target) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = `${a.date || ''}T${a.time || '00:00'}`;
        const db = `${b.date || ''}T${b.time || '00:00'}`;
        return db.localeCompare(da);
      });

    if (!filtered.length) {
      container.innerHTML = `
        <div class="card empty-state big">
          <span class="empty-icon">🔁</span>
          Nenhuma negociação encontrada para os filtros selecionados.
        </div>`;
      return;
    }

    container.innerHTML = filtered
      .map((tr) => {
        const isLoan = tr.type === 'emprestimo';
        const expText = tr.expiryDate ? ` · Expira a: ${formatShortDateBR(tr.expiryDate)}` : '';
        const typeBadge = isLoan
          ? `<span class="tr-badge tr-badge-loan">⏳ Empréstimo${escapeHtml(expText)}</span>`
          : `<span class="tr-badge tr-badge-def">✓ Definitivo</span>`;

        const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : true;

        return `
        <article class="card tr-card ${isLoan ? 'is-loan' : 'is-definitivo'}">
          <header class="tr-card-head">
            <div class="tr-datetime">
              <span class="tr-date">📅 ${escapeHtml(formatDateBR(tr.date))}</span>
              <span class="tr-time">🕒 ${escapeHtml(tr.time || '--:--')}</span>
            </div>
            <div class="tr-head-right">
              ${typeBadge}
              ${
                admin
                  ? `<button type="button" class="icon-btn small danger" data-delete-transfer="${tr.id}" title="Excluir e estornar limite de trocas">✕</button>`
                  : ''
              }
            </div>
          </header>

          <div class="tr-versus">
            <div class="tr-side tr-side-a">
              <div class="tr-team-label">
                ${
                  typeof window.GBLBadges !== 'undefined'
                    ? window.GBLBadges.renderCrestShell(tr.teamA, { shellClass: 'tr-team-crest gbl-aspect-crest' })
                    : ''
                }
                <div class="tr-team-label-text">
                  <span class="tr-direction">Cedeu</span>
                  <h4 class="tr-team-name">${escapeHtml(tr.teamA)}</h4>
                </div>
              </div>
              <div class="tr-assets">
                ${(tr.assetsA || []).map(renderAssetChip).join('')}
              </div>
            </div>

            <div class="tr-swap-icon" aria-label="Trocou com">
              <span>⇄</span>
            </div>

            <div class="tr-side tr-side-b">
              <div class="tr-team-label">
                ${
                  typeof window.GBLBadges !== 'undefined'
                    ? window.GBLBadges.renderCrestShell(tr.teamB, { shellClass: 'tr-team-crest gbl-aspect-crest' })
                    : ''
                }
                <div class="tr-team-label-text">
                  <span class="tr-direction">Cedeu</span>
                  <h4 class="tr-team-name">${escapeHtml(tr.teamB)}</h4>
                </div>
              </div>
              <div class="tr-assets">
                ${(tr.assetsB || []).map(renderAssetChip).join('')}
              </div>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  function renderAllTransfers() {
    syncClubDropdowns();
    renderClubs();
    renderFeed();
  }

  /* ---------- Eventos: Filtros e Interações ---------- */
  $('#clubSearchInput')?.addEventListener('input', (e) => {
    state.clubQuery = e.target.value;
    renderClubs();
  });

  $('#transferTypeFilter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    state.typeFilter = btn.dataset.filter;
    document.querySelectorAll('#transferTypeFilter .pill').forEach((p) => p.classList.toggle('active', p === btn));
    renderFeed();
  });

  $('#transferClubFilter')?.addEventListener('change', (e) => {
    state.clubFilter = e.target.value;
    renderClubs();
    renderFeed();
  });

  $('#clubsList')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-club]');
    if (editBtn) {
      if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('editar clubes')) return;
      openEditClubModal(editBtn.dataset.editClub);
      return;
    }

    const delBtn = e.target.closest('[data-delete-club]');
    if (delBtn) {
      if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('excluir clubes')) return;
      deleteClub(delBtn.dataset.deleteClub);
      return;
    }

    const stepBtn = e.target.closest('[data-step-club]');
    if (stepBtn) {
      if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('alterar saldo de reservas')) return;
      const clubId = stepBtn.dataset.stepClub;
      const delta = Number(stepBtn.dataset.step);
      const clubs = readClubs().map((c) => {
        if (c.id !== clubId) return c;
        const next = Math.max(0, Math.min(30, (c.reserves ?? 5) + delta));
        return { ...c, reserves: next };
      });
      writeClubs(clubs);
      renderClubs();
      return;
    }

    const filterBtn = e.target.closest('[data-filter-club]');
    if (filterBtn) {
      const clubName = filterBtn.dataset.filterClub;
      const next = norm(state.clubFilter) === norm(clubName) ? 'all' : clubName;
      state.clubFilter = next;
      $('#transferClubFilter').value = next;
      renderClubs();
      renderFeed();
      // Em mobile, alterna para a visualização do mercado ao clicar em Histórico
      setMobileView('market');
    }
  });

  $('#transfersFeed')?.addEventListener('click', async (e) => {
    const del = e.target.closest('[data-delete-transfer]');
    if (!del) return;
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('excluir negociações oficiais')) return;
    const ok = await RBAC.confirmDelete({
      title: 'Excluir Negociação',
      message: 'Excluir esta negociação? O saldo de trocas dos clubes envolvidos será restaurado.',
      confirmText: '🗑️ Excluir Negociação',
    });
    if (ok) {
      const list = readTransfers().filter((t) => t.id !== del.dataset.deleteTransfer);
      writeTransfers(list);
      renderAllTransfers();
      showToast('Negociação removida e limite restaurado.', 'info');
    }
  });

  /* ---------- Alternador Mobile (Ver Mercado / Ver Limites dos Clubes) ---------- */
  function setMobileView(view) {
    const dash = document.querySelector('.transfers-dashboard');
    if (!dash) return;
    dash.dataset.mobileView = view;
    document.querySelectorAll('#transfersMobileToggle .toggle-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.view === view);
    });
  }

  $('#transfersMobileToggle')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-view]');
    if (!btn) return;
    setMobileView(btn.dataset.view);
  });

  /* ---------- Modal: Registar Negociação ---------- */
  function openTransferModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('registar negociações oficiais')) return;
    populateModalTeamSelects();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    $('#trDate').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    $('#trTime').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    $('#trType').value = 'definitivo';
    $('#trExpiryWrap').hidden = true;
    $('#trExpiry').value = '';
    $('#trOutA').value = '';
    $('#trOutB').value = '';
    $('#transferModal').hidden = false;
  }

  function closeTransferModal() {
    $('#transferModal').hidden = true;
  }

  $('#openNewTransferBtn')?.addEventListener('click', openTransferModal);
  $('#closeTransferModal')?.addEventListener('click', closeTransferModal);
  $('#cancelTransferBtn')?.addEventListener('click', closeTransferModal);
  $('#transferModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'transferModal') closeTransferModal();
  });

  $('#trType')?.addEventListener('change', (e) => {
    const isLoan = e.target.value === 'emprestimo';
    $('#trExpiryWrap').hidden = !isLoan;
  });

  $('#transferForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = $('#trDate').value;
    const time = $('#trTime').value;
    const type = $('#trType').value;
    const expiryDate = type === 'emprestimo' ? $('#trExpiry').value : '';
    const teamA = $('#trTeamA').value;
    const teamB = $('#trTeamB').value;
    const assetsA = parseAssets($('#trOutA').value);
    const assetsB = parseAssets($('#trOutB').value);

    if (!date || !time) return showToast('Informe a data e a hora da negociação.');
    if (!teamA || !teamB) return showToast('Selecione as duas equipas.');
    if (norm(teamA) === norm(teamB)) return showToast('Selecione duas equipas diferentes para a negociação.');
    if (!assetsA.length || !assetsB.length) {
      return showToast('Informe os jogadores ou picks envolvidos dos dois lados.');
    }
    if (type === 'emprestimo' && !expiryDate) {
      return showToast('Informe a data de expiração do empréstimo.');
    }

    // Verifica limite de trocas das equipas envolvidas
    const clubs = readClubs();
    const transfers = readTransfers();
    const usedMap = computeUsedTradesMap(transfers);

    const clubA = clubs.find((c) => norm(c.name) === norm(teamA));
    const clubB = clubs.find((c) => norm(c.name) === norm(teamB));
    const availA = clubA ? Math.max(0, (clubA.maxTrades || 3) - (usedMap.get(norm(teamA)) || 0)) : 3;
    const availB = clubB ? Math.max(0, (clubB.maxTrades || 3) - (usedMap.get(norm(teamB)) || 0)) : 3;

    if (availA <= 0) {
      return showToast(`O clube ${teamA} já atingiu o limite máximo de trocas (0/${clubA.maxTrades}).`);
    }
    if (availB <= 0) {
      return showToast(`O clube ${teamB} já atingiu o limite máximo de trocas (0/${clubB.maxTrades}).`);
    }

    transfers.push({
      id: uid(),
      date,
      time,
      type,
      expiryDate,
      teamA,
      assetsA,
      teamB,
      assetsB,
      createdAt: new Date().toISOString(),
    });

    writeTransfers(transfers);
    closeTransferModal();
    renderAllTransfers();
    showToast('Negociação registada! Saldo de trocas atualizado.', 'info');
  });

  /* ---------- Modal: Adicionar / Editar / Excluir Clube ---------- */
  function closeClubModal() {
    $('#clubModal').hidden = true;
    $('#clubEditId').value = '';
  }

  function openAddClubModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('cadastrar clubes')) return;
    $('#clubEditId').value = '';
    $('#clubModalTitle').textContent = 'Adicionar Clube';
    $('#saveClubSubmitBtn').textContent = 'Salvar Clube';
    $('#clubNameInput').value = '';
    $('#clubMaxTradesInput').value = '3';
    $('#clubReservesInput').value = '5';
    $('#clubModal').hidden = false;
    setTimeout(() => $('#clubNameInput').focus(), 50);
  }

  function openEditClubModal(clubId) {
    const club = readClubs().find((c) => c.id === clubId);
    if (!club) return;
    $('#clubEditId').value = club.id;
    $('#clubModalTitle').textContent = 'Editar Clube';
    $('#saveClubSubmitBtn').textContent = 'Salvar Alterações';
    $('#clubNameInput').value = club.name;
    $('#clubMaxTradesInput').value = String(club.maxTrades ?? 3);
    $('#clubReservesInput').value = String(club.reserves ?? 5);
    $('#clubModal').hidden = false;
    setTimeout(() => $('#clubNameInput').focus(), 50);
  }

  async function deleteClub(clubId) {
    const clubs = readClubs();
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return;

    const transfers = readTransfers();
    const relatedCount = transfers.filter(
      (t) => norm(t.teamA) === norm(club.name) || norm(t.teamB) === norm(club.name)
    ).length;

    const msg =
      relatedCount > 0
        ? `Excluir a equipa "${club.name}"? Ela possui ${relatedCount} negociação(ões) registada(s) no histórico (as negociações serão mantidas no feed).`
        : `Tem certeza que deseja excluir a equipa "${club.name}"?`;

    const ok = await RBAC.confirmDelete({
      title: 'Excluir Equipa',
      message: msg,
      confirmText: '🗑️ Excluir Equipa',
    });
    if (!ok) return;

    writeClubs(clubs.filter((c) => c.id !== clubId));
    if (norm(state.clubFilter) === norm(club.name)) {
      state.clubFilter = 'all';
    }
    renderAllTransfers();
    showToast(`Equipa "${club.name}" excluída.`, 'info');
  }

  $('#addClubBtn')?.addEventListener('click', openAddClubModal);
  $('#closeClubModal')?.addEventListener('click', closeClubModal);
  $('#cancelClubBtn')?.addEventListener('click', closeClubModal);
  $('#clubModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'clubModal') closeClubModal();
  });

  $('#clubForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#clubEditId').value.trim();
    const name = $('#clubNameInput').value.trim();
    const maxTrades = Math.max(1, Number($('#clubMaxTradesInput').value) || 3);
    const reserves = Math.max(0, Number($('#clubReservesInput').value) || 5);

    if (!name) return showToast('Informe o nome da equipa.');
    const clubs = readClubs();
    if (clubs.some((c) => c.id !== editId && norm(c.name) === norm(name))) {
      return showToast('Já existe uma equipa com este nome.');
    }

    if (editId) {
      const target = clubs.find((c) => c.id === editId);
      if (!target) return closeClubModal();
      const oldName = target.name;

      const updatedClubs = clubs.map((c) =>
        c.id === editId ? { ...c, name, maxTrades, reserves } : c
      );
      writeClubs(updatedClubs);

      // Se o nome mudou, atualiza também nas negociações existentes para preservar o histórico e a contagem
      if (norm(oldName) !== norm(name)) {
        const updatedTransfers = readTransfers().map((tr) => ({
          ...tr,
          teamA: norm(tr.teamA) === norm(oldName) ? name : tr.teamA,
          teamB: norm(tr.teamB) === norm(oldName) ? name : tr.teamB,
        }));
        writeTransfers(updatedTransfers);
        if (norm(state.clubFilter) === norm(oldName)) {
          state.clubFilter = name;
        }
      }

      closeClubModal();
      renderAllTransfers();
      showToast(`Equipa "${name}" atualizada!`, 'info');
    } else {
      clubs.push({ id: uid(), name, maxTrades, reserves });
      writeClubs(clubs);
      closeClubModal();
      renderAllTransfers();
      showToast(`Equipa "${name}" adicionada!`, 'info');
    }
  });

  /* ---------- Inicialização ---------- */
  window.addEventListener('gbl:rolechange', renderAllTransfers);
  window.addEventListener('gbl:datachange', renderAllTransfers);
  window.addEventListener('gbl:badgechange', renderAllTransfers);
  renderAllTransfers();
})();
