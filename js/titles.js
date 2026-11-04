/* ===== Gente Boa's League — Galeria de Campeões & Títulos (estilo UEFA) ===== */
(() => {
  const FINALS_KEY = 'gbl.finals.v2';
  const RECORDS_KEY = 'gbl.records.v2';

  const DEFAULT_FINALS = [
    {
      id: 'f12',
      season: 'Temporada 12',
      year: 2026,
      winnerTeam: 'Al Kabib',
      winnerScore: 3,
      runnerTeam: 'Joker FC',
      runnerScore: 2,
      extraNote: 'Prorrogação',
      highlight: 'Mohamed Salah (2 gols, 1 assist.) · Gol do hexacampeonato aos 118’',
    },
    {
      id: 'f11',
      season: 'Temporada 11',
      year: 2026,
      winnerTeam: 'Frog FC',
      winnerScore: 2,
      runnerTeam: 'Joker FC',
      runnerScore: 1,
      extraNote: '',
      highlight: 'Lewandowski (2 gols) · Campanha impecável no mata-mata',
    },
    {
      id: 'f10',
      season: 'Temporada 10',
      year: 2026,
      winnerTeam: 'Al Kabib',
      winnerScore: 3,
      runnerTeam: 'Sorriso FC',
      runnerScore: 1,
      extraNote: '',
      highlight: 'Harry Kane (2 gols) · Pentacampeonato confirmado',
    },
    {
      id: 'f9',
      season: 'Temporada 9',
      year: 2025,
      winnerTeam: 'Sorriso FC',
      winnerScore: 2,
      runnerTeam: 'Frog FC',
      runnerScore: 2,
      extraNote: '5-4 pen',
      highlight: 'Oblak (2 defesas nos pênaltis) · Phil Foden decisivo',
    },
    {
      id: 'f8',
      season: 'Temporada 8',
      year: 2025,
      winnerTeam: 'Al Kabib',
      winnerScore: 4,
      runnerTeam: 'Carvalhaes FC',
      runnerScore: 1,
      extraNote: '',
      highlight: 'Rafael Leão (Hat-trick) · Atuação de gala na decisão',
    },
    {
      id: 'f7',
      season: 'Temporada 7',
      year: 2025,
      winnerTeam: 'Carvalhaes FC',
      winnerScore: 2,
      runnerTeam: 'Beni FC',
      runnerScore: 1,
      extraNote: '',
      highlight: 'Ibrahimović (2 gols) · Virada histórica no segundo tempo',
    },
    {
      id: 'f6',
      season: 'Temporada 6',
      year: 2024,
      winnerTeam: 'Al Kabib',
      winnerScore: 1,
      runnerTeam: 'Mazili M.D FC',
      runnerScore: 0,
      extraNote: '',
      highlight: 'Kimmich (gol aos 89’) · Campeão Invicto da edição',
    },
    {
      id: 'f5',
      season: 'Temporada 5',
      year: 2024,
      winnerTeam: 'Crew FC',
      winnerScore: 3,
      runnerTeam: 'Joker FC',
      runnerScore: 2,
      extraNote: 'Gol nos acréscimos (90+3’)',
      highlight: 'Giroud (2 gols) · Decisão eletrizante até o último lance',
    },
    {
      id: 'f4',
      season: 'Temporada 4',
      year: 2024,
      winnerTeam: 'Al Kabib',
      winnerScore: 2,
      runnerTeam: 'Frog FC',
      runnerScore: 0,
      extraNote: '',
      highlight: 'Mohamed Salah (2 gols) · Domínio tático absoluto',
    },
    {
      id: 'f3',
      season: 'Temporada 3',
      year: 2023,
      winnerTeam: 'Fabricio FC',
      winnerScore: 2,
      runnerTeam: 'Sorriso FC',
      runnerScore: 2,
      extraNote: '4-2 pen',
      highlight: 'Szczęsny brilhou nas penalidades · Kvaratskhelia (1 gol)',
    },
    {
      id: 'f2',
      season: 'Temporada 2',
      year: 2023,
      winnerTeam: 'Panissa FC',
      winnerScore: 2,
      runnerTeam: 'Al Kabib',
      runnerScore: 1,
      extraNote: '',
      highlight: 'Bellingham (1 gol, 1 assist.) · Título inédito',
    },
    {
      id: 'f1',
      season: 'Temporada 1',
      year: 2023,
      winnerTeam: 'Al Kabib',
      winnerScore: 3,
      runnerTeam: 'Gustavo FC',
      runnerScore: 2,
      extraNote: '',
      highlight: 'Salah e Harry Kane decisivos · Primeiro campeão da história da GBL',
    },
  ];

  const DEFAULT_RECORDS = [
    {
      id: 'rec1',
      tag: 'Hegemonia & Invencibilidade',
      icon: '👑',
      title: 'Maior Campeão da História',
      metric: '6 Taças · Hexacampeão',
      team_id: 'sq2',
      club: 'Al Kabib',
      desc: 'Lidera isolado a Sala de Troféus da Xupé Gente Boa\'s League com 6 títulos conquistados e 93,8 pontos acumulados.',
    },
    {
      id: 'rec2',
      tag: 'Liderança Geral em Pontos',
      icon: '🔥',
      title: 'Recordista de Pontuação Geral',
      metric: '107,4 PT Acumulados',
      team_id: 'sq1',
      club: 'Joker FC',
      desc: 'Clube mais regular da história do campeonato, ultrapassando a marca centenária de 107,4 pontos no Ranking Oficial.',
    },
    {
      id: 'rec3',
      tag: 'Rei das Decisões',
      icon: '⚽',
      title: 'Artilheiro Histórico das Finais',
      metric: '7 Gols em Finais',
      club: 'Mohamed Salah (Al Kabib)',
      desc: 'O homem dos jogos grandes: balançou as redes nas decisões e comandou o hexacampeonato do Al Kabib.',
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CHEVRON_SVG =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const TROPHY_SVG =
    '<svg class="uefa-trophy-svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M18 2H6v2H2v5c0 2.76 2.24 5 5 5 .68 0 1.32-.14 1.91-.39A5.99 5.99 0 0 0 11 16.9V19H7v3h10v-3h-4v-2.1a5.99 5.99 0 0 0 2.09-3.29c.59.25 1.23.39 1.91.39 2.76 0 5-2.24 5-5V4h-4V2zm-2 10c-2.21 0-4-1.79-4-4V4h8v4c0 2.21-1.79 4-4 4zM4 9V6h2v5.83C4.84 11.42 4 10.3 4 9zm16 0c0 1.3-.84 2.42-2 2.83V6h2v3z"/></svg>';

  /* ---------- Persistência ---------- */
  function readRawFinals() {
    try {
      const raw = GBLShared.getItem(FINALS_KEY);
      if (!raw) {
        GBLShared.setItem(FINALS_KEY, JSON.stringify(DEFAULT_FINALS));
        return [...DEFAULT_FINALS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_FINALS];
    }
  }

  function readFinals() { return readRawFinals().map(window.GBLTeams.final); }

  function writeFinals(list) {
    GBLShared.setItem(FINALS_KEY, JSON.stringify(list.map(window.GBLTeams.linkFinal)));
  }

  function readRawRecords() {
    try {
      const raw = GBLShared.getItem(RECORDS_KEY);
      if (!raw) {
        GBLShared.setItem(RECORDS_KEY, JSON.stringify(DEFAULT_RECORDS));
        return [...DEFAULT_RECORDS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_RECORDS];
    }
  }

  function readRecords() { return readRawRecords().map(window.GBLTeams.record); }

  function writeRecords(list) {
    GBLShared.setItem(RECORDS_KEY, JSON.stringify(list.map(window.GBLTeams.linkRecord)));
  }

  /* ---------- Estado de Accordions Abertos ---------- */
  const state = {
    initializedDefaultOpen: false,
    openClubs: new Set(), // chaves normalizadas dos clubes expandidos
  };

  /** Gera iniciais estilizadas para o escudo do clube */
  function getClubInitials(teamName) {
    const words = String(teamName || '')
      .replace(/\b(fc|sc|ec|ac|md|cf)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'GB';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function buildWinnersRanking() {
    const finals = readFinals();
    const map = new Map();

    finals.forEach((f) => {
      const key = norm(f.winnerTeam);
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, {
          key,
          teamName: f.winnerTeam.trim(),
          manager: f.winnerManager?.trim() || '',
          finals: [],
        });
      }
      const entry = map.get(key);
      if (f.winnerManager && !entry.manager) entry.manager = f.winnerManager.trim();
      entry.finals.push(f);
    });

    const list = [...map.values()].filter((c) => c.finals.length > 0);

    // Ordena as finais de cada clube da mais recente para a mais antiga
    list.forEach((club) => {
      club.finals.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || String(b.season).localeCompare(String(a.season)));
    });

    // Ordena os clubes do maior vencedor para o menor; desempate pelo título mais recente
    list.sort((a, b) => {
      if (b.finals.length !== a.finals.length) return b.finals.length - a.finals.length;
      const latestA = Number(a.finals[0]?.year) || 0;
      const latestB = Number(b.finals[0]?.year) || 0;
      return latestB - latestA || a.teamName.localeCompare(b.teamName);
    });

    // Por padrão, o 1º colocado vem expandido ao carregar a página
    if (!state.initializedDefaultOpen && list.length > 0) {
      state.openClubs.add(list[0].key);
      state.initializedDefaultOpen = true;
    }

    return list;
  }

  /* ---------- Renderização da Lista Ordenada de Campeões (Estilo UEFA) ---------- */
  function renderChampionsList() {
    const container = $('#championsAccordion');
    if (!container) return;

    const ranking = buildWinnersRanking();

    if (!ranking.length) {
      container.innerHTML = `
        <div class="card empty-state big">
          <span class="empty-icon">🏆</span>
          Nenhum título registado ainda. Clique em "+ Registar Título" para adicionar o primeiro campeão!
        </div>`;
      return;
    }

    container.innerHTML = ranking
      .map((club, idx) => {
        const pos = idx + 1;
        const isOpen = state.openClubs.has(club.key);
        const count = club.finals.length;
        const yearsSummary = club.finals.map((f) => f.year).join(', ');
        const crestShellHtml =
          typeof window.GBLBadges !== 'undefined'
            ? window.GBLBadges.renderCrestShell(club.teamName, { shellClass: `uefa-crest ${pos === 1 ? 'crest-gold' : ''}` })
            : `<div class="uefa-crest gbl-aspect-crest ${pos === 1 ? 'crest-gold' : ''}"><span>${escapeHtml(getClubInitials(club.teamName))}</span></div>`;

        return `
        <article class="uefa-club-row ${isOpen ? 'open' : ''} ${pos === 1 ? 'is-leader' : ''}" data-club-key="${escapeHtml(club.key)}">
          <button type="button" class="uefa-row-head" aria-expanded="${isOpen}">
            <div class="uefa-row-left">
              <span class="uefa-rank-num">${pos}</span>
              ${crestShellHtml}
              <div class="uefa-club-identity">
                <div class="uefa-club-title">
                  <span class="uefa-team-name">${escapeHtml(club.teamName)}</span>
                  ${club.manager ? `<span class="uefa-manager-name">(${escapeHtml(club.manager)})</span>` : ''}
                </div>
                <span class="uefa-years-sub">Anos: ${escapeHtml(yearsSummary)}</span>
              </div>
            </div>

            <div class="uefa-row-right">
              <div class="uefa-trophy-counter" title="${count} ${count === 1 ? 'título conquistado' : 'títulos conquistados'}">
                <span class="uefa-trophy-icons">
                  ${TROPHY_SVG}
                </span>
                <span class="uefa-trophy-number">${count}</span>
              </div>
              <span class="uefa-chevron">${CHEVRON_SVG}</span>
            </div>
          </button>

          <div class="uefa-row-body">
            <div class="uefa-row-body-inner">
              <div class="finals-grid">
                ${club.finals.map((f) => renderFinalMiniCard(f)).join('')}
              </div>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  function renderFinalMiniCard(f) {
    const wCrest =
      typeof window.GBLBadges !== 'undefined'
        ? window.GBLBadges.renderCrestShell(f.winnerTeam, { shellClass: 'mini-crest gold' })
        : `<span class="mini-crest gold gbl-aspect-crest">${escapeHtml(getClubInitials(f.winnerTeam))}</span>`;
    const rCrest =
      typeof window.GBLBadges !== 'undefined'
        ? window.GBLBadges.renderCrestShell(f.runnerTeam, { shellClass: 'mini-crest' })
        : `<span class="mini-crest gbl-aspect-crest">${escapeHtml(getClubInitials(f.runnerTeam))}</span>`;
    const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : true;
    return `
      <div class="final-mini-card">
        <header class="final-card-head">
          <span class="final-season-tag">★ ${escapeHtml(f.season)} • ${escapeHtml(f.year)}</span>
          <div class="final-card-actions">
            ${f.extraNote ? `<span class="final-extra-pill">${escapeHtml(f.extraNote)}</span>` : ''}
            ${
              admin
                ? `<button type="button" class="club-action-btn" data-edit-final="${f.id}" title="Editar final">✎</button>
                   <button type="button" class="club-action-btn danger" data-delete-final="${f.id}" title="Excluir final">✕</button>`
                : ''
            }
          </div>
        </header>

        <div class="final-scoreboard">
          <div class="final-team is-winner">
            ${wCrest}
            <div class="final-team-text">
              <strong>${escapeHtml(f.winnerTeam)}</strong>
              ${f.winnerManager ? `<small>${escapeHtml(f.winnerManager)}</small>` : ''}
            </div>
          </div>

          <div class="final-score-box">
            <span class="score-win">${escapeHtml(f.winnerScore)}</span>
            <span class="score-sep">x</span>
            <span class="score-lose">${escapeHtml(f.runnerScore)}</span>
          </div>

          <div class="final-team is-runner">
            <div class="final-team-text">
              <strong>${escapeHtml(f.runnerTeam)}</strong>
              ${f.runnerManager ? `<small>${escapeHtml(f.runnerManager)}</small>` : ''}
            </div>
            ${rCrest}
          </div>
        </div>

        <footer class="final-card-foot">
          <span class="final-mvp-icon">⭐</span>
          <span class="final-mvp-text">${escapeHtml(f.highlight || 'Destaque da decisão')}</span>
        </footer>
      </div>`;
  }

  /* ---------- Renderização: Momentos Históricos & Recordes ---------- */
  function renderRecordsGrid() {
    const grid = $('#recordsGrid');
    if (!grid) return;

    const records = readRecords();
    if (!records.length) {
      grid.innerHTML = `
        <div class="card empty-state big" style="grid-column: 1 / -1;">
          <span class="empty-icon">⭐</span>
          Nenhum momento histórico ou recorde registado. Clique em "+ Adicionar Recorde" para criar o primeiro!
        </div>`;
      return;
    }

    const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : true;
    grid.innerHTML = records
      .map(
        (rec) => `
      <article class="card record-card">
        <div class="record-top">
          <div class="record-top-left">
            <span class="record-icon">${escapeHtml(rec.icon || '⭐')}</span>
            <span class="record-tag">${escapeHtml(rec.tag)}</span>
          </div>
          ${
            admin
              ? `<div class="club-actions">
                  <button type="button" class="club-action-btn" data-edit-record="${rec.id}" title="Editar recorde" aria-label="Editar ${escapeHtml(rec.title)}">✎</button>
                  <button type="button" class="club-action-btn danger" data-delete-record="${rec.id}" title="Excluir recorde" aria-label="Excluir ${escapeHtml(rec.title)}">✕</button>
                </div>`
              : ''
          }
        </div>
        <h3 class="record-title">${escapeHtml(rec.title)}</h3>
        <div class="record-metric">${escapeHtml(rec.metric)}</div>
        <div class="record-holder">${escapeHtml(rec.club)}</div>
        <p class="record-desc">${escapeHtml(rec.desc)}</p>
      </article>`
      )
      .join('');
  }

  /* ---------- Eventos: Accordion & CRUD de Finais ---------- */
  $('#championsAccordion')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-final]');
    if (editBtn) {
      e.stopPropagation();
      openEditTitleModal(editBtn.dataset.editFinal);
      return;
    }

    const delBtn = e.target.closest('[data-delete-final]');
    if (delBtn) {
      e.stopPropagation();
      deleteFinal(delBtn.dataset.deleteFinal);
      return;
    }

    const head = e.target.closest('.uefa-row-head');
    if (!head) return;
    const row = head.closest('.uefa-club-row');
    const key = row.dataset.clubKey;
    const willOpen = !row.classList.contains('open');
    row.classList.toggle('open', willOpen);
    head.setAttribute('aria-expanded', willOpen);
    if (willOpen) state.openClubs.add(key);
    else state.openClubs.delete(key);
  });

  function showToast(msg, type = 'info') {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function openNewTitleModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('registar novos títulos')) return;
    const finals = readFinals();
    const nextSeasonNum = finals.length + 1;
    $('#titleEditId').value = '';
    $('#titleModalHeading').textContent = 'Registar Final / Título';
    $('#tiSeason').value = `Temporada ${nextSeasonNum}`;
    $('#tiYear').value = String(new Date().getFullYear());
    $('#tiExtraNote').value = '';
    $('#tiWinnerTeam').value = '';
    $('#tiWinnerManager').value = '';
    $('#tiWinnerScore').value = '2';
    $('#tiRunnerTeam').value = '';
    $('#tiRunnerManager').value = '';
    $('#tiRunnerScore').value = '1';
    $('#tiHighlight').value = '';
    $('#titleModal').hidden = false;
  }

  function openEditTitleModal(finalId) {
    const f = readFinals().find((item) => item.id === finalId);
    if (!f) return;
    $('#titleEditId').value = f.id;
    $('#titleModalHeading').textContent = 'Editar Final / Título';
    $('#tiSeason').value = f.season || '';
    $('#tiYear').value = String(f.year || new Date().getFullYear());
    $('#tiExtraNote').value = f.extraNote || '';
    $('#tiWinnerTeam').value = f.winnerTeam || '';
    $('#tiWinnerManager').value = f.winnerManager || '';
    $('#tiWinnerScore').value = String(f.winnerScore ?? 0);
    $('#tiRunnerTeam').value = f.runnerTeam || '';
    $('#tiRunnerManager').value = f.runnerManager || '';
    $('#tiRunnerScore').value = String(f.runnerScore ?? 0);
    $('#tiHighlight').value = f.highlight || '';
    $('#titleModal').hidden = false;
  }

  function closeTitleModal() {
    $('#titleModal').hidden = true;
    $('#titleEditId').value = '';
  }

  async function deleteFinal(finalId) {
    const list = readFinals();
    const target = list.find((f) => f.id === finalId);
    if (!target) return;
    const ok = await RBAC.confirmDelete({
      title: 'Excluir Final / Título',
      message: `Excluir a final da ${target.season} (${target.winnerTeam} ${target.winnerScore}x${target.runnerScore} ${target.runnerTeam})?`,
      confirmText: '🗑️ Excluir Final',
    });
    if (!ok) return;
    writeFinals(list.filter((f) => f.id !== finalId));
    renderChampionsList();
    showToast('Final removida da galeria de títulos.', 'info');
  }

  $('#openNewTitleBtn')?.addEventListener('click', openNewTitleModal);
  $('#closeTitleModal')?.addEventListener('click', closeTitleModal);
  $('#cancelTitleBtn')?.addEventListener('click', closeTitleModal);
  $('#titleModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'titleModal') closeTitleModal();
  });

  $('#titleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#titleEditId').value.trim();
    const season = $('#tiSeason').value.trim();
    const year = Number($('#tiYear').value) || new Date().getFullYear();
    const extraNote = $('#tiExtraNote').value.trim();
    const winnerTeam = $('#tiWinnerTeam').value.trim();
    const winnerManager = $('#tiWinnerManager').value.trim();
    const winnerScore = Math.max(0, Number($('#tiWinnerScore').value) || 0);
    const runnerTeam = $('#tiRunnerTeam').value.trim();
    const runnerManager = $('#tiRunnerManager').value.trim();
    const runnerScore = Math.max(0, Number($('#tiRunnerScore').value) || 0);
    const highlight = $('#tiHighlight').value.trim();

    if (!season || !winnerTeam || !runnerTeam) {
      return showToast('Preencha a temporada, o clube campeão e o vice-campeão.', 'error');
    }

    const list = readFinals();
    if (editId) {
      const updated = list.map((f) =>
        f.id === editId
          ? { ...f, season, year, extraNote, winnerTeam, winner_team_id: window.GBLTeams.find(null,winnerTeam)?.id, winnerManager, winnerScore, runnerTeam, runner_team_id: window.GBLTeams.find(null,runnerTeam)?.id, runnerManager, runnerScore, highlight }
          : f
      );
      writeFinals(updated);
      state.openClubs.add(norm(winnerTeam));
      closeTitleModal();
      renderChampionsList();
      showToast('Final atualizada com sucesso!', 'info');
    } else {
      list.push({
        id: uid(),
        season,
        year,
        extraNote,
        winnerTeam,
        winnerManager,
        winnerScore,
        runnerTeam,
        runnerManager,
        runnerScore,
        highlight,
      });
      writeFinals(list);
      state.openClubs.add(norm(winnerTeam));
      closeTitleModal();
      renderChampionsList();
      showToast(`Título registado para ${winnerTeam}! 🏆`, 'info');
    }
  });

  /* ---------- Modal & CRUD: Momentos Históricos & Recordes ---------- */
  function openNewRecordModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('adicionar recordes')) return;
    $('#recordEditId').value = '';
    $('#recordModalHeading').textContent = 'Adicionar Momento ou Recorde';
    $('#saveRecordSubmitBtn').textContent = 'Salvar Recorde';
    $('#recIcon').value = '👑';
    $('#recTag').value = '';
    $('#recTitle').value = '';
    $('#recMetric').value = '';
    $('#recClub').value = '';
    $('#recDesc').value = '';
    $('#recordModal').hidden = false;
    setTimeout(() => $('#recTag').focus(), 50);
  }

  function openEditRecordModal(recordId) {
    const rec = readRecords().find((r) => r.id === recordId);
    if (!rec) return;
    $('#recordEditId').value = rec.id;
    $('#recordModalHeading').textContent = 'Editar Momento ou Recorde';
    $('#saveRecordSubmitBtn').textContent = 'Salvar Alterações';
    $('#recIcon').value = rec.icon || '⭐';
    $('#recTag').value = rec.tag || '';
    $('#recTitle').value = rec.title || '';
    $('#recMetric').value = rec.metric || '';
    $('#recClub').value = rec.club || '';
    $('#recDesc').value = rec.desc || '';
    $('#recordModal').hidden = false;
    setTimeout(() => $('#recTitle').focus(), 50);
  }

  function closeRecordModal() {
    $('#recordModal').hidden = true;
    $('#recordEditId').value = '';
  }

  async function deleteRecord(recordId) {
    const list = readRecords();
    const target = list.find((r) => r.id === recordId);
    if (!target) return;
    const ok = await RBAC.confirmDelete({
      title: 'Excluir Recorde Histórico',
      message: `Tem certeza que deseja excluir o momento/recorde "${target.title}"?`,
      confirmText: '🗑️ Excluir Recorde',
    });
    if (!ok) return;
    writeRecords(list.filter((r) => r.id !== recordId));
    renderRecordsGrid();
    showToast('Recorde removido.', 'info');
  }

  $('#openNewRecordBtn')?.addEventListener('click', openNewRecordModal);
  $('#closeRecordModal')?.addEventListener('click', closeRecordModal);
  $('#cancelRecordBtn')?.addEventListener('click', closeRecordModal);
  $('#recordModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'recordModal') closeRecordModal();
  });

  $('#recordsGrid')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-record]');
    if (editBtn) {
      openEditRecordModal(editBtn.dataset.editRecord);
      return;
    }
    const delBtn = e.target.closest('[data-delete-record]');
    if (delBtn) {
      deleteRecord(delBtn.dataset.deleteRecord);
    }
  });

  $('#recordForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#recordEditId').value.trim();
    const icon = $('#recIcon').value || '⭐';
    const tag = $('#recTag').value.trim();
    const title = $('#recTitle').value.trim();
    const metric = $('#recMetric').value.trim();
    const club = $('#recClub').value.trim();
    const desc = $('#recDesc').value.trim();

    if (!tag || !title || !metric || !club || !desc) {
      return showToast('Preencha todos os campos do recorde.', 'error');
    }

    const list = readRecords();
    if (editId) {
      const updated = list.map((r) =>
        r.id === editId ? { ...r, icon, tag, title, metric, club, desc } : r
      );
      writeRecords(updated);
      closeRecordModal();
      renderRecordsGrid();
      showToast('Recorde atualizado!', 'info');
    } else {
      list.push({ id: uid(), icon, tag, title, metric, club, desc });
      writeRecords(list);
      closeRecordModal();
      renderRecordsGrid();
      showToast('Novo momento histórico adicionado! ⭐', 'info');
    }
  });

  /* ---------- Inicialização ---------- */
  window.addEventListener('gbl:rolechange', () => {
    renderChampionsList();
    renderRecordsGrid();
  });
  window.addEventListener('gbl:datachange', () => {
    renderChampionsList();
    renderRecordsGrid();
  });
  window.addEventListener('gbl:badgechange', renderChampionsList);
  renderChampionsList();
  renderRecordsGrid();
})();
