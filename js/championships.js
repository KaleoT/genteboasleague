/* ===== Gente Boa's League — Aba Campeonatos (Copa Fácil + Galeria Histórica) ===== */
(() => {
  const ACTIVE_CHAMP_KEY = 'gbl.championships.active.v2';
  const ARCHIVED_CHAMPS_KEY = 'gbl.championships.history.v2';
  const SQUADS_KEY = 'gbl.squads.v2';

  /**
   * Variável configurável padrão com a URL pública do campeonato ativo no Copa Fácil.
   * Pode ser alterada pelo Administrador diretamente na interface ("⚙️ Configurar Link").
   */
  const DEFAULT_COPA_FACIL_URL = 'https://copafacil.com/genteboasleague-t9';

  const DEFAULT_ACTIVE_CHAMP = {
    title: "Temporada 9 · Xupé Gente Boa's League",
    format: 'Pontos Corridos + Mata-Mata',
    seasonLabel: 'Edição 2026 · 17 Clubes (18º em breve)',
    statusText: '🔴 EM ANDAMENTO',
    copaFacilUrl: DEFAULT_COPA_FACIL_URL,
    description:
      'Tabela de classificação oficial, rodadas, chaveamento e estatísticas integradas em tempo real via Copa Fácil.',
  };

  const DEFAULT_ARCHIVED_CHAMPS = [
    {
      id: 'arch-t8',
      name: 'Temporada 8 · Liga Oficial',
      year: 2026,
      dateLabel: 'Outubro 2026',
      category: 'liga',
      format: 'Pontos Corridos + Mata-Mata',
      championTeam: 'Gustavo FC',
      championManager: 'Gustavo',
      championScore: 3,
      runnerTeam: 'Joker FC',
      runnerManager: 'Kalleby',
      runnerScore: 2,
      extraNote: 'Prorrogação (118’)',
      summary: 'Mbappé marcou 2 gols na grande final e garantiu o tetracampeonato na prorrogação.',
      topScorer: 'Kylian Mbappé (Gustavo FC) — 16 gols',
      bestDefense: 'Gustavo FC (12 gols sofridos)',
      copaFacilUrl: 'https://copafacil.com/genteboasleague-t8',
      standings: [
        { pos: 1, team: 'Gustavo FC', manager: 'Gustavo', pts: 44, j: 17, v: 14, e: 2, d: 1, gp: 46, gc: 12, status: '🏆 Campeão' },
        { pos: 2, team: 'Joker FC', manager: 'Kalleby', pts: 40, j: 17, v: 13, e: 1, d: 3, gp: 41, gc: 16, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Al Kabib', manager: 'Kalled', pts: 36, j: 17, v: 11, e: 3, d: 3, gp: 35, gc: 18, status: 'Semifinalista' },
        { pos: 4, team: 'Mazili MD FC', manager: 'Mazili', pts: 34, j: 17, v: 10, e: 4, d: 3, gp: 38, gc: 21, status: 'Semifinalista' },
        { pos: 5, team: 'Xupé United', manager: 'Pedro', pts: 30, j: 17, v: 9, e: 3, d: 5, gp: 29, gc: 22, status: 'Quartas de Final' },
        { pos: 6, team: 'Resenha City', manager: 'Lucas', pts: 28, j: 17, v: 8, e: 4, d: 5, gp: 27, gc: 24, status: 'Quartas de Final' },
      ],
    },
    {
      id: 'arch-inverno-26',
      name: 'Copa de Inverno 2026',
      year: 2026,
      dateLabel: 'Julho 2026',
      category: 'copa',
      format: 'Copa Eliminatória (Mata-Mata)',
      championTeam: 'Al Kabib',
      championManager: 'Kalled',
      championScore: 2,
      runnerTeam: 'Mazili MD FC',
      runnerManager: 'Mazili',
      runnerScore: 1,
      extraNote: 'Final em Jogo Único',
      summary: 'Salah e Kanté comandaram a campanha invicta do Al Kabib no mata-mata de inverno.',
      topScorer: 'Mohamed Salah (Al Kabib) — 8 gols',
      bestDefense: 'Al Kabib (3 gols sofridos em 5 jogos)',
      copaFacilUrl: 'https://copafacil.com/copainverno-gbl-2026',
      standings: [
        { pos: 1, team: 'Al Kabib', manager: 'Kalled', pts: 15, j: 5, v: 5, e: 0, d: 0, gp: 13, gc: 3, status: '🏆 Campeão' },
        { pos: 2, team: 'Mazili MD FC', manager: 'Mazili', pts: 12, j: 5, v: 4, e: 0, d: 1, gp: 11, gc: 5, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Joker FC', manager: 'Kalleby', pts: 7, j: 4, v: 2, e: 1, d: 1, gp: 8, gc: 5, status: 'Semifinalista' },
        { pos: 4, team: 'Real Matismo FC', manager: 'Matheus', pts: 6, j: 4, v: 2, e: 0, d: 2, gp: 7, gc: 7, status: 'Semifinalista' },
      ],
    },
    {
      id: 'arch-t7',
      name: 'Temporada 7 · Liga Oficial',
      year: 2026,
      dateLabel: 'Abril 2026',
      category: 'liga',
      format: 'Pontos Corridos + Mata-Mata',
      championTeam: 'Joker FC',
      championManager: 'Kalleby',
      championScore: 2,
      runnerTeam: 'Mazili MD FC',
      runnerManager: 'Mazili',
      runnerScore: 2,
      extraNote: '5-3 nos Pênaltis',
      summary: 'Courtois brilhou defendendo duas cobranças e Haaland anotou dois gols no tempo normal.',
      topScorer: 'Erling Haaland (Joker FC) — 18 gols',
      bestDefense: 'Joker FC (14 gols sofridos)',
      copaFacilUrl: 'https://copafacil.com/genteboasleague-t7',
      standings: [
        { pos: 1, team: 'Joker FC', manager: 'Kalleby', pts: 42, j: 17, v: 13, e: 3, d: 1, gp: 43, gc: 14, status: '🏆 Campeão' },
        { pos: 2, team: 'Mazili MD FC', manager: 'Mazili', pts: 39, j: 17, v: 12, e: 3, d: 2, gp: 40, gc: 17, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Gustavo FC', manager: 'Gustavo', pts: 35, j: 17, v: 11, e: 2, d: 4, gp: 34, gc: 19, status: 'Semifinalista' },
        { pos: 4, team: 'Al Kabib', manager: 'Kalled', pts: 31, j: 17, v: 9, e: 4, d: 4, gp: 30, gc: 20, status: 'Semifinalista' },
      ],
    },
    {
      id: 'arch-supercopa-25',
      name: 'Supercopa Gente Boa 2025',
      year: 2025,
      dateLabel: 'Dezembro 2025',
      category: 'copa',
      format: 'Copa Eliminatória (Top 8)',
      championTeam: 'Gustavo FC',
      championManager: 'Gustavo',
      championScore: 3,
      runnerTeam: 'Joker FC',
      runnerManager: 'Kalleby',
      runnerScore: 1,
      extraNote: 'Final Presencial',
      summary: 'Torneio especial de encerramento de ano reunindo os 8 melhores colocados da temporada.',
      topScorer: 'Vinícius Jr. (Gustavo FC) — 6 gols',
      bestDefense: 'Gustavo FC (2 gols sofridos)',
      copaFacilUrl: 'https://copafacil.com/supercopa-gbl-2025',
      standings: [
        { pos: 1, team: 'Gustavo FC', manager: 'Gustavo', pts: 9, j: 3, v: 3, e: 0, d: 0, gp: 8, gc: 2, status: '🏆 Campeão' },
        { pos: 2, team: 'Joker FC', manager: 'Kalleby', pts: 6, j: 3, v: 2, e: 0, d: 1, gp: 6, gc: 4, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Xupé United', manager: 'Pedro', pts: 3, j: 2, v: 1, e: 0, d: 1, gp: 4, gc: 4, status: 'Semifinalista' },
        { pos: 4, team: 'Al Kabib', manager: 'Kalled', pts: 3, j: 2, v: 1, e: 0, d: 1, gp: 3, gc: 4, status: 'Semifinalista' },
      ],
    },
    {
      id: 'arch-t6',
      name: 'Temporada 6 · Liga Oficial',
      year: 2025,
      dateLabel: 'Agosto 2025',
      category: 'liga',
      format: 'Pontos Corridos + Mata-Mata',
      championTeam: 'Gustavo FC',
      championManager: 'Gustavo',
      championScore: 4,
      runnerTeam: 'Xupé United',
      runnerManager: 'Pedro',
      runnerScore: 1,
      extraNote: '',
      summary: 'Hat-trick histórico de Vinícius Jr. na decisão com atuação dominante do início ao fim.',
      topScorer: 'Vinícius Jr. (Gustavo FC) — 15 gols',
      bestDefense: 'Gustavo FC (15 gols sofridos)',
      copaFacilUrl: 'https://copafacil.com/genteboasleague-t6',
      standings: [
        { pos: 1, team: 'Gustavo FC', manager: 'Gustavo', pts: 41, j: 17, v: 13, e: 2, d: 2, gp: 44, gc: 15, status: '🏆 Campeão' },
        { pos: 2, team: 'Xupé United', manager: 'Pedro', pts: 37, j: 17, v: 11, e: 4, d: 2, gp: 35, gc: 18, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Mazili MD FC', manager: 'Mazili', pts: 33, j: 17, v: 10, e: 3, d: 4, gp: 32, gc: 20, status: 'Semifinalista' },
        { pos: 4, team: 'Joker FC', manager: 'Kalleby', pts: 31, j: 17, v: 9, e: 4, d: 4, gp: 30, gc: 21, status: 'Semifinalista' },
      ],
    },
    {
      id: 'arch-t4',
      name: 'Temporada 4 · Liga Oficial',
      year: 2024,
      dateLabel: 'Novembro 2024',
      category: 'liga',
      format: 'Pontos Corridos + Mata-Mata',
      championTeam: 'Mazili MD FC',
      championManager: 'Mazili',
      championScore: 5,
      runnerTeam: 'Joker FC',
      runnerManager: 'Kalleby',
      runnerScore: 4,
      extraNote: 'Gol aos 90+4’',
      summary: 'A final mais eletrizante da história: 9 gols e título decidido por Messi no último lance.',
      topScorer: 'Lionel Messi (Mazili MD FC) — 19 gols',
      bestDefense: 'Joker FC (16 gols sofridos)',
      copaFacilUrl: 'https://copafacil.com/genteboasleague-t4',
      standings: [
        { pos: 1, team: 'Mazili MD FC', manager: 'Mazili', pts: 43, j: 17, v: 14, e: 1, d: 2, gp: 49, gc: 18, status: '🏆 Campeão' },
        { pos: 2, team: 'Joker FC', manager: 'Kalleby', pts: 40, j: 17, v: 13, e: 1, d: 3, gp: 42, gc: 16, status: '🥈 Vice-Campeão' },
        { pos: 3, team: 'Gustavo FC', manager: 'Gustavo', pts: 36, j: 17, v: 11, e: 3, d: 3, gp: 37, gc: 19, status: 'Semifinalista' },
        { pos: 4, team: 'Resenha City', manager: 'Lucas', pts: 29, j: 17, v: 9, e: 2, d: 6, gp: 28, gc: 24, status: 'Semifinalista' },
      ],
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const uid = () => 'arch-' + Math.random().toString(36).slice(2, 9);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    typeFilter: 'all', // 'all' | 'liga' | 'copa'
    yearFilter: 'all', // 'all' | '2026' | '2025' | ...
    iframeLoadedUrl: '',
    isExpanded: false,
  };

  /* ---------- Persistência ---------- */
  function readActiveChamp() {
    try {
      const raw = GBLShared.getItem(ACTIVE_CHAMP_KEY);
      if (!raw) {
        GBLShared.setItem(ACTIVE_CHAMP_KEY, JSON.stringify(DEFAULT_ACTIVE_CHAMP));
        return { ...DEFAULT_ACTIVE_CHAMP };
      }
      return { ...DEFAULT_ACTIVE_CHAMP, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_ACTIVE_CHAMP };
    }
  }

  function writeActiveChamp(data) {
    GBLShared.setItem(ACTIVE_CHAMP_KEY, JSON.stringify(data));
  }

  function readArchivedChamps() {
    try {
      const raw = GBLShared.getItem(ARCHIVED_CHAMPS_KEY);
      if (!raw) {
        GBLShared.setItem(ARCHIVED_CHAMPS_KEY, JSON.stringify(DEFAULT_ARCHIVED_CHAMPS));
        return JSON.parse(JSON.stringify(DEFAULT_ARCHIVED_CHAMPS));
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(DEFAULT_ARCHIVED_CHAMPS));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_ARCHIVED_CHAMPS));
    }
  }

  function writeArchivedChamps(list) {
    GBLShared.setItem(ARCHIVED_CHAMPS_KEY, JSON.stringify(list));
  }

  function readSquadClubs() {
    try {
      const raw = GBLShared.getItem(SQUADS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /* ---------- Helpers de Clube / Escudo ---------- */
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

  function getClubVisuals(teamName) {
    const clubs = readSquadClubs();
    const found = clubs.find((c) => norm(c.name) === norm(teamName));
    return {
      initials: getInitials(teamName),
      primary: found?.primaryColor || '#1e40af',
      secondary: found?.secondaryColor || '#f5c84c',
      manager: found?.manager || '',
    };
  }

  function renderClubCrestBadge(teamName, sizeClass = '') {
    const { initials, primary, secondary } = getClubVisuals(teamName);
    return `
      <span
        class="champ-club-crest ${sizeClass}"
        style="background: radial-gradient(circle at 30% 25%, ${escapeHtml(primary)}, #061338 88%); border-color: ${escapeHtml(secondary)};"
        aria-hidden="true"
      >${escapeHtml(initials)}</span>
    `;
  }

  function showToast(msg, type = 'info') {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  /* ---------- 1. Renderizar Campeonato em Curso (Copa Fácil) ---------- */
  function renderActiveChampionship(forceReloadIframe = false) {
    const active = readActiveChamp();
    const targetUrl = active.copaFacilUrl || DEFAULT_COPA_FACIL_URL;

    if ($('#activeChampTitle')) $('#activeChampTitle').textContent = active.title;
    if ($('#activeChampFormatBadge')) $('#activeChampFormatBadge').textContent = active.format;
    if ($('#activeChampSeasonBadge')) $('#activeChampSeasonBadge').textContent = active.seasonLabel;
    if ($('#activeChampDesc')) $('#activeChampDesc').textContent = active.description;
    if ($('#activeChampUrlDisplay')) $('#activeChampUrlDisplay').textContent = targetUrl;

    const extBtn = $('#openCopaFacilExtBtn');
    if (extBtn) extBtn.href = targetUrl;

    const iframe = $('#copaFacilIframe');
    const skeleton = $('#copaFacilSkeleton');
    if (!iframe) return;

    // Carrega o iframe quando a aba Campeonatos estiver visível ou quando forçado
    const isTabVisible = !$('#campeonatos')?.hidden || location.hash === '#campeonatos';
    if (!isTabVisible && !forceReloadIframe && state.iframeLoadedUrl) return;

    if (forceReloadIframe || state.iframeLoadedUrl !== targetUrl) {
      state.iframeLoadedUrl = targetUrl;
      if (skeleton) skeleton.classList.remove('is-hidden');

      clearTimeout(renderActiveChampionship._skTimer);
      renderActiveChampionship._skTimer = setTimeout(() => {
        if (skeleton) skeleton.classList.add('is-hidden');
      }, 2200);

      iframe.onload = () => {
        clearTimeout(renderActiveChampionship._skTimer);
        if (skeleton) skeleton.classList.add('is-hidden');
      };

      iframe.src = targetUrl;
    }
  }

  /* ---------- 2. Renderizar Galeria de Campeonatos Anteriores ---------- */
  function populateYearFilterOptions(list) {
    const select = $('#pastChampsYearFilter');
    if (!select) return;
    const years = Array.from(new Set(list.map((item) => String(item.year)))).sort((a, b) => Number(b) - Number(a));
    const currentVal = state.yearFilter;
    select.innerHTML =
      `<option value="all">Todos os Anos</option>` +
      years.map((y) => `<option value="${escapeHtml(y)}" ${y === currentVal ? 'selected' : ''}>Ano ${escapeHtml(y)}</option>`).join('');
  }

  function renderPastChampionships() {
    const allChamps = readArchivedChamps();
    populateYearFilterOptions(allChamps);

    const grid = $('#pastChampsGrid');
    if (!grid) return;

    const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : false;

    const filtered = allChamps.filter((item) => {
      const matchType = state.typeFilter === 'all' || norm(item.category) === state.typeFilter;
      const matchYear = state.yearFilter === 'all' || String(item.year) === String(state.yearFilter);
      return matchType && matchYear;
    });

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="card empty-state big past-champs-empty">
          <span class="empty-icon">🏛️</span>
          <strong>Nenhum campeonato encontrado para este filtro</strong>
          <p>Altere o filtro de tipo ([Todos], [Ligas], [Copas]) ou selecione outro ano.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered
      .map((item) => {
        const isCup = norm(item.category) === 'copa';
        const categoryBadgeLabel = isCup ? '🏆 COPA' : '⚽ LIGA';
        const categoryBadgeClass = isCup ? 'type-copa' : 'type-liga';

        return `
          <article class="card past-champ-card">
            <header class="past-champ-card-top">
              <div class="past-champ-meta-row">
                <span class="past-type-badge ${categoryBadgeClass}">${categoryBadgeLabel}</span>
                <span class="past-format-tag">${escapeHtml(item.format)}</span>
                <span class="past-year-tag">${escapeHtml(item.dateLabel || item.year)}</span>
              </div>
              <div class="past-champ-title-row">
                <h4>${escapeHtml(item.name)}</h4>
                ${
                  admin
                    ? `<div class="past-admin-actions">
                         <button type="button" class="club-action-btn" data-edit-arch="${escapeHtml(item.id)}" title="Editar campeonato arquivado">✎</button>
                         <button type="button" class="club-action-btn danger" data-delete-arch="${escapeHtml(item.id)}" title="Excluir campeonato do histórico">🗑️</button>
                       </div>`
                    : ''
                }
              </div>
            </header>

            <!-- Confronto / Destaque dos Finalistas (Campeão & Vice) -->
            <div class="past-finalists-box">
              <!-- Campeão -->
              <div class="past-finalist is-champion">
                <span class="finalist-medal-tag gold-medal">🏆 CAMPEÃO</span>
                <div class="finalist-club-row">
                  ${renderClubCrestBadge(item.championTeam)}
                  <div class="finalist-club-info">
                    <strong>${escapeHtml(item.championTeam)}</strong>
                    <small>Treinador: ${escapeHtml(item.championManager)}</small>
                  </div>
                </div>
              </div>

              <!-- Placar Central da Decisão -->
              <div class="past-final-scoreboard">
                <div class="past-score-numbers">
                  <span class="score-win">${escapeHtml(item.championScore)}</span>
                  <span class="score-sep">×</span>
                  <span class="score-lose">${escapeHtml(item.runnerScore)}</span>
                </div>
                <span class="past-score-note">${escapeHtml(item.extraNote || 'Tempo Normal')}</span>
              </div>

              <!-- Vice-Campeão -->
              <div class="past-finalist is-runnerup">
                <span class="finalist-medal-tag silver-medal">🥈 VICE-CAMPEÃO</span>
                <div class="finalist-club-row">
                  ${renderClubCrestBadge(item.runnerTeam)}
                  <div class="finalist-club-info">
                    <strong>${escapeHtml(item.runnerTeam)}</strong>
                    <small>Treinador: ${escapeHtml(item.runnerManager)}</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumo Rápido da Decisão -->
            <div class="past-champ-summary">
              <p>⭐ ${escapeHtml(item.summary || 'Edição oficial concluída.')}</p>
            </div>

            <!-- Rodapé do Card: Ver Tabela Arquivada + Atalho Copa Fácil -->
            <footer class="past-champ-card-foot">
              <button
                type="button"
                class="btn btn-ghost btn-sm past-archive-btn"
                data-view-archived="${escapeHtml(item.id)}"
              >
                📊 Ver Tabela Arquivada
              </button>
              ${
                item.copaFacilUrl
                  ? `<a
                       href="${escapeHtml(item.copaFacilUrl)}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="past-ext-link"
                       title="Abrir página histórica desta edição no Copa Fácil"
                     >Copa Fácil ↗</a>`
                  : ''
              }
            </footer>
          </article>
        `;
      })
      .join('');
  }

  /* ---------- 3. Modal: Ver Tabela Arquivada ---------- */
  function openArchivedTableModal(archId) {
    const list = readArchivedChamps();
    const item = list.find((c) => c.id === archId);
    if (!item) return;

    if ($('#archModalKicker')) {
      $('#archModalKicker').textContent = `${item.format.toUpperCase()} · ${item.dateLabel || item.year}`;
    }
    if ($('#archModalTitle')) {
      $('#archModalTitle').textContent = item.name;
    }

    const cfBtn = $('#archModalCopaFacilBtn');
    if (cfBtn) {
      if (item.copaFacilUrl) {
        cfBtn.href = item.copaFacilUrl;
        cfBtn.hidden = false;
      } else {
        cfBtn.hidden = true;
      }
    }

    const standings = Array.isArray(item.standings) && item.standings.length
      ? item.standings
      : [
          {
            pos: 1,
            team: item.championTeam,
            manager: item.championManager,
            pts: 42,
            j: 17,
            v: 13,
            e: 3,
            d: 1,
            gp: 40,
            gc: 14,
            status: '🏆 Campeão',
          },
          {
            pos: 2,
            team: item.runnerTeam,
            manager: item.runnerManager,
            pts: 38,
            j: 17,
            v: 12,
            e: 2,
            d: 3,
            gp: 36,
            gc: 18,
            status: '🥈 Vice-Campeão',
          },
        ];

    const rowsHtml = standings
      .map(
        (r) => `
        <tr class="${r.pos === 1 ? 'arch-row-champion' : r.pos === 2 ? 'arch-row-runner' : ''}">
          <td class="arch-col-pos"><strong>${escapeHtml(r.pos)}º</strong></td>
          <td class="arch-col-club">
            <div class="arch-club-cell">
              ${renderClubCrestBadge(r.team, 'crest-sm')}
              <div>
                <strong>${escapeHtml(r.team)}</strong>
                <small>${escapeHtml(r.manager)}</small>
              </div>
            </div>
          </td>
          <td><strong>${escapeHtml(r.pts)}</strong></td>
          <td>${escapeHtml(r.j)}</td>
          <td>${escapeHtml(r.v)}</td>
          <td>${escapeHtml(r.e)}</td>
          <td>${escapeHtml(r.d)}</td>
          <td>${escapeHtml(r.gp)}:${escapeHtml(r.gc)}</td>
          <td><span class="arch-status-pill">${escapeHtml(r.status)}</span></td>
        </tr>`
      )
      .join('');

    const body = $('#archModalBody');
    if (body) {
      body.innerHTML = `
        <div class="arch-modal-Banner">
          <div class="arch-final-duel">
            <div class="arch-duel-side">
              ${renderClubCrestBadge(item.championTeam, 'crest-lg')}
              <div>
                <span class="finalist-medal-tag gold-medal">🏆 CAMPEÃO</span>
                <h4>${escapeHtml(item.championTeam)}</h4>
                <small>Treinador: ${escapeHtml(item.championManager)}</small>
              </div>
            </div>

            <div class="arch-duel-score">
              <strong>${escapeHtml(item.championScore)} × ${escapeHtml(item.runnerScore)}</strong>
              <span>${escapeHtml(item.extraNote || 'Final Oficial')}</span>
            </div>

            <div class="arch-duel-side side-right">
              <div>
                <span class="finalist-medal-tag silver-medal">🥈 VICE-CAMPEÃO</span>
                <h4>${escapeHtml(item.runnerTeam)}</h4>
                <small>Treinador: ${escapeHtml(item.runnerManager)}</small>
              </div>
              ${renderClubCrestBadge(item.runnerTeam, 'crest-lg')}
            </div>
          </div>

          <div class="arch-highlights-bar">
            <div class="arch-hl-item">
              <small>RESUMO DA DECISÃO</small>
              <strong>${escapeHtml(item.summary || '—')}</strong>
            </div>
            <div class="arch-hl-item">
              <small>⚽ ARTILHEIRO DA EDIÇÃO</small>
              <strong>${escapeHtml(item.topScorer || 'Kylian Mbappé / Destaque da Liga')}</strong>
            </div>
            <div class="arch-hl-item">
              <small>🧤 MELHOR DEFESA</small>
              <strong>${escapeHtml(item.bestDefense || item.championTeam)}</strong>
            </div>
          </div>
        </div>

        <div class="arch-table-wrap">
          <h4 class="arch-table-heading">📋 Classificação / Campanha Final Arquivada</h4>
          <div class="arch-table-scroll">
            <table class="arch-standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Clube / Treinador</th>
                  <th title="Pontos">PTS</th>
                  <th title="Jogos">J</th>
                  <th title="Vitórias">V</th>
                  <th title="Empates">E</th>
                  <th title="Derrotas">D</th>
                  <th title="Gols Pró : Gols Contra">GP:GC</th>
                  <th>Fase Final</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    $('#archivedChampModal').hidden = false;
  }

  function closeArchivedTableModal() {
    $('#archivedChampModal').hidden = true;
  }

  /* ---------- 4. Admin: Configurar Campeonato em Curso (Copa Fácil) ---------- */
  function openActiveChampConfigModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('configurar o link do Copa Fácil')) return;
    const active = readActiveChamp();
    $('#cfgActiveTitle').value = active.title || '';
    $('#cfgActiveFormat').value = active.format || '';
    $('#cfgActiveSeason').value = active.seasonLabel || '';
    $('#cfgActiveUrl').value = active.copaFacilUrl || DEFAULT_COPA_FACIL_URL;
    $('#cfgActiveDesc').value = active.description || '';
    $('#activeChampConfigModal').hidden = false;
  }

  function closeActiveChampConfigModal() {
    $('#activeChampConfigModal').hidden = true;
  }

  /* ---------- 5. Admin: Adicionar / Editar Campeonato Arquivado ---------- */
  function populateClubSelectsInArchForm(selectedChamp = '', selectedRunner = '') {
    const clubs = readSquadClubs();
    const clubNames = clubs.length
      ? clubs.map((c) => c.name)
      : ['Gustavo FC', 'Joker FC', 'Al Kabib', 'Mazili MD FC', 'Xupé United', 'Resenha City'];

    const champSel = $('#archChampTeamInput');
    const runnerSel = $('#archRunnerTeamInput');
    if (champSel) {
      champSel.innerHTML = clubNames
        .map((n) => `<option value="${escapeHtml(n)}" ${norm(n) === norm(selectedChamp) ? 'selected' : ''}>${escapeHtml(n)}</option>`)
        .join('');
    }
    if (runnerSel) {
      runnerSel.innerHTML = clubNames
        .map((n) => `<option value="${escapeHtml(n)}" ${norm(n) === norm(selectedRunner) ? 'selected' : ''}>${escapeHtml(n)}</option>`)
        .join('');
    }
  }

  function openAddArchivedModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('arquivar campeonato')) return;
    $('#archEditId').value = '';
    $('#archFormModalTitle').textContent = 'Arquivar Campeonato Concluído';
    $('#archNameInput').value = '';
    $('#archYearInput').value = String(new Date().getFullYear());
    $('#archCategoryInput').value = 'liga';
    $('#archFormatInput').value = 'Pontos Corridos + Mata-Mata';
    $('#archCopaFacilUrlInput').value = '';
    populateClubSelectsInArchForm('Gustavo FC', 'Joker FC');
    $('#archChampManagerInput').value = 'Gustavo';
    $('#archChampScoreInput').value = '3';
    $('#archRunnerManagerInput').value = 'Kalleby';
    $('#archRunnerScoreInput').value = '2';
    $('#archExtraNoteInput').value = '';
    $('#archSummaryInput').value = '';
    $('#archivedChampFormModal').hidden = false;
  }

  function openEditArchivedModal(archId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('editar campeonato arquivado')) return;
    const list = readArchivedChamps();
    const item = list.find((c) => c.id === archId);
    if (!item) return;

    $('#archEditId').value = item.id;
    $('#archFormModalTitle').textContent = `Editar Arquivo: ${item.name}`;
    $('#archNameInput').value = item.name || '';
    $('#archYearInput').value = String(item.year || 2026);
    $('#archCategoryInput').value = item.category || 'liga';
    $('#archFormatInput').value = item.format || '';
    $('#archCopaFacilUrlInput').value = item.copaFacilUrl || '';
    populateClubSelectsInArchForm(item.championTeam, item.runnerTeam);
    $('#archChampManagerInput').value = item.championManager || '';
    $('#archChampScoreInput').value = String(item.championScore ?? 0);
    $('#archRunnerManagerInput').value = item.runnerManager || '';
    $('#archRunnerScoreInput').value = String(item.runnerScore ?? 0);
    $('#archExtraNoteInput').value = item.extraNote || '';
    $('#archSummaryInput').value = item.summary || '';
    $('#archivedChampFormModal').hidden = false;
  }

  function closeArchivedFormModal() {
    $('#archivedChampFormModal').hidden = true;
    $('#archEditId').value = '';
  }

  async function deleteArchivedChampionship(archId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('excluir campeonato arquivado')) return;
    const list = readArchivedChamps();
    const target = list.find((c) => c.id === archId);
    if (!target) return;

    const ok = await RBAC.confirmDelete({
      title: 'Excluir Campeonato do Histórico',
      message: `Deseja realmente excluir "${target.name}" (${target.year}) da galeria de campeonatos anteriores?`,
      confirmText: '🗑️ Sim, Excluir',
    });
    if (!ok) return;

    const next = list.filter((c) => c.id !== archId);
    writeArchivedChamps(next);
    renderPastChampionships();
    showToast(`"${target.name}" removido do histórico.`, 'info');
  }

  /* ---------- Event Listeners ---------- */
  $('#reloadCopaFacilBtn')?.addEventListener('click', () => {
    renderActiveChampionship(true);
    showToast('Sincronizando tabela com o Copa Fácil...', 'info');
  });

  $('#toggleEmbedExpandBtn')?.addEventListener('click', () => {
    state.isExpanded = !state.isExpanded;
    const viewport = $('#copaFacilViewport');
    const btn = $('#toggleEmbedExpandBtn');
    if (viewport) viewport.classList.toggle('is-expanded', state.isExpanded);
    if (btn) btn.textContent = state.isExpanded ? '⤡ Reduzir Painel' : '⤢ Expandir Painel';
  });

  $('#configActiveChampBtn')?.addEventListener('click', openActiveChampConfigModal);
  $('#closeActiveChampConfigModal')?.addEventListener('click', closeActiveChampConfigModal);
  $('#cancelActiveChampConfigBtn')?.addEventListener('click', closeActiveChampConfigModal);
  $('#activeChampConfigModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'activeChampConfigModal') closeActiveChampConfigModal();
  });

  $('#activeChampConfigForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#cfgActiveTitle').value.trim();
    const format = $('#cfgActiveFormat').value.trim();
    const seasonLabel = $('#cfgActiveSeason').value.trim();
    const copaFacilUrl = $('#cfgActiveUrl').value.trim();
    const description = $('#cfgActiveDesc').value.trim();

    if (!title || !copaFacilUrl) {
      return showToast('Preencha o nome do torneio e a URL pública do Copa Fácil.', 'error');
    }

    writeActiveChamp({
      title,
      format: format || 'Pontos Corridos + Mata-Mata',
      seasonLabel: seasonLabel || 'Edição Ativa',
      statusText: '🔴 EM ANDAMENTO',
      copaFacilUrl,
      description:
        description || 'Tabela de classificação oficial, rodadas e estatísticas integradas via Copa Fácil.',
    });

    closeActiveChampConfigModal();
    renderActiveChampionship(true);
    showToast('Campeonato em curso atualizado com sucesso!', 'info');
  });

  // Filtros da Galeria Histórica ([Todos], [Ligas], [Copas] + Ano)
  $('#pastChampsTypeFilter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-champ-filter]');
    if (!btn) return;
    state.typeFilter = btn.dataset.champFilter || 'all';
    document.querySelectorAll('#pastChampsTypeFilter .pill').forEach((p) => {
      p.classList.toggle('active', p === btn);
    });
    renderPastChampionships();
  });

  $('#pastChampsYearFilter')?.addEventListener('change', (e) => {
    state.yearFilter = e.target.value || 'all';
    renderPastChampionships();
  });

  // Clique nos cards de Campeonatos Anteriores
  $('#pastChampsGrid')?.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-view-archived]');
    if (viewBtn) {
      openArchivedTableModal(viewBtn.dataset.viewArchived);
      return;
    }

    const editBtn = e.target.closest('[data-edit-arch]');
    if (editBtn) {
      openEditArchivedModal(editBtn.dataset.editArch);
      return;
    }

    const delBtn = e.target.closest('[data-delete-arch]');
    if (delBtn) {
      deleteArchivedChampionship(delBtn.dataset.deleteArch);
    }
  });

  $('#closeArchivedChampModal')?.addEventListener('click', closeArchivedTableModal);
  $('#closeArchivedChampFooterBtn')?.addEventListener('click', closeArchivedTableModal);
  $('#archivedChampModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'archivedChampModal') closeArchivedTableModal();
  });

  // Auto-preencher treinador ao trocar o clube no formulário Admin
  $('#archChampTeamInput')?.addEventListener('change', (e) => {
    const v = getClubVisuals(e.target.value);
    if (v.manager) $('#archChampManagerInput').value = v.manager;
  });
  $('#archRunnerTeamInput')?.addEventListener('change', (e) => {
    const v = getClubVisuals(e.target.value);
    if (v.manager) $('#archRunnerManagerInput').value = v.manager;
  });

  $('#addArchivedChampBtn')?.addEventListener('click', openAddArchivedModal);
  $('#closeArchivedChampFormModal')?.addEventListener('click', closeArchivedFormModal);
  $('#cancelArchivedChampFormBtn')?.addEventListener('click', closeArchivedFormModal);
  $('#archivedChampFormModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'archivedChampFormModal') closeArchivedFormModal();
  });

  $('#archivedChampForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#archEditId').value.trim();
    const name = $('#archNameInput').value.trim();
    const year = Number($('#archYearInput').value) || new Date().getFullYear();
    const category = $('#archCategoryInput').value || 'liga';
    const format = $('#archFormatInput').value.trim() || 'Pontos Corridos + Mata-Mata';
    const copaFacilUrl = $('#archCopaFacilUrlInput').value.trim();
    const championTeam = $('#archChampTeamInput').value;
    const championManager = $('#archChampManagerInput').value.trim();
    const championScore = Number($('#archChampScoreInput').value) || 0;
    const runnerTeam = $('#archRunnerTeamInput').value;
    const runnerManager = $('#archRunnerManagerInput').value.trim();
    const runnerScore = Number($('#archRunnerScoreInput').value) || 0;
    const extraNote = $('#archExtraNoteInput').value.trim();
    const summary = $('#archSummaryInput').value.trim();

    if (!name || !championTeam || !runnerTeam) {
      return showToast('Preencha os campos obrigatórios da edição.', 'error');
    }

    const list = readArchivedChamps();
    if (editId) {
      const updated = list.map((c) =>
        c.id === editId
          ? {
              ...c,
              name,
              year,
              dateLabel: String(year),
              category,
              format,
              copaFacilUrl,
              championTeam,
              championManager,
              championScore,
              runnerTeam,
              runnerManager,
              runnerScore,
              extraNote,
              summary,
            }
          : c
      );
      writeArchivedChamps(updated);
      showToast(`"${name}" atualizado!`, 'info');
    } else {
      list.unshift({
        id: uid(),
        name,
        year,
        dateLabel: String(year),
        category,
        format,
        copaFacilUrl,
        championTeam,
        championManager,
        championScore,
        runnerTeam,
        runnerManager,
        runnerScore,
        extraNote,
        summary,
      });
      writeArchivedChamps(list);
      showToast(`"${name}" adicionado à galeria histórica!`, 'info');
    }

    closeArchivedFormModal();
    renderPastChampionships();
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#campeonatos') {
      renderActiveChampionship();
      renderPastChampionships();
    }
  });
  window.addEventListener('gbl:rolechange', renderPastChampionships);
  window.addEventListener('gbl:datachange', renderPastChampionships);

  /* ---------- Inicialização ---------- */
  renderActiveChampionship();
  renderPastChampionships();
})();
