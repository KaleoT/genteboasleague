/* ===== Gente Boa's League — app ===== */
(() => {
  const PERIODS = [
    { id: 'manha', label: 'Manhã', hours: '08h–12h', icon: '☀️' },
    { id: 'tarde', label: 'Tarde', hours: '12h–18h', icon: '🌤️' },
    { id: 'noite', label: 'Noite', hours: '18h–00h', icon: '🌙' },
  ];
  const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  const $ = (sel) => document.querySelector(sel);
  const pad = (n) => String(n).padStart(2, '0');
  const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => s.trim().toLowerCase();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toKey(today);

  const state = {
    year: today.getFullYear(),
    month: today.getMonth(),
    selected: new Map(), // dateKey -> Set(periodIds)
    editingName: null,   // nome do jogador quando está editando votos já salvos
    open: new Set(),     // cards do ranking que estão expandidos
  };

  /* ---------- Info de um dia ---------- */
  function dayInfo(key) {
    const d = fromKey(key);
    const wd = d.getDay();
    return {
      date: d,
      weekday: WEEKDAYS[wd],
      isWeekend: wd === 0 || wd === 6,
      holiday: Holidays.get(key),
      label: `${pad(d.getDate())} de ${MONTHS[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`,
    };
  }

  function holidayBadge(h) {
    if (!h) return '';
    const cls = h.type === 'nacional' ? 'badge-holiday' : 'badge-optional';
    const txt = h.type === 'nacional' ? 'Feriado' : 'Ponto facultativo';
    return `<span class="badge ${cls}" title="${txt}">🎉 ${escapeHtml(h.name)}</span>`;
  }

  /* ---------- Abas (com proteção RBAC de rotas administrativas) ---------- */
  const ADMIN_ROUTES = new Set(['admin', 'administracao', 'painel-admin']);

  function showTab(name) {
    const clean = String(name || '').trim().toLowerCase();
    if (ADMIN_ROUTES.has(clean)) {
      if (typeof RBAC !== 'undefined' && !RBAC.isAdmin()) {
        toast('🔒 Acesso restrito a administradores.');
        history.replaceState(null, '', '#inicio');
        name = 'inicio';
      } else {
        name = 'admin';
      }
    }
    if (!document.querySelector(`[data-tab="${name}"]`)) name = 'inicio';
    document.querySelectorAll('[data-tab]').forEach((p) => (p.hidden = p.dataset.tab !== name));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tabLink === name));
    if (typeof RBAC !== 'undefined') RBAC.applyGuards();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
  window.addEventListener('gbl:rolechange', () => {
    if (ADMIN_ROUTES.has(location.hash.slice(1).toLowerCase()) && typeof RBAC !== 'undefined' && !RBAC.isAdmin()) {
      showTab('admin');
    }
  });

  /* ---------- Contagem de disponibilidade ---------- */
  function countByDate() {
    const map = new Map();
    Store.all().forEach((r) => {
      if (!map.has(r.date)) map.set(r.date, new Set());
      map.get(r.date).add(r.name.trim().toLowerCase());
    });
    return map;
  }

  /* ---------- Calendário ---------- */
  function renderCalendar() {
    const { year, month } = state;
    $('#monthLabel').textContent = `${MONTHS[month]} ${year}`;
    $('#prevMonth').disabled = year === today.getFullYear() && month === today.getMonth();

    const first = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const counts = countByDate();
    const grid = $('#calGrid');
    let html = '';

    for (let i = 0; i < first; i++) html += '<span class="day empty"></span>';

    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${pad(month + 1)}-${pad(d)}`;
      const info = dayInfo(key);
      const past = info.date < today;
      const classes = ['day'];
      if (past) classes.push('past');
      if (key === todayKey) classes.push('today');
      if (info.isWeekend) classes.push('weekend');
      if (info.holiday) classes.push(info.holiday.type === 'nacional' ? 'holiday' : 'optional');
      if (state.selected.has(key)) classes.push('selected');

      const people = counts.get(key)?.size || 0;
      const title = `${info.weekday}, ${info.label}${info.holiday ? ' — ' + info.holiday.name : ''}`;

      html += `
        <button class="${classes.join(' ')}" data-key="${key}" ${past ? 'disabled' : ''} title="${escapeHtml(title)}">
          <span class="day-num">${d}</span>
          ${info.holiday ? `<span class="day-hol">${escapeHtml(info.holiday.name)}</span>` : ''}
          ${people ? `<span class="day-people">👥 ${people}</span>` : ''}
        </button>`;
    }
    grid.innerHTML = html;
  }

  $('#calGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.day[data-key]');
    if (!btn || btn.disabled) return;
    if(!RBAC.requireMember())return;
    const key = btn.dataset.key;
    if (state.selected.has(key)) state.selected.delete(key);
    else state.selected.set(key, new Set());
    renderCalendar();
    renderSummary();
  });

  $('#prevMonth').addEventListener('click', () => {
    if (--state.month < 0) { state.month = 11; state.year--; }
    renderCalendar();
  });
  $('#nextMonth').addEventListener('click', () => {
    if (++state.month > 11) { state.month = 0; state.year++; }
    renderCalendar();
  });

  /* ---------- Resumo (sidebar) ---------- */
  function renderSummary() {
    const list = $('#selectedList');
    const keys = [...state.selected.keys()].sort();
    $('#clearSelection').hidden = keys.length === 0;

    const banner = $('#editBanner');
    if (state.editingName) {
      banner.hidden = false;
      banner.innerHTML = `✎ Editando os votos de <strong>${escapeHtml(state.editingName)}</strong>. Datas removidas serão canceladas. <button class="link-btn" id="cancelEdit">Sair da edição</button>`;
      $('#confirmBtn').textContent = 'Salvar alterações';
    } else {
      banner.hidden = true;
      $('#confirmBtn').textContent = 'Confirmar reserva';
    }

    if (!keys.length) {
      list.innerHTML = `<div class="empty-state">Clique nos dias do calendário para adicioná-los à sua reserva.</div>`;
      $('#summaryTotal').textContent = 'Nenhuma data selecionada';
      return;
    }

    list.innerHTML = keys
      .map((key) => {
        const info = dayInfo(key);
        const chosen = state.selected.get(key);
        return `
        <div class="sel-item" data-key="${key}">
          <div class="sel-top">
            <div>
              <div class="sel-weekday ${info.isWeekend ? 'is-weekend' : ''}">${info.weekday}</div>
              <div class="sel-date">${info.label}</div>
              ${holidayBadge(info.holiday)}
            </div>
            <button class="icon-btn small" data-remove="${key}" aria-label="Remover data">✕</button>
          </div>
          <div class="periods">
            ${PERIODS.map(
              (p) => `
              <button class="period ${chosen.has(p.id) ? 'on' : ''}" data-period="${p.id}" data-key="${key}">
                <span class="p-icon">${p.icon}</span>
                <span class="p-label">${p.label}</span>
                <span class="p-hours">${p.hours}</span>
              </button>`
            ).join('')}
          </div>
        </div>`;
      })
      .join('');

    const totalPeriods = keys.reduce((s, k) => s + state.selected.get(k).size, 0);
    $('#summaryTotal').innerHTML = `<strong>${keys.length}</strong> ${keys.length === 1 ? 'dia' : 'dias'} · <strong>${totalPeriods}</strong> ${totalPeriods === 1 ? 'período' : 'períodos'}`;
  }

  $('#selectedList').addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      state.selected.delete(rm.dataset.remove);
      renderCalendar();
      renderSummary();
      return;
    }
    const p = e.target.closest('[data-period]');
    if (p) {
      const set = state.selected.get(p.dataset.key);
      set.has(p.dataset.period) ? set.delete(p.dataset.period) : set.add(p.dataset.period);
      renderSummary();
    }
  });

  $('#clearSelection').addEventListener('click', () => {
    state.selected.clear();
    renderCalendar();
    renderSummary();
  });

  /* ---------- Confirmar ---------- */
  $('#confirmBtn').addEventListener('click', async () => {
    if(!RBAC.requireMember())return;
    const nameInput = $('#playerName');
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      nameInput.classList.add('invalid');
      return toast('Informe seu nome para confirmar.');
    }
    if (!state.selected.size && !state.editingName) return toast('Selecione pelo menos uma data no calendário.');

    const missing = [...state.selected.entries()].filter(([, s]) => s.size === 0);
    if (missing.length) {
      const info = dayInfo(missing[0][0]);
      return toast(`Escolha o período para ${info.weekday.toLowerCase()}, ${pad(info.date.getDate())}/${pad(info.date.getMonth() + 1)}.`);
    }

    const entries = [...state.selected.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, set]) => ({ date, periods: PERIODS.map((p) => p.id).filter((id) => set.has(id)) }));

    if (state.editingName) {
      if (!entries.length) {
        const ok = await RBAC.confirmDelete({
          title: 'Cancelar Votos',
          message: 'Nenhuma data selecionada. Deseja cancelar todos os seus votos?',
          confirmText: '🗑️ Cancelar Votos',
        });
        if (!ok) return;
      }
      try{await Store.replaceFuture(name, entries, todayKey);}catch(error){return RBAC.showToast(error.message);}
    } else {
      try{await Store.saveMany(name, entries);}catch(error){return RBAC.showToast(error.message);}
    }
    Store.setLastName(name);
    state.selected.clear();
    state.editingName = null;
    renderAll();

    if (entries.length) openModal(name, entries);
    else toast('Seus votos foram cancelados.');
  });

  $('#playerName').addEventListener('input', (e) => {
    e.target.classList.remove('invalid');
    // trocar o nome sai do modo edição (os votos carregados são de outra pessoa)
    if (state.editingName && norm(e.target.value) !== norm(state.editingName)) {
      state.editingName = null;
      renderSummary();
    }
  });

  $('#editBanner').addEventListener('click', (e) => {
    if (e.target.id !== 'cancelEdit') return;
    state.editingName = null;
    state.selected.clear();
    renderCalendar();
    renderSummary();
  });

  /* ---------- Botão "Marcar / editar meus votos" ---------- */
  $('#editVotesBtn').addEventListener('click', () => {
    if(!RBAC.requireMember())return;
    const nameInput = $('#playerName');
    const profileName = typeof RBAC !== 'undefined' && RBAC.getProfile ? RBAC.getProfile()?.user_name : '';
    const name = nameInput.value.trim() || profileName || Store.getLastName();
    document.querySelector('.booking').scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!name) {
      setTimeout(() => nameInput.focus(), 400);
      return toast('Digite seu nome e escolha os dias no calendário.');
    }
    nameInput.value = name;

    const mine = Store.byName(name, todayKey);
    if (!mine.length) return toast(`Escolha os dias no calendário, ${name}.`);

    state.selected = new Map(mine.map((r) => [r.date, new Set(r.periods)]));
    state.editingName = name;
    const first = fromKey([...state.selected.keys()].sort()[0]);
    state.year = first.getFullYear();
    state.month = first.getMonth();
    renderCalendar();
    renderSummary();
    toast(`Votos de ${name} carregados. Ajuste e salve.`, 'info');
  });

  /* ---------- Modal ---------- */
  function openModal(name, entries) {
    $('#modalText').innerHTML = `Valeu, <strong>${escapeHtml(name)}</strong>! Sua presença foi registrada para:`;
    $('#modalList').innerHTML = entries
      .map((e) => {
        const info = dayInfo(e.date);
        const per = e.periods.map((id) => PERIODS.find((p) => p.id === id)).map((p) => `${p.icon} ${p.label}`).join(' · ');
        return `<li><strong>${info.weekday}, ${pad(info.date.getDate())}/${pad(info.date.getMonth() + 1)}</strong>${info.holiday ? ` <em>(${escapeHtml(info.holiday.name)})</em>` : ''}<br><span>${per}</span></li>`;
      })
      .join('');
    $('#modal').hidden = false;
  }
  $('#modalClose').addEventListener('click', () => ($('#modal').hidden = true));
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') $('#modal').hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#modal').hidden = true; });

  /* ---------- Disponibilidade da galera (ranking) ---------- */
  function buildRanking() {
    const byDate = new Map();
    Store.all()
      .filter((r) => r.date >= todayKey && r.periods.length)
      .forEach((r) => {
        if (!byDate.has(r.date)) byDate.set(r.date, []);
        byDate.get(r.date).push(r);
      });

    return [...byDate.entries()]
      .map(([key, rows]) => {
        const total = new Set(rows.map((r) => norm(r.name))).size;
        const periods = PERIODS.map((p) => ({
          ...p,
          rows: rows.filter((r) => r.periods.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name)),
        }));
        const max = Math.max(...periods.map((p) => p.rows.length));
        const hot = periods.filter((p) => p.rows.length === max);
        return { key, info: dayInfo(key), total, periods, max, hot };
      })
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total || b.max - a.max || a.key.localeCompare(b.key));
  }

  const CHEVRON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function renderAvailability() {
    const container = $('#availability');
    const ranking = buildRanking();
    const profileName = typeof RBAC !== 'undefined' && RBAC.getProfile ? RBAC.getProfile()?.user_name : '';
    const me = norm($('#playerName').value || profileName || Store.getLastName());

    if (!ranking.length) {
      container.innerHTML = `
        <div class="card empty-state big">
          <span class="empty-icon">📅</span>
          Nenhuma data selecionada ainda. Seja o primeiro a marcar sua disponibilidade!
        </div>`;
      return;
    }

    container.innerHTML = ranking
      .map((d, i) => {
        const open = state.open.has(d.key);
        const pos = i + 1;
        const hotLabel = d.hot.map((p) => p.label).join(' e ');
        return `
        <article class="rank-card ${open ? 'open' : ''} ${pos === 1 ? 'top' : ''}" data-key="${d.key}">
          <button class="rank-head" aria-expanded="${open}" aria-controls="rank-body-${d.key}">
            <span class="rank-pos">${pos === 1 ? '🏆' : `#${pos}`}</span>
            <span class="rank-date">
              <span class="sel-weekday ${d.info.isWeekend ? 'is-weekend' : ''}">${d.info.weekday}</span>
              <span class="avail-date">${d.info.label}</span>
              ${holidayBadge(d.info.holiday)}
            </span>
            <span class="rank-meta">
              <span class="players-badge">👥 ${plural(d.total, 'jogador', 'jogadores')}</span>
              <span class="hot-tag">🔥 Mais votado: ${hotLabel} (${plural(d.max, 'voto', 'votos')})</span>
            </span>
            <span class="chevron">${CHEVRON}</span>
          </button>
          <div class="rank-body" id="rank-body-${d.key}">
            <div class="rank-body-inner">
              <div class="period-cols">
                ${d.periods
                  .map((p) => {
                    const isHot = p.rows.length === d.max;
                    return `
                  <section class="pcol pcol-${p.id} ${isHot ? 'is-hot' : ''}">
                    <header class="pcol-head">
                      <span class="pcol-icon">${p.icon}</span>
                      <span class="pcol-title">${p.label}<small>${p.hours}</small></span>
                      <span class="pcol-count">${p.rows.length}</span>
                    </header>
                    <div class="chips">
                      ${
                        p.rows.length
                          ? p.rows
                              .map(
                                (r) => `
                        <span class="chip ${norm(r.name) === me ? 'me' : ''}">
                          ${escapeHtml(r.name)}
                          <button class="chip-x" data-remove-vote="${r.id}" data-vote-period="${p.id}" data-vote-name="${escapeHtml(r.name)}" aria-label="Remover ${escapeHtml(r.name)} da ${p.label}" title="Remover deste turno">✕</button>
                        </span>`
                              )
                              .join('')
                          : '<span class="pcol-empty">Ninguém neste turno</span>'
                      }
                    </div>
                  </section>`;
                  })
                  .join('')}
              </div>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  $('#availability').addEventListener('click', async (e) => {
    const x = e.target.closest('[data-remove-vote]');
    if (x) {
      if(!RBAC.requireMember())return;
      const period = PERIODS.find((p) => p.id === x.dataset.votePeriod);
      const ok = await RBAC.confirmDelete({
        title: 'Remover Presença do Turno',
        message: `Remover ${x.dataset.voteName} do turno da ${period.label.toLowerCase()}?`,
        confirmText: '🗑️ Remover do Turno',
      });
      if (ok) {
        try{await Store.removePeriod(x.dataset.removeVote, period.id);}catch(error){return RBAC.showToast(error.message);}
        renderAll();
        toast('Voto removido.', 'info');
      }
      return;
    }

    const head = e.target.closest('.rank-head');
    if (!head) return;
    const card = head.closest('.rank-card');
    const key = card.dataset.key;
    const open = !card.classList.contains('open');
    card.classList.toggle('open', open);
    head.setAttribute('aria-expanded', open);
    open ? state.open.add(key) : state.open.delete(key);
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg, type = 'error') {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('info', type === 'info');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  window.addEventListener('gbl:datachange',renderAll);
  /* ---------- Init ---------- */
  function syncProfileName() {
    const profile = typeof RBAC !== 'undefined' && RBAC.getProfile ? RBAC.getProfile() : null;
    const savedName = profile?.user_name || Store.getLastName() || '';
    const nameInput = $('#playerName');
    if (nameInput) {
      nameInput.value = savedName;
      nameInput.classList.remove('invalid');
    }
    renderAvailability();
  }

  window.addEventListener('gbl:profilechange', syncProfileName);
  window.addEventListener('gbl:rolechange', syncProfileName);

  function renderAll() {
    renderCalendar();
    renderSummary();
    renderAvailability();
  }

  syncProfileName();
  renderAll();
  showTab(location.hash.slice(1) || 'inicio');
})();
