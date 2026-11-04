/* ===== Gente Boa's League — Portal Editorial de Notícias (Estilo GE) ===== */
(() => {
  const NEWS_KEY = 'gbl.news.v2';
  const TRANSFERS_KEY = 'gbl.transfers.v2';
  const SQUADS_KEY = 'gbl.squads.v2';

  const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const WEEKDAYS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const DEFAULT_NEWS = [
    {
      id: 'news-hero-1',
      placement: 'hero',
      category: 'DECISÃO',
      timeAgo: 'há 35 minutos',
      author: 'Redação GBL',
      relatedTab: '#campeonatos',
      relatedLabel: 'Ver Tabela da Temporada 9 no Copa Fácil →',
      visualTheme: 'hero-championship',
      clubs: ['Joker FC', 'Al Kabib', 'Frog FC'],
      title: "Temporada 9 pega fogo: G4 embolado e clássicos diretos prometem sacudir a próxima resenha presencial",
      subtitle:
        "Com Joker FC (107,4 PT), Al Kabib (93,8 PT), Frog FC (85,4 PT) e Sorriso FC (77,1 PT) no topo do ranking, clubes preparam força máxima no PES 21.",
      bullets: [
        'Al Kabib ostenta 6 títulos na Sala de Troféus e mira o topo do Ranking Geral',
        '17 clubes confirmados na disputa enquanto a 18ª equipe aguarda anúncio oficial em breve',
      ],
      body: `A 9ª Temporada da Xupé Gente Boa's League entrou na reta decisiva da fase classificatória com equilíbrio histórico entre os 17 clubes confirmados (com o 18º time chegando em breve). Líder do Ranking Geral com 107,4 pontos, o Joker FC vê o hexacampeão Al Kabib (93,8 PT) e o Frog FC (85,4 PT) na cola.\n\nNos bastidores, os treinadores aproveitaram a janela de transferências para ajustar as formações táticas e preencher as 5 vagas do banco de reservas. A expectativa agora se volta para a confirmação da próxima data presencial no calendário oficial da liga.`,
    },
    {
      id: 'news-sec-1',
      placement: 'secondary',
      category: 'MERCADO',
      timeAgo: 'há 2 horas',
      author: 'Plantão do Mercado',
      relatedTab: '#transferencias',
      relatedLabel: 'Conferir Feed de Transferências →',
      visualTheme: 'theme-market',
      clubs: ['Al Kabib', 'Mazili M.D FC'],
      title: 'Janela fervendo: propostas via WhatsApp aceleram trocas de estrelas e picks de draft',
      subtitle:
        'Treinadores usam o simulador oficial para fechar empréstimos e trocas definitivas antes do bloqueio de saldo.',
      body: `O novo sistema de Propostas via WhatsApp movimentou os bastidores dos clubes da liga. Em menos de 48 horas, diversas sondagens envolvendo meio-campistas de Overall 86+ e escolhas futuras de draft chegaram às mesas dos treinadores.\n\nVale lembrar que cada equipe dispõe de no máximo 3 negociações por temporada no painel oficial de Transferências.`,
    },
    {
      id: 'news-sec-2',
      placement: 'secondary',
      category: 'TÁTICA & ELENCOS',
      timeAgo: 'há 4 horas',
      author: 'Análise Tática GBL',
      relatedTab: '#elencos',
      relatedLabel: 'Explorar os Elencos e Kits 3D →',
      visualTheme: 'theme-kits',
      clubs: ['Al Kabib', 'Joker FC'],
      title: 'Novos mantos em campo: clubes exibem uniformes 3D e ajustam esquemas 4-3-3 com 5 reservas',
      subtitle:
        'Padronização do plantel em 11 titulares + 5 substitutos exige escolhas cirúrgicas de cada comandante.',
      body: `A atualização visual da central de Elencos trouxe a vitrine de uniformes em perspectiva 3D (Casa e Visitante) e consolidou a regra de 16 atletas por plantel ativo (11 titulares no gramado + 5 substitutos imediatos).\n\nCom o banco mais enxuto e competitivo, ter jogadores versáteis capazes de atuar em mais de uma faixa do campo virou diferencial estratégico nas partidas decididas na prorrogação.`,
    },
    {
      id: 'news-sec-3',
      placement: 'secondary',
      category: 'GIRO DA RODADA',
      timeAgo: 'há 5 horas',
      author: 'Redação GBL',
      relatedTab: '#titulos',
      relatedLabel: 'Ver Galeria de Títulos & Recordes →',
      visualTheme: 'theme-trophy',
      clubs: ['Al Kabib', 'Frog FC'],
      title: 'Hegemonia e tradição: confira todos os campeões que já levantaram a taça da liga',
      subtitle:
        'Al Kabib lidera isolado com 6 conquistas, seguido por Frog FC, Sorriso FC, Carvalhaes FC, Crew FC, Fabricio FC e Panissa FC.',
      body: `Nenhuma vantagem é segura até o apito final na Xupé Gente Boa's League. O levantamento histórico da Sala de Troféus mostra o domínio do Al Kabib com 6 títulos, além das conquistas históricas de Frog FC, Sorriso FC, Carvalhaes FC, Crew FC, Fabricio FC e Panissa FC.\n\nConfira na aba Títulos todos os placares históricos e os recordistas da competição.`,
    },
    {
      id: 'news-feed-1',
      placement: 'feed',
      category: 'BASTIDORES',
      timeAgo: 'há 7 horas',
      author: 'Agenda Presencial',
      relatedTab: '#agendamento',
      relatedLabel: 'Votar nas Datas da Próxima Resenha →',
      visualTheme: 'theme-schedule',
      clubs: ['Sorriso FC', 'Carvalhaes FC'],
      title: 'Quórum em alta: votação para o próximo encontro presencial já reúne treinadores nos 3 períodos',
      subtitle:
        'Sistema estilo reserva de hotel destaca feriados e aponta automaticamente o melhor dia e turno para a galera.',
      body: `A aba de Agendamento segue recebendo os votos dos treinadores para definir o dia da próxima maratona presencial de PES 21. O ranking inteligente cruza os períodos da Manhã, Tarde e Noite para indicar a janela com maior número de confirmados.`,
    },
    {
      id: 'news-feed-2',
      placement: 'feed',
      category: 'MERCADO',
      timeAgo: 'há 9 horas',
      author: 'Plantão do Mercado',
      relatedTab: '#transferencias',
      relatedLabel: 'Abrir Simulador de Propostas →',
      visualTheme: 'theme-market',
      clubs: ['Joker FC', 'Beni FC'],
      title: 'Empréstimos estratégicos viram arma para reforçar defesas sem comprometer estrelas do time titular',
      subtitle:
        'Negociações temporárias com data de expiração permitem testar zagueiros e goleiros de elite por uma edição.',
      body: `Com o limite de 3 trocas por temporada, vários treinadores têm recorrido à modalidade de Empréstimo com vigência determinada para suprir carências pontuais na zaga e nas laterais sem abrir mão em definitivo de seus titulares.`,
    },
    {
      id: 'news-feed-3',
      placement: 'feed',
      category: 'DECISÃO',
      timeAgo: 'há 12 horas',
      author: 'Estatísticas GBL',
      relatedTab: '#campeonatos',
      relatedLabel: 'Consultar Campeonato em Curso →',
      visualTheme: 'theme-trophy',
      clubs: ['Al Kabib', 'Gustavo FC'],
      title: 'Raio-X dos ataques: média de gols da liga supera 3,8 por partida e consagra esquemas ofensivos',
      subtitle:
        'Formações 4-3-3 e 4-2-1-3 dominam as escolhas dos clubes inscritos na temporada atual.',
      body: `Quem joga na retranca fica para trás na Gente Boa's League. Os números consolidados mostram que a maioria dos treinadores utiliza variações do 4-3-3 com pontas agudos e meia-atacante infiltrador, mantendo a média histórica de quase 4 gols por jogo.`,
    },
    {
      id: 'news-feed-4',
      placement: 'feed',
      category: 'BASTIDORES',
      timeAgo: 'há 1 dia',
      author: 'Comissão Organizadora',
      relatedTab: '#sobre',
      relatedLabel: 'Ler Regulamento Oficial na Aba Sobre →',
      visualTheme: 'theme-kits',
      clubs: ['Mazili M.D FC', 'Joker FC'],
      title: 'Guia da Temporada: confira as regras atualizadas de limite de elenco, reservas e saldo de negociações',
      subtitle:
        'Todas as diretrizes oficiais do campeonato estão disponíveis para consulta rápida no portal.',
      body: `A Comissão Organizadora consolidou na seção Sobre todas as regras vigentes da Xupé Gente Boa's League: elencos de 16 jogadores (11 titulares + 5 reservas), teto de 3 transferências por clube e fluxo oficial de validação pelo Painel Admin.`,
    },
  ];

  const RANKING_TOP5_FALLBACK = [
    { pos: 1, name: 'Joker FC', ranking_detail: '0 Títulos', vitorias: 52, pontosFormatted: '107,4', primaryColor: '#7e22ce', secondaryColor: '#f5c84c' },
    { pos: 2, name: 'Al Kabib', ranking_detail: '6 Títulos', vitorias: 45, pontosFormatted: '93,8', primaryColor: '#be123c', secondaryColor: '#38bdf8' },
    { pos: 3, name: 'Frog FC', ranking_detail: '1 Título', vitorias: 41, pontosFormatted: '85,4', primaryColor: '#16a34a', secondaryColor: '#2dd4bf' },
    { pos: 4, name: 'Sorriso FC', ranking_detail: '1 Título', vitorias: 38, pontosFormatted: '77,1', primaryColor: '#0284c7', secondaryColor: '#7dd3fc' },
    { pos: 5, name: 'Carvalhaes FC', ranking_detail: '1 Título', vitorias: 28, pontosFormatted: '56,6', primaryColor: '#dc2626', secondaryColor: '#111827' },
  ];

  const $ = (sel) => document.querySelector(sel);
  const uid = () => 'news-' + Math.random().toString(36).slice(2, 9);
  const norm = (s) => String(s || '').trim().toLowerCase();
  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = {
    feedCategory: 'all',
  };

  /* ---------- Persistência de Notícias ---------- */
  function readNews() {
    try {
      const raw = GBLShared.getItem(NEWS_KEY);
      if (!raw) {
        GBLShared.setItem(NEWS_KEY, JSON.stringify(DEFAULT_NEWS));
        return JSON.parse(JSON.stringify(DEFAULT_NEWS));
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(DEFAULT_NEWS));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_NEWS));
    }
  }

  function writeNews(list) {
    GBLShared.setItem(NEWS_KEY, JSON.stringify(list));
  }

  function readSquadClubs() {
    try {
      const raw = GBLShared.getItem(SQUADS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

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
      primary: found?.primaryColor || '#1d4ed8',
      secondary: found?.secondaryColor || '#f5c84c',
    };
  }

  function renderMiniCrest(teamName) {
    if (typeof window.GBLBadges !== 'undefined') {
      return window.GBLBadges.renderCrestShell(teamName, { shellClass: 'ge-mini-crest gbl-aspect-crest' });
    }
    const { initials, primary, secondary } = getClubVisuals(teamName);
    return `<span class="ge-mini-crest gbl-aspect-crest" style="background:radial-gradient(circle at 30% 25%, ${escapeHtml(primary)}, #051238 88%); border-color:${escapeHtml(secondary)}" title="${escapeHtml(teamName)}">${escapeHtml(initials)}</span>`;
  }

  function getCategoryColorClass(category) {
    const c = String(category || '').toUpperCase();
    if (c.includes('MERCADO')) return 'ge-cat-market';
    if (c.includes('DECIS')) return 'ge-cat-decision';
    if (c.includes('TÁTICA') || c.includes('ELENCO')) return 'ge-cat-tactics';
    if (c.includes('RODADA')) return 'ge-cat-round';
    return 'ge-cat-backstage';
  }

  /** Gera a ilustração de capa temática para os cards secundários e miniaturas do feed */
  function renderArticleCoverThumb(item) {
    const clubs = Array.isArray(item.clubs) && item.clubs.length ? item.clubs : ['Al Kabib', 'Joker FC'];
    const crestsHtml = clubs.slice(0, 2).map((c) => renderMiniCrest(c)).join('');
    const theme = item.visualTheme || 'theme-market';

    if (theme === 'theme-kits') {
      return `
        <div class="ge-thumb-art art-kits">
          <img src="assets/kit-home.png" alt="" class="ge-thumb-kit-img" loading="lazy" />
          <div class="ge-thumb-crests">${crestsHtml}</div>
          <span class="ge-thumb-watermark">ELENCOS 3D</span>
        </div>`;
    }
    if (theme === 'theme-trophy') {
      return `
        <div class="ge-thumb-art art-trophy">
          <span class="ge-thumb-big-icon" aria-hidden="true">🏆</span>
          <div class="ge-thumb-crests">${crestsHtml}</div>
          <span class="ge-thumb-watermark">HISTÓRICO GBL</span>
        </div>`;
    }
    if (theme === 'theme-schedule') {
      return `
        <div class="ge-thumb-art art-schedule">
          <span class="ge-thumb-big-icon" aria-hidden="true">🗓️</span>
          <div class="ge-thumb-crests">${crestsHtml}</div>
          <span class="ge-thumb-watermark">RESENHA PRESENCIAL</span>
        </div>`;
    }
    return `
      <div class="ge-thumb-art art-market">
        <span class="ge-thumb-big-icon" aria-hidden="true">⇄</span>
        <div class="ge-thumb-crests">${crestsHtml}</div>
        <span class="ge-thumb-watermark">MERCADO PES 21</span>
      </div>`;
  }

  /* ---------- 1. Renderização da Coluna Principal (Manchete + Secundárias + Feed) ---------- */
  function renderEditorialMainColumn() {
    const allNews = readNews();
    const admin = typeof RBAC !== 'undefined' ? RBAC.isAdmin() : false;

    const heroItem = allNews.find((n) => n.placement === 'hero') || allNews[0];
    const secondaryItems = allNews.filter((n) => n.id !== heroItem?.id && n.placement === 'secondary').slice(0, 3);
    const usedIds = new Set([heroItem?.id, ...secondaryItems.map((s) => s.id)]);
    const feedItemsAll = allNews.filter((n) => !usedIds.has(n.id));

    // 1A. Super Manchete Principal (Topo)
    const heroWrap = $('#geHeroHeadlineWrap');
    if (heroWrap && heroItem) {
      const catCls = getCategoryColorClass(heroItem.category);
      const clubsBadges = (heroItem.clubs || [])
        .map((c) => `<span class="ge-hero-club-chip">${renderMiniCrest(c)} ${escapeHtml(c)}</span>`)
        .join('');
      const bulletsHtml = Array.isArray(heroItem.bullets) && heroItem.bullets.length
        ? `<ul class="ge-hero-bullets">
             ${heroItem.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
           </ul>`
        : '';

      heroWrap.innerHTML = `
        <article class="card ge-hero-card" data-open-article="${escapeHtml(heroItem.id)}" role="button" tabindex="0">
          <div class="ge-hero-media">
            <img src="assets/banner.png" alt="Destaque Gente Boa's League" class="ge-hero-bg-img" />
            <div class="ge-hero-overlay"></div>
          </div>

          <div class="ge-hero-content">
            <div class="ge-hero-top-meta">
              <span class="ge-tag-badge ${catCls}">${escapeHtml(heroItem.category)}</span>
              <div class="ge-hero-clubs-row">${clubsBadges}</div>
              ${
                admin
                  ? `<div class="ge-admin-card-btns">
                       <button type="button" class="club-action-btn" data-edit-article="${escapeHtml(heroItem.id)}" title="Editar manchete">✎</button>
                     </div>`
                  : ''
              }
            </div>

            <h2 class="ge-hero-title">${escapeHtml(heroItem.title)}</h2>
            <p class="ge-hero-lead">${escapeHtml(heroItem.subtitle)}</p>
            ${bulletsHtml}

            <div class="ge-hero-foot">
              <span class="ge-time-meta">🕒 ${escapeHtml(heroItem.timeAgo)} — Por <strong>${escapeHtml(heroItem.author || 'Redação GBL')}</strong></span>
              <span class="ge-read-more-cta">Ler matéria completa →</span>
            </div>
          </div>
        </article>
      `;
    }

    // 1B. Grade de Notícias Secundárias (3 cards lado a lado)
    const secGrid = $('#geSecondaryGrid');
    if (secGrid) {
      secGrid.innerHTML = secondaryItems
        .map((item) => {
          const catCls = getCategoryColorClass(item.category);
          return `
            <article class="card ge-sec-card" data-open-article="${escapeHtml(item.id)}" role="button" tabindex="0">
              <div class="ge-sec-thumb-wrap">
                ${renderArticleCoverThumb(item)}
                <span class="ge-tag-badge ${catCls} ge-sec-floating-tag">${escapeHtml(item.category)}</span>
                ${
                  admin
                    ? `<div class="ge-sec-admin-btns">
                         <button type="button" class="club-action-btn" data-edit-article="${escapeHtml(item.id)}" title="Editar matéria">✎</button>
                         <button type="button" class="club-action-btn danger" data-delete-article="${escapeHtml(item.id)}" title="Excluir matéria">🗑️</button>
                       </div>`
                    : ''
                }
              </div>
              <div class="ge-sec-body">
                <h3 class="ge-sec-title">${escapeHtml(item.title)}</h3>
                <p class="ge-sec-lead">${escapeHtml(item.subtitle)}</p>
                <div class="ge-sec-meta">
                  <span>🕒 ${escapeHtml(item.timeAgo)}</span>
                  <span class="ge-sec-dot">•</span>
                  <span>${escapeHtml(item.author || 'Redação GBL')}</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('');
    }

    // 1C. Feed Contínuo de "Últimas Notícias"
    const feedEl = $('#geLatestFeed');
    if (feedEl) {
      const filteredFeed = feedItemsAll.filter((item) => {
        if (state.feedCategory === 'all') return true;
        return String(item.category || '').toUpperCase().includes(state.feedCategory);
      });

      if (!filteredFeed.length) {
        feedEl.innerHTML = `
          <div class="empty-state">
            Nenhuma notícia nesta editoria no momento. Selecione "Todas" para ver o feed completo.
          </div>`;
      } else {
        feedEl.innerHTML = filteredFeed
          .map((item) => {
            const catCls = getCategoryColorClass(item.category);
            return `
              <article class="ge-feed-item" data-open-article="${escapeHtml(item.id)}" role="button" tabindex="0">
                <div class="ge-feed-thumb">
                  ${renderArticleCoverThumb(item)}
                </div>
                <div class="ge-feed-content">
                  <div class="ge-feed-top-row">
                    <span class="ge-kicker ${catCls}">${escapeHtml(item.category)}</span>
                    ${
                      admin
                        ? `<div class="ge-feed-admin-btns">
                             <button type="button" class="club-action-btn" data-edit-article="${escapeHtml(item.id)}" title="Editar matéria">✎</button>
                             <button type="button" class="club-action-btn danger" data-delete-article="${escapeHtml(item.id)}" title="Excluir matéria">🗑️</button>
                           </div>`
                        : ''
                    }
                  </div>
                  <h3 class="ge-feed-title">${escapeHtml(item.title)}</h3>
                  <p class="ge-feed-excerpt">${escapeHtml(item.subtitle)}</p>
                  <div class="ge-feed-meta">
                    <span>🕒 ${escapeHtml(item.timeAgo)}</span>
                    <span>— Em ${escapeHtml(item.category)}</span>
                  </div>
                </div>
              </article>
            `;
          })
          .join('');
      }
    }
  }

  /* ---------- 2. Renderização da Sidebar Informativa (3 Widgets) ---------- */

  /** Widget 1: Ranking Geral da Liga (Top 5) */
  function renderWidgetStandings() {
    const container = $('#geMiniStandingsBody');
    if (!container) return;

    const top5 =
      typeof window.GBLRanking !== 'undefined' && typeof window.GBLRanking.getTopGeneralRanking === 'function'
        ? window.GBLRanking.getTopGeneralRanking(5)
        : RANKING_TOP5_FALLBACK;

    const rowsHtml = top5
      .map((row) => {
        const pos = row.pos;
        const posBadgeClass =
          pos === 1
            ? 'ge-rk-pos-gold'
            : pos === 2
            ? 'ge-rk-pos-silver'
            : pos === 3
            ? 'ge-rk-pos-bronze'
            : 'ge-rk-pos-normal';

        const clubHint = window.GBLTeams.find(row.team_id,row.name)?.manager || row.manager || '';
        const initials = getInitials(row.name);
        const primary = row.primaryColor || '#1d4ed8';
        const secondary = row.secondaryColor || '#f5c84c';
        const avatarHtml =
          typeof window.GBLBadges !== 'undefined'
            ? window.GBLBadges.renderCrestShell(row, { shellClass: 'ge-mini-crest gbl-aspect-crest' })
            : `<span class="ge-mini-crest gbl-aspect-crest" style="background:radial-gradient(circle at 30% 25%, ${escapeHtml(primary)}, #051238 88%); border-color:${escapeHtml(secondary)}" title="${escapeHtml(row.name)}">${escapeHtml(initials)}</span>`;

        return `
      <tr class="ge-g4-row ${pos <= 3 ? 'is-g3-highlight' : ''}">
        <td class="ge-pos-cell">
          <span class="ge-rk-pos-pill ${posBadgeClass}">${pos}º</span>
        </td>
        <td class="ge-club-cell">
          ${avatarHtml}
          <div class="ge-club-cell-text">
            <strong>${escapeHtml(row.name)}</strong>
            <small>${escapeHtml(clubHint)}</small>
          </div>
        </td>
        <td class="ge-wins-cell">${row.vitorias}</td>
        <td class="ge-pts-cell"><span class="ge-rk-pts-pill">${escapeHtml(row.pontosFormatted)}</span></td>
      </tr>`;
      })
      .join('');

    container.innerHTML = `
      <table class="ge-mini-table ge-mini-ranking-table" aria-label="Top 5 do Ranking Geral da Liga">
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Jogador / Time</th>
            <th title="Vitórias Acumuladas">Vitórias</th>
            <th title="Total de Pontos">Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  /** Widget 2: Próxima Rodada / Agendamento (Data mais votada da resenha presencial) */
  function renderWidgetNextMatchday() {
    const container = $('#geNextMatchdayBody');
    if (!container) return;

    const records = typeof Store !== 'undefined' ? Store.all() : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // Agrupa votos por data futura
    const byDate = new Map();
    records.forEach((r) => {
      if (!r.date || r.date < todayKey) return;
      if (!byDate.has(r.date)) {
        byDate.set(r.date, { players: new Set(), periods: { manha: 0, tarde: 0, noite: 0 } });
      }
      const entry = byDate.get(r.date);
      entry.players.add(r.name.trim());
      (r.periods || []).forEach((p) => {
        if (entry.periods[p] !== undefined) entry.periods[p]++;
      });
    });

    if (byDate.size > 0) {
      const sorted = Array.from(byDate.entries()).sort((a, b) => {
        const diff = b[1].players.size - a[1].players.size;
        return diff !== 0 ? diff : a[0].localeCompare(b[0]);
      });

      const [bestDateKey, info] = sorted[0];
      const [y, m, d] = bestDateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const weekdayName = WEEKDAYS_FULL[dateObj.getDay()];
      const holiday = typeof Holidays !== 'undefined' ? Holidays.get(bestDateKey) : null;

      const periodLabels = { manha: '☀️ Manhã', tarde: '🌤️ Tarde', noite: '🌙 Noite' };
      const bestPeriodKey = Object.keys(info.periods).sort((a, b) => info.periods[b] - info.periods[a])[0] || 'noite';
      const playerList = Array.from(info.players);

      container.innerHTML = `
        <div class="ge-matchday-spotlight">
          <div class="ge-date-calendar-badge">
            <span class="cal-month">${MONTHS_SHORT[m - 1].toUpperCase()}</span>
            <strong class="cal-day">${pad(d)}</strong>
          </div>
          <div class="ge-matchday-info">
            <span class="ge-most-voted-tag">🔥 DATA LÍDER EM VOTOS</span>
            <strong>${escapeHtml(weekdayName)}, ${pad(d)}/${pad(m)}</strong>
            <small>Turno favorito: <strong>${periodLabels[bestPeriodKey]}</strong></small>
            ${holiday ? `<span class="ge-holiday-mini">🎉 ${escapeHtml(holiday.name)}</span>` : ''}
          </div>
        </div>

        <div class="ge-confirmed-box">
          <div class="ge-confirmed-head">
            <span>👥 Treinadores disponíveis</span>
            <strong>${playerList.length} confirmado(s)</strong>
          </div>
          <div class="ge-confirmed-chips">
            ${playerList
              .slice(0, 6)
              .map((name) => `<span class="ge-player-chip">${escapeHtml(name)}</span>`)
              .join('')}
            ${playerList.length > 6 ? `<span class="ge-player-chip more">+${playerList.length - 6}</span>` : ''}
          </div>
        </div>
      `;
    } else {
      // Caso ainda não haja votos futuros no calendário, sugere o próximo sábado
      const nextSat = new Date(today);
      const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7;
      nextSat.setDate(today.getDate() + daysUntilSat);
      const d = pad(nextSat.getDate());
      const m = nextSat.getMonth();

      container.innerHTML = `
        <div class="ge-matchday-spotlight">
          <div class="ge-date-calendar-badge">
            <span class="cal-month">${MONTHS_SHORT[m].toUpperCase()}</span>
            <strong class="cal-day">${d}</strong>
          </div>
          <div class="ge-matchday-info">
            <span class="ge-most-voted-tag">📢 VOTAÇÃO ABERTA</span>
            <strong>Próximo Fim de Semana</strong>
            <small>Marque seus dias e turnos livres no calendário da liga!</small>
          </div>
        </div>
        <p class="ge-schedule-empty-note">
          Seja o primeiro a registrar disponibilidade para definir a data da próxima resenha presencial.
        </p>
      `;
    }
  }

  /** Widget 3: Plantão do Mercado (Últimas 3 trocas confirmadas) */
  function renderWidgetTransfers() {
    const container = $('#geMarketTickerBody');
    if (!container) return;

    let transfers = [];
    try {
      transfers = JSON.parse(GBLShared.getItem(TRANSFERS_KEY) || '[]');
    } catch {}

    const latest = transfers.slice(0, 3);
    if (!latest.length) {
      container.innerHTML = `
        <div class="empty-state">
          Nenhuma negociação confirmada recentemente.
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="ge-market-list">
        ${latest
          .map((tr) => {
            const isLoan = tr.type === 'emprestimo';
            const typeBadge = isLoan
              ? `<span class="ge-tr-type loan">EMPRÉSTIMO</span>`
              : `<span class="ge-tr-type perm">TROCA DEFINITIVA</span>`;
            const assetsA = (tr.assetsA || []).join(', ') || '—';
            const assetsB = (tr.assetsB || []).join(', ') || '—';

            return `
              <div class="ge-market-item">
                <div class="ge-market-item-top">
                  ${typeBadge}
                  <small>${escapeHtml(tr.time || '')}</small>
                </div>
                <div class="ge-market-clubs">
                  <span class="ge-m-club">${renderMiniCrest(tr.teamA)} <strong>${escapeHtml(tr.teamA)}</strong></span>
                  <span class="ge-m-swap" aria-hidden="true">⇄</span>
                  <span class="ge-m-club">${renderMiniCrest(tr.teamB)} <strong>${escapeHtml(tr.teamB)}</strong></span>
                </div>
                <div class="ge-market-assets">
                  <span>📤 ${escapeHtml(assetsA)}</span>
                  <span>📥 ${escapeHtml(assetsB)}</span>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  function renderHomePortal() {
    renderEditorialMainColumn();
    renderWidgetStandings();
    renderWidgetNextMatchday();
    renderWidgetTransfers();
  }

  /* ---------- Modal de Leitura Completa da Matéria ---------- */
  function openArticleModal(articleId) {
    const list = readNews();
    const item = list.find((n) => n.id === articleId);
    if (!item) return;

    const catEl = $('#newsModalCategory');
    if (catEl) {
      catEl.textContent = item.category || 'NOTÍCIA';
      catEl.className = `ge-tag-badge ${getCategoryColorClass(item.category)}`;
    }

    if ($('#newsModalTime')) {
      $('#newsModalTime').textContent = `🕒 ${item.timeAgo} · Por ${item.author || 'Redação GBL'}`;
    }

    const actionLink = $('#newsModalActionLink');
    if (actionLink) {
      actionLink.href = item.relatedTab || '#campeonatos';
      actionLink.textContent = item.relatedLabel || 'Ir para Seção Relacionada →';
    }

    const paragraphs = String(item.body || item.subtitle || '')
      .split(/\n+/)
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p)}</p>`)
      .join('');

    const bodyEl = $('#newsModalBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <h2 class="ge-modal-headline">${escapeHtml(item.title)}</h2>
        <p class="ge-modal-lead">${escapeHtml(item.subtitle)}</p>
        <div class="ge-modal-clubs-strip">
          ${(item.clubs || []).map((c) => `<span class="ge-hero-club-chip">${renderMiniCrest(c)} ${escapeHtml(c)}</span>`).join('')}
        </div>
        <div class="ge-modal-article-text">
          ${paragraphs}
        </div>
      `;
    }

    $('#newsArticleModal').hidden = false;
  }

  function closeArticleModal() {
    $('#newsArticleModal').hidden = true;
  }

  /* ---------- Admin: Publicar / Editar Matéria ---------- */
  function showToast(msg, type = 'info') {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function openNewArticleModal() {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('publicar matérias')) return;
    $('#newsEditId').value = '';
    $('#newsFormModalTitle').textContent = '📰 Publicar Nova Matéria na Capa';
    $('#newsCatInput').value = 'MERCADO';
    $('#newsPlacementInput').value = 'feed';
    $('#newsTimeInput').value = 'Agora mesmo';
    $('#newsTitleInput').value = '';
    $('#newsSubtitleInput').value = '';
    $('#newsBodyInput').value = '';
    $('#newsFormModal').hidden = false;
  }

  function openEditArticleModal(articleId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('editar matérias')) return;
    const list = readNews();
    const item = list.find((n) => n.id === articleId);
    if (!item) return;

    $('#newsEditId').value = item.id;
    $('#newsFormModalTitle').textContent = '✎ Editar Matéria';
    $('#newsCatInput').value = item.category || 'MERCADO';
    $('#newsPlacementInput').value = item.placement || 'feed';
    $('#newsTimeInput').value = item.timeAgo || 'Agora mesmo';
    $('#newsTitleInput').value = item.title || '';
    $('#newsSubtitleInput').value = item.subtitle || '';
    $('#newsBodyInput').value = item.body || '';
    $('#newsFormModal').hidden = false;
  }

  function closeNewsFormModal() {
    $('#newsFormModal').hidden = true;
    $('#newsEditId').value = '';
  }

  async function deleteArticle(articleId) {
    if (typeof RBAC !== 'undefined' && !RBAC.requireAdmin('excluir matérias')) return;
    const list = readNews();
    const target = list.find((n) => n.id === articleId);
    if (!target) return;

    const ok = await RBAC.confirmDelete({
      title: 'Excluir Matéria do Portal',
      message: `Deseja realmente remover a notícia "${target.title}" do portal inicial?`,
      confirmText: '🗑️ Sim, Excluir',
    });
    if (!ok) return;

    writeNews(list.filter((n) => n.id !== articleId));
    renderEditorialMainColumn();
    showToast('Matéria excluída do portal.', 'info');
  }

  /* ---------- Event Listeners ---------- */
  $('#inicio')?.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-article]');
    if (editBtn) {
      e.stopPropagation();
      openEditArticleModal(editBtn.dataset.editArticle);
      return;
    }

    const delBtn = e.target.closest('[data-delete-article]');
    if (delBtn) {
      e.stopPropagation();
      deleteArticle(delBtn.dataset.deleteArticle);
      return;
    }

    const articleCard = e.target.closest('[data-open-article]');
    if (articleCard) {
      openArticleModal(articleCard.dataset.openArticle);
    }
  });

  $('#geFeedCategoryFilter')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-news-cat]');
    if (!btn) return;
    state.feedCategory = btn.dataset.newsCat || 'all';
    document.querySelectorAll('#geFeedCategoryFilter .pill').forEach((p) => {
      p.classList.toggle('active', p === btn);
    });
    renderEditorialMainColumn();
  });

  $('#closeNewsArticleModal')?.addEventListener('click', closeArticleModal);
  $('#closeNewsArticleFooterBtn')?.addEventListener('click', closeArticleModal);
  $('#newsModalActionLink')?.addEventListener('click', closeArticleModal);
  $('#newsArticleModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'newsArticleModal') closeArticleModal();
  });

  $('#openNewArticleModalBtn')?.addEventListener('click', openNewArticleModal);
  $('#closeNewsFormModal')?.addEventListener('click', closeNewsFormModal);
  $('#cancelNewsFormBtn')?.addEventListener('click', closeNewsFormModal);
  $('#newsFormModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'newsFormModal') closeNewsFormModal();
  });

  $('#newsArticleForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = $('#newsEditId').value.trim();
    const category = $('#newsCatInput').value || 'MERCADO';
    const placement = $('#newsPlacementInput').value || 'feed';
    const timeAgo = $('#newsTimeInput').value.trim() || 'Agora mesmo';
    const title = $('#newsTitleInput').value.trim();
    const subtitle = $('#newsSubtitleInput').value.trim();
    const body = $('#newsBodyInput').value.trim();

    if (!title || !subtitle) {
      return showToast('Preencha o título e o subtítulo da matéria.', 'error');
    }

    let list = readNews();
    if (placement === 'hero') {
      list = list.map((n) => (n.placement === 'hero' ? { ...n, placement: 'secondary' } : n));
    }

    if (editId) {
      list = list.map((n) =>
        n.id === editId
          ? { ...n, category, placement, timeAgo, title, subtitle, body: body || subtitle }
          : n
      );
      writeNews(list);
      showToast('Matéria atualizada com sucesso!', 'info');
    } else {
      list.unshift({
        id: uid(),
        placement,
        category,
        timeAgo,
        author: 'Redação GBL',
        relatedTab: category === 'MERCADO' ? '#transferencias' : '#campeonatos',
        relatedLabel: 'Ver Seção Relacionada →',
        visualTheme: category === 'MERCADO' ? 'theme-market' : 'theme-trophy',
        clubs: ['Al Kabib', 'Gustavo FC'],
        title,
        subtitle,
        body: body || subtitle,
      });
      writeNews(list);
      showToast('Nova matéria publicada na capa!', 'info');
    }

    closeNewsFormModal();
    renderEditorialMainColumn();
  });

  // Atualiza widgets sempre que o usuário voltar à Home ou alterar dados
  window.addEventListener('hashchange', () => {
    if (!location.hash || location.hash === '#inicio') renderHomePortal();
  });
  window.addEventListener('gbl:rolechange', renderHomePortal);
  window.addEventListener('gbl:datachange', renderHomePortal);
  window.addEventListener('gbl:badgechange', renderHomePortal);

  /* ---------- Inicialização ---------- */
  renderHomePortal();
})();
