/* ===== Gente Boa's League — Aba Ranking Geral & Temporada 2026 (js/ranking.js) ===== */
(() => {
  const RANKING_STORAGE_KEY = 'gbl.ranking.v2';
  const SQUADS_KEY = 'gbl.squads.v2';

  /**
   * 1. Ranking Geral / Histórico — Baseado nos 17 clubes oficiais da liga (18º time em breve)
   * Colunas exatas da planilha:
   * Posição (#) | Times / Jogador | Posição (pts base) | Oitavas | Quartas | Semi | Conquista (Título) | Vice | Terceiro | Vitórias | Empates | Gols | PONTOS
   */
  const DEFAULT_HISTORICAL_RANKING = [
    {
      id: 'rk_h1',
      name: 'Joker FC',
      ranking_detail: '1º no Ranking Geral',
      primaryColor: '#7e22ce',
      secondaryColor: '#f5c84c',
      posPts: 24.0,
      oitavas: 9,
      quartas: 8,
      semi: 6,
      conquista: 0,
      vice: 3,
      terceiro: 2,
      vitorias: 52,
      empates: 14,
      gols: 164,
      pontos: 107.4,
    },
    {
      id: 'rk_h2',
      name: 'Al Kabib',
      ranking_detail: '6 Títulos Conquistados',
      primaryColor: '#be123c',
      secondaryColor: '#38bdf8',
      posPts: 21.5,
      oitavas: 9,
      quartas: 8,
      semi: 7,
      conquista: 6,
      vice: 1,
      terceiro: 1,
      vitorias: 45,
      empates: 16,
      gols: 148,
      pontos: 93.8,
    },
    {
      id: 'rk_h3',
      name: 'Frog FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#16a34a',
      secondaryColor: '#2dd4bf',
      posPts: 19.5,
      oitavas: 8,
      quartas: 7,
      semi: 5,
      conquista: 1,
      vice: 2,
      terceiro: 2,
      vitorias: 41,
      empates: 15,
      gols: 135,
      pontos: 85.4,
    },
    {
      id: 'rk_h4',
      name: 'Sorriso FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#0284c7',
      secondaryColor: '#7dd3fc',
      posPts: 18.0,
      oitavas: 8,
      quartas: 7,
      semi: 5,
      conquista: 1,
      vice: 2,
      terceiro: 1,
      vitorias: 38,
      empates: 13,
      gols: 128,
      pontos: 77.1,
    },
    {
      id: 'rk_h5',
      name: 'Carvalhaes FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#dc2626',
      secondaryColor: '#111827',
      posPts: 15.0,
      oitavas: 7,
      quartas: 6,
      semi: 4,
      conquista: 1,
      vice: 1,
      terceiro: 1,
      vitorias: 28,
      empates: 11,
      gols: 96,
      pontos: 56.6,
    },
    {
      id: 'rk_h6',
      name: 'Beni FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#881337',
      secondaryColor: '#fda4af',
      posPts: 13.5,
      oitavas: 7,
      quartas: 5,
      semi: 3,
      conquista: 0,
      vice: 1,
      terceiro: 2,
      vitorias: 25,
      empates: 12,
      gols: 89,
      pontos: 50.8,
    },
    {
      id: 'rk_h7',
      name: 'Crew FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      posPts: 12.0,
      oitavas: 6,
      quartas: 5,
      semi: 3,
      conquista: 1,
      vice: 0,
      terceiro: 1,
      vitorias: 22,
      empates: 10,
      gols: 78,
      pontos: 43.6,
    },
    {
      id: 'rk_h8',
      name: 'Mazili M.D FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#0369a1',
      secondaryColor: '#facc15',
      posPts: 11.0,
      oitavas: 6,
      quartas: 4,
      semi: 2,
      conquista: 0,
      vice: 1,
      terceiro: 1,
      vitorias: 19,
      empates: 11,
      gols: 71,
      pontos: 38.5,
    },
    {
      id: 'rk_h9',
      name: 'The Beatles',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#1e3a8a',
      secondaryColor: '#e2e8f0',
      posPts: 9.5,
      oitavas: 5,
      quartas: 3,
      semi: 2,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 15,
      empates: 9,
      gols: 58,
      pontos: 29.6,
    },
    {
      id: 'rk_h10',
      name: 'Gustavo FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#065f46',
      secondaryColor: '#cbd5e1',
      posPts: 9.2,
      oitavas: 5,
      quartas: 3,
      semi: 1,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 15,
      empates: 8,
      gols: 56,
      pontos: 29.2,
    },
    {
      id: 'rk_h11',
      name: 'Ashen Lords',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#c2410c',
      secondaryColor: '#fdba74',
      posPts: 9.0,
      oitavas: 5,
      quartas: 3,
      semi: 1,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 14,
      empates: 9,
      gols: 55,
      pontos: 29.1,
    },
    {
      id: 'rk_h12',
      name: 'Fabricio FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#d97706',
      secondaryColor: '#fde68a',
      posPts: 7.5,
      oitavas: 4,
      quartas: 2,
      semi: 1,
      conquista: 1,
      vice: 0,
      terceiro: 0,
      vitorias: 11,
      empates: 6,
      gols: 42,
      pontos: 22.3,
    },
    {
      id: 'rk_h13',
      name: 'Cannabis Crew',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#15803d',
      secondaryColor: '#a855f7',
      posPts: 5.5,
      oitavas: 3,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 7,
      empates: 5,
      gols: 28,
      pontos: 13.8,
    },
    {
      id: 'rk_h14',
      name: 'Justin FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#1d4ed8',
      secondaryColor: '#facc15',
      posPts: 5.2,
      oitavas: 3,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 7,
      empates: 4,
      gols: 26,
      pontos: 13.3,
    },
    {
      id: 'rk_h15',
      name: 'Augusto FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#334155',
      secondaryColor: '#f8fafc',
      posPts: 5.0,
      oitavas: 2,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 6,
      empates: 5,
      gols: 24,
      pontos: 12.8,
    },
    {
      id: 'rk_h16',
      name: 'Adevogados FC',
      ranking_detail: 'Histórico GBL',
      primaryColor: '#ca8a04',
      secondaryColor: '#fef08a',
      posPts: 4.5,
      oitavas: 2,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 5,
      empates: 5,
      gols: 21,
      pontos: 11.4,
    },
    {
      id: 'rk_h17',
      name: 'Panissa FC',
      ranking_detail: '1 Título Conquistado',
      primaryColor: '#b91c1c',
      secondaryColor: '#f59e0b',
      posPts: 4.2,
      oitavas: 2,
      quartas: 1,
      semi: 1,
      conquista: 1,
      vice: 0,
      terceiro: 0,
      vitorias: 5,
      empates: 4,
      gols: 19,
      pontos: 11.2,
    },
  ];

  /**
   * 2. Temporada 2026 — Baseado nos 17 clubes oficiais do ano vigente (18º clube em breve)
   */
  const DEFAULT_SEASON_2026_RANKING = [
    {
      id: 'rk_s1',
      name: 'Joker FC',
      ranking_detail: '',
      primaryColor: '#7e22ce',
      secondaryColor: '#f5c84c',
      posPts: 24.0,
      oitavas: 9,
      quartas: 8,
      semi: 6,
      conquista: 0,
      vice: 3,
      terceiro: 2,
      vitorias: 52,
      empates: 14,
      gols: 164,
      pontos: 107.4,
    },
    {
      id: 'rk_s2',
      name: 'Al Kabib',
      ranking_detail: '',
      primaryColor: '#be123c',
      secondaryColor: '#38bdf8',
      posPts: 21.5,
      oitavas: 9,
      quartas: 8,
      semi: 7,
      conquista: 6,
      vice: 1,
      terceiro: 1,
      vitorias: 45,
      empates: 16,
      gols: 148,
      pontos: 93.8,
    },
    {
      id: 'rk_s3',
      name: 'Frog FC',
      ranking_detail: '',
      primaryColor: '#16a34a',
      secondaryColor: '#2dd4bf',
      posPts: 19.5,
      oitavas: 8,
      quartas: 7,
      semi: 5,
      conquista: 1,
      vice: 2,
      terceiro: 2,
      vitorias: 41,
      empates: 15,
      gols: 135,
      pontos: 85.4,
    },
    {
      id: 'rk_s4',
      name: 'Sorriso FC',
      ranking_detail: '',
      primaryColor: '#0284c7',
      secondaryColor: '#7dd3fc',
      posPts: 18.0,
      oitavas: 8,
      quartas: 7,
      semi: 5,
      conquista: 1,
      vice: 2,
      terceiro: 1,
      vitorias: 38,
      empates: 13,
      gols: 128,
      pontos: 77.1,
    },
    {
      id: 'rk_s5',
      name: 'Carvalhaes FC',
      ranking_detail: '',
      primaryColor: '#dc2626',
      secondaryColor: '#111827',
      posPts: 15.0,
      oitavas: 7,
      quartas: 6,
      semi: 4,
      conquista: 1,
      vice: 1,
      terceiro: 1,
      vitorias: 28,
      empates: 11,
      gols: 96,
      pontos: 56.6,
    },
    {
      id: 'rk_s6',
      name: 'Beni FC',
      ranking_detail: '',
      primaryColor: '#881337',
      secondaryColor: '#fda4af',
      posPts: 13.5,
      oitavas: 7,
      quartas: 5,
      semi: 3,
      conquista: 0,
      vice: 1,
      terceiro: 2,
      vitorias: 25,
      empates: 12,
      gols: 89,
      pontos: 50.8,
    },
    {
      id: 'rk_s7',
      name: 'Crew FC',
      ranking_detail: '',
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      posPts: 12.0,
      oitavas: 6,
      quartas: 5,
      semi: 3,
      conquista: 1,
      vice: 0,
      terceiro: 1,
      vitorias: 22,
      empates: 10,
      gols: 78,
      pontos: 43.6,
    },
    {
      id: 'rk_s8',
      name: 'Mazili M.D FC',
      ranking_detail: '',
      primaryColor: '#0369a1',
      secondaryColor: '#facc15',
      posPts: 11.0,
      oitavas: 6,
      quartas: 4,
      semi: 2,
      conquista: 0,
      vice: 1,
      terceiro: 1,
      vitorias: 19,
      empates: 11,
      gols: 71,
      pontos: 38.5,
    },
    {
      id: 'rk_s9',
      name: 'The Beatles',
      ranking_detail: '',
      primaryColor: '#1e3a8a',
      secondaryColor: '#e2e8f0',
      posPts: 9.5,
      oitavas: 5,
      quartas: 3,
      semi: 2,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 15,
      empates: 9,
      gols: 58,
      pontos: 29.6,
    },
    {
      id: 'rk_s10',
      name: 'Gustavo FC',
      ranking_detail: '',
      primaryColor: '#065f46',
      secondaryColor: '#cbd5e1',
      posPts: 9.2,
      oitavas: 5,
      quartas: 3,
      semi: 1,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 15,
      empates: 8,
      gols: 56,
      pontos: 29.2,
    },
    {
      id: 'rk_s11',
      name: 'Ashen Lords',
      ranking_detail: '',
      primaryColor: '#c2410c',
      secondaryColor: '#fdba74',
      posPts: 9.0,
      oitavas: 5,
      quartas: 3,
      semi: 1,
      conquista: 0,
      vice: 0,
      terceiro: 1,
      vitorias: 14,
      empates: 9,
      gols: 55,
      pontos: 29.1,
    },
    {
      id: 'rk_s12',
      name: 'Fabricio FC',
      ranking_detail: '',
      primaryColor: '#d97706',
      secondaryColor: '#fde68a',
      posPts: 7.5,
      oitavas: 4,
      quartas: 2,
      semi: 1,
      conquista: 1,
      vice: 0,
      terceiro: 0,
      vitorias: 11,
      empates: 6,
      gols: 42,
      pontos: 22.3,
    },
    {
      id: 'rk_s13',
      name: 'Cannabis Crew',
      ranking_detail: '',
      primaryColor: '#15803d',
      secondaryColor: '#a855f7',
      posPts: 5.5,
      oitavas: 3,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 7,
      empates: 5,
      gols: 28,
      pontos: 13.8,
    },
    {
      id: 'rk_s14',
      name: 'Justin FC',
      ranking_detail: '',
      primaryColor: '#1d4ed8',
      secondaryColor: '#facc15',
      posPts: 5.2,
      oitavas: 3,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 7,
      empates: 4,
      gols: 26,
      pontos: 13.3,
    },
    {
      id: 'rk_s15',
      name: 'Augusto FC',
      ranking_detail: '',
      primaryColor: '#334155',
      secondaryColor: '#f8fafc',
      posPts: 5.0,
      oitavas: 2,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 6,
      empates: 5,
      gols: 24,
      pontos: 12.8,
    },
    {
      id: 'rk_s16',
      name: 'Adevogados FC',
      ranking_detail: '',
      primaryColor: '#ca8a04',
      secondaryColor: '#fef08a',
      posPts: 4.5,
      oitavas: 2,
      quartas: 1,
      semi: 0,
      conquista: 0,
      vice: 0,
      terceiro: 0,
      vitorias: 5,
      empates: 5,
      gols: 21,
      pontos: 11.4,
    },
    {
      id: 'rk_s17',
      name: 'Panissa FC',
      ranking_detail: '',
      primaryColor: '#b91c1c',
      secondaryColor: '#f59e0b',
      posPts: 4.2,
      oitavas: 2,
      quartas: 1,
      semi: 1,
      conquista: 1,
      vice: 0,
      terceiro: 0,
      vitorias: 5,
      empates: 4,
      gols: 19,
      pontos: 11.2,
    },
  ];

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    activeView: 'historico', // 'historico' | 'temporada2026'
    searchQuery: '',
    sortBy: 'pontos',
    sortDir: 'desc',
  };

  /**
   * Formata números decimais usando vírgula como separador decimal (ex: 107,4 / 93,8 / 42,94)
   */
  function formatDecimalBR(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    if (Number.isInteger(num)) {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }

  function formatBasePtsBR(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  }

  /* ---------- Leitura e Gravação no LocalStorage ---------- */
  function readRawRankingStore() {
    try {
      const raw = GBLShared.getItem(RANKING_STORAGE_KEY);
      if (!raw) {
        const initial = {
          historico: DEFAULT_HISTORICAL_RANKING,
          temporada2026: DEFAULT_SEASON_2026_RANKING,
        };
        GBLShared.setItem(RANKING_STORAGE_KEY, JSON.stringify(initial));
        return JSON.parse(JSON.stringify(initial));
      }
      const parsed = JSON.parse(raw);
      return {
        sync: parsed?.sync,
        historico:
          Array.isArray(parsed?.historico) && parsed.historico.length
            ? parsed.historico
            : JSON.parse(JSON.stringify(DEFAULT_HISTORICAL_RANKING)),
        temporada2026:
          Array.isArray(parsed?.temporada2026) && parsed.temporada2026.length
            ? parsed.temporada2026
            : JSON.parse(JSON.stringify(DEFAULT_SEASON_2026_RANKING)),
      };
    } catch {
      return {
        historico: JSON.parse(JSON.stringify(DEFAULT_HISTORICAL_RANKING)),
        temporada2026: JSON.parse(JSON.stringify(DEFAULT_SEASON_2026_RANKING)),
      };
    }
  }

  function readRankingStore() { return window.GBLTeams.rankingStore(readRawRankingStore()); }

  function writeRankingStore(data) {
    GBLShared.setItem(RANKING_STORAGE_KEY, JSON.stringify(window.GBLTeams.rankingStore(data,false)));
    window.dispatchEvent(new CustomEvent('gbl:datachange'));
  }

  function getSortedList(viewKey = state.activeView) {
    const store = readRankingStore();
    const list = Array.isArray(store[viewKey]) ? [...store[viewKey]] : [];

    // Primeiro ordena por PONTOS decrescente para fixar a posição oficial (#1, #2, #3...)
    const byPointsDesc = [...list].sort((a, b) => {
      const diff = (Number(b.pontos) || 0) - (Number(a.pontos) || 0);
      if (diff !== 0) return diff;
      return (Number(b.vitorias) || 0) - (Number(a.vitorias) || 0);
    });

    const rankMap = new Map();
    byPointsDesc.forEach((item, idx) => {
      rankMap.set(item.id, idx + 1);
    });

    const enriched = list.map((item) => ({
      ...item,
      officialPos: rankMap.get(item.id) || 1,
    }));

    // Aplica filtro de busca
    const q = norm(state.searchQuery);
    const filtered = q
      ? enriched.filter((item) => norm(item.name).includes(q) || norm(item.subtitle).includes(q))
      : enriched;

    // Aplica ordenação da coluna ativa (padrão: PONTOS decrescente)
    const col = state.sortBy || 'pontos';
    const dir = state.sortDir === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (col === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR') * dir;
      }
      if (col === 'officialPos') {
        return (a.officialPos - b.officialPos) * dir;
      }
      const valA = Number(a[col]) || 0;
      const valB = Number(b[col]) || 0;
      if (valA !== valB) return (valA - valB) * dir;
      return a.officialPos - b.officialPos;
    });

    return { sorted: filtered, podiumTop3: byPointsDesc.slice(0, 3), totalCount: list.length };
  }

  function getInitials(name) {
    const words = String(name || '')
      .replace(/\b(fc|sc|ec|ac|md|cf|de|da|do)\b/gi, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!words.length) return 'GB';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function renderCrestAvatar(item) {
    if (typeof window.GBLBadges !== 'undefined') {
      return window.GBLBadges.renderCrestShell(item, { shellClass: 'rk-crest-avatar gbl-aspect-crest' });
    }
    const initials = getInitials(item.name);
    const primary = item.primaryColor || '#1d4ed8';
    const secondary = item.secondaryColor || '#f5c84c';
    return `<span class="rk-crest-avatar gbl-aspect-crest" style="background:radial-gradient(circle at 30% 25%, ${escapeHtml(primary)}, #051238 88%); border-color:${escapeHtml(secondary)}" aria-hidden="true">${escapeHtml(initials)}</span>`;
  }

  function renderPositionBadge(pos) {
    if (pos === 1) {
      return `<span class="rk-pos-badge rk-pos-gold" title="1º Lugar — Líder do Ranking">🥇 1º</span>`;
    }
    if (pos === 2) {
      return `<span class="rk-pos-badge rk-pos-silver" title="2º Lugar — Vice-Líder">🥈 2º</span>`;
    }
    if (pos === 3) {
      return `<span class="rk-pos-badge rk-pos-bronze" title="3º Lugar — G3">🥉 3º</span>`;
    }
    return `<span class="rk-pos-badge rk-pos-regular">${pos}º</span>`;
  }

  /* ---------- Renderização do Pódio G3 + Tabela Completa na Aba RANKING ---------- */
  function renderRankingPage() {
    const tableBody = $('#rankingTableBody');
    const podiumContainer = $('#rankingG3Podium');
    const modeLabel = $('#rankingActiveModeLabel');
    const entityHeader = $('#rkEntityColLabel');
    if (!tableBody) return;

    const isAdmin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : false;
    const { sorted, podiumTop3 } = getSortedList(state.activeView);

    if (modeLabel) {
      modeLabel.textContent =
        state.activeView === 'historico'
          ? 'RANKING GERAL / HISTÓRICO · JOGADORES INDIVIDUAIS'
          : 'TEMPORADA 2026 · CLASSIFICAÇÃO ACUMULADA POR CLUBE';
    }
    if (entityHeader) {
      entityHeader.textContent = state.activeView === 'historico' ? 'Jogador / Time' : 'Times / Jogador';
    }

    // Atualiza estado visual dos botões de filtro no topo
    $$('#rankingModeTabs [data-ranking-mode]').forEach((btn) => {
      const active = btn.dataset.rankingMode === state.activeView;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // Atualiza indicadores de ordenação nos cabeçalhos
    $$('#rankingFullTable th[data-rk-sort]').forEach((th) => {
      const col = th.dataset.rkSort;
      const isSorted = col === state.sortBy;
      th.classList.toggle('is-sorted', isSorted);
      const arrow = th.querySelector('.rk-sort-arrow');
      if (arrow) {
        arrow.textContent = isSorted ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕';
      }
    });

    // 1. Renderiza os 3 cards de destaque do G3 (Ouro, Prata e Bronze)
    if (podiumContainer) {
      const medals = [
        { cls: 'podium-gold', badge: '🥇 1º LUGAR · LÍDER GERAL', label: 'OURO' },
        { cls: 'podium-silver', badge: '🥈 2º LUGAR · VICE-LÍDER', label: 'PRATA' },
        { cls: 'podium-bronze', badge: '🥉 3º LUGAR · DESTAQUE G3', label: 'BRONZE' },
      ];

      podiumContainer.innerHTML = podiumTop3
        .map((item, idx) => {
          const m = medals[idx] || medals[2];
          return `
            <article class="card rk-podium-card ${m.cls}">
              <div class="rk-podium-top">
                <span class="rk-podium-rank-pill">${m.badge}</span>
                <span class="rk-podium-pts-badge">${formatDecimalBR(item.pontos)} <small>PTS</small></span>
              </div>
              <div class="rk-podium-identity">
                ${renderCrestAvatar(item)}
                <div class="rk-podium-text">
                  <h3>${escapeHtml(item.name)}</h3>
                  <span>${escapeHtml(item.subtitle || '')}</span>
                </div>
              </div>
              <div class="rk-podium-stats">
                <div><span>🏆 Títulos</span><strong>${item.conquista}</strong></div>
                <div><span>🥈 Vices</span><strong>${item.vice}</strong></div>
                <div><span>✅ Vitórias</span><strong>${item.vitorias}</strong></div>
                <div><span>⚽ Gols</span><strong>${item.gols}</strong></div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    // 2. Renderiza as linhas da Tabela Completa (13 colunas exatas)
    if (!sorted.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="14" class="rk-empty-row">
            Nenhum participante ou clube encontrado para o filtro pesquisado.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = sorted
      .map((row) => {
        const pos = row.officialPos;
        const g3RowClass = pos === 1 ? 'rk-row-gold' : pos === 2 ? 'rk-row-silver' : pos === 3 ? 'rk-row-bronze' : '';

        return `
          <tr class="rk-table-row ${g3RowClass}">
            <td class="rk-col-pos">
              ${renderPositionBadge(pos)}
            </td>
            <td class="rk-col-sticky">
              <div class="rk-entity-cell">
                ${renderCrestAvatar(row)}
                <div class="rk-entity-info">
                  <strong>${escapeHtml(row.name)}</strong>
                  <small>${escapeHtml(row.subtitle || '')}</small>
                </div>
                ${
                  isAdmin
                    ? `<button type="button" class="club-action-btn rk-row-edit-btn" data-edit-ranking="${escapeHtml(row.id)}" title="Editar pontuação de ${escapeHtml(row.name)}">✎</button>`
                    : ''
                }
              </div>
            </td>
            <td class="rk-col-num">${formatBasePtsBR(row.posPts)}</td>
            <td class="rk-col-num">${row.oitavas}</td>
            <td class="rk-col-num">${row.quartas}</td>
            <td class="rk-col-num">${row.semi}</td>
            <td class="rk-col-num rk-col-titles">${row.conquista > 0 ? `<span class="rk-trophy-pill">🏆 ${row.conquista}</span>` : '0'}</td>
            <td class="rk-col-num">${row.vice}</td>
            <td class="rk-col-num">${row.terceiro}</td>
            <td class="rk-col-num rk-col-wins"><strong>${row.vitorias}</strong></td>
            <td class="rk-col-num">${row.empates}</td>
            <td class="rk-col-num">${row.gols}</td>
            <td class="rk-col-total">
              <span class="rk-total-pts-badge">${formatDecimalBR(row.pontos)}</span>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  /* ---------- Modal Admin para Editar / Adicionar Linha do Ranking ---------- */
  function openRankingEditModal(rowId = null) {
    if (typeof RBAC !== 'undefined' && !RBAC.isAdmin()) return;
    const modal = $('#rankingFormModal');
    const form = $('#rankingEditForm');
    if (!modal || !form) return;

    const store = readRankingStore();
    const list = store[state.activeView] || [];
    const existing = rowId ? list.find((r) => r.id === rowId) : null;

    const titleEl = $('#rankingModalTitle');
    if (titleEl) {
      titleEl.textContent = existing
        ? `✎ Editar Pontuação · ${existing.name}`
        : `➕ Adicionar ao ${state.activeView === 'historico' ? 'Ranking Geral' : 'Ranking 2026'}`;
    }

    $('#rkEditId').value = existing?.id || '';
    $('#rkNameInput').value = existing?.name || '';
    $('#rkSubtitleInput').value = existing?.ranking_detail || existing?.subtitle || (state.activeView === 'historico' ? 'Histórico GBL' : 'Temporada 2026');
    $('#rkPosPtsInput').value = existing?.posPts ?? 10;
    $('#rkOitavasInput').value = existing?.oitavas ?? 0;
    $('#rkQuartasInput').value = existing?.quartas ?? 0;
    $('#rkSemiInput').value = existing?.semi ?? 0;
    $('#rkConquistaInput').value = existing?.conquista ?? 0;
    $('#rkViceInput').value = existing?.vice ?? 0;
    $('#rkTerceiroInput').value = existing?.terceiro ?? 0;
    $('#rkVitoriasInput').value = existing?.vitorias ?? 0;
    $('#rkEmpatesInput').value = existing?.empates ?? 0;
    $('#rkGolsInput').value = existing?.gols ?? 0;
    $('#rkPontosInput').value = existing?.pontos ?? 0;

    modal.hidden = false;
  }

  function closeRankingEditModal() {
    const modal = $('#rankingFormModal');
    if (modal) modal.hidden = true;
  }

  function handleSaveRankingRow(e) {
    e.preventDefault();
    if (typeof RBAC !== 'undefined' && !RBAC.isAdmin()) return;

    const editId = $('#rkEditId').value.trim();
    const name = $('#rkNameInput').value.trim();
    if (!name) return;

    const parseDecimalInput = (val) => {
      const normalized = String(val ?? '0').replace(',', '.');
      const num = parseFloat(normalized);
      return Number.isFinite(num) ? num : 0;
    };

    const store = readRankingStore();
    const list = store[state.activeView] || [];
    const existing = editId ? list.find((r) => r.id === editId) : null;

    const payload = {
      id: existing?.id || `rk_${uid()}`,
      name,
      team_id: window.GBLTeams.find(null,name)?.id,
      ranking_detail: $('#rkSubtitleInput').value.trim() || 'Gente Boa’s League',
      primaryColor: existing?.primaryColor || '#22e07a',
      secondaryColor: existing?.secondaryColor || '#f5c84c',
      posPts: parseDecimalInput($('#rkPosPtsInput').value),
      oitavas: parseInt($('#rkOitavasInput').value, 10) || 0,
      quartas: parseInt($('#rkQuartasInput').value, 10) || 0,
      semi: parseInt($('#rkSemiInput').value, 10) || 0,
      conquista: parseInt($('#rkConquistaInput').value, 10) || 0,
      vice: parseInt($('#rkViceInput').value, 10) || 0,
      terceiro: parseInt($('#rkTerceiroInput').value, 10) || 0,
      vitorias: parseInt($('#rkVitoriasInput').value, 10) || 0,
      empates: parseInt($('#rkEmpatesInput').value, 10) || 0,
      gols: parseInt($('#rkGolsInput').value, 10) || 0,
      pontos: parseDecimalInput($('#rkPontosInput').value),
    };

    if (editId) {
      const idx = list.findIndex((r) => r.id === editId);
      if (idx >= 0) list[idx] = payload;
    } else {
      list.push(payload);
    }

    store[state.activeView] = list;
    writeRankingStore(store);
    closeRankingEditModal();
    renderRankingPage();
  }

  /* ---------- API Pública para o Widget Lateral da Home ---------- */
  function getTopGeneralRanking(limit = 5) {
    const store = readRankingStore();
    const list = Array.isArray(store.historico) ? [...store.historico] : [...DEFAULT_HISTORICAL_RANKING];
    list.sort((a, b) => {
      const diff = (Number(b.pontos) || 0) - (Number(a.pontos) || 0);
      if (diff !== 0) return diff;
      return (Number(b.vitorias) || 0) - (Number(a.vitorias) || 0);
    });
    return list.slice(0, limit).map((item, idx) => ({
      ...item,
      pos: idx + 1,
      pontosFormatted: formatDecimalBR(item.pontos),
    }));
  }

  window.GBLRanking = {
    getTopGeneralRanking,
    formatDecimalBR,
    renderRankingPage,
  };

  /* ---------- Eventos e Inicialização ---------- */
  function bindEvents() {
    // Alternância entre [Ranking Geral / Histórico] e [Temporada 2026]
    const modeTabs = $('#rankingModeTabs');
    if (modeTabs) {
      modeTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-ranking-mode]');
        if (!btn) return;
        state.activeView = btn.dataset.rankingMode;
        state.sortBy = 'pontos';
        state.sortDir = 'desc';
        renderRankingPage();
      });
    }

    // Busca rápida por jogador ou clube
    const searchInput = $('#rankingSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        state.searchQuery = searchInput.value;
        renderRankingPage();
      });
    }

    // Ordenação clicando nas colunas da tabela
    const tableHead = $('#rankingFullTable thead');
    if (tableHead) {
      tableHead.addEventListener('click', (e) => {
        const th = e.target.closest('th[data-rk-sort]');
        if (!th) return;
        const col = th.dataset.rkSort;
        if (state.sortBy === col) {
          state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
        } else {
          state.sortBy = col;
          state.sortDir = col === 'name' || col === 'officialPos' ? 'asc' : 'desc';
        }
        renderRankingPage();
      });
    }

    // Botão Admin de adicionar ou editar linha
    $('#openAddRankingRowBtn')?.addEventListener('click', () => openRankingEditModal(null));
    $('#closeRankingFormModal')?.addEventListener('click', closeRankingEditModal);
    $('#cancelRankingFormBtn')?.addEventListener('click', closeRankingEditModal);
    $('#rankingEditForm')?.addEventListener('submit', handleSaveRankingRow);

    $('#rankingTableBody')?.addEventListener('click', (e) => {
      const editBtn = e.target.closest('[data-edit-ranking]');
      if (editBtn) {
        openRankingEditModal(editBtn.dataset.editRanking);
      }
    });

    window.addEventListener('gbl:rolechange', renderRankingPage);
    window.addEventListener('gbl:datachange', renderRankingPage);
    window.addEventListener('gbl:badgechange', renderRankingPage);
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    renderRankingPage();
  });
  window.GBLTeams.linkStored();
})();
