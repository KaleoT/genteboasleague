/**
 * Feriados nacionais do Brasil (fixos e móveis) + pontos facultativos comuns.
 * Os feriados móveis são calculados a partir da data da Páscoa.
 */
const Holidays = (() => {
  const cache = new Map();

  const pad = (n) => String(n).padStart(2, '0');
  const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

  // Algoritmo de Meeus/Jones/Butcher para o Domingo de Páscoa (calendário gregoriano)
  function easter(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  function shift(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function build(year) {
    const map = new Map();
    const add = (y, m, d, name, type = 'nacional') => map.set(key(y, m, d), { name, type });
    const addDate = (date, name, type) =>
      add(date.getFullYear(), date.getMonth() + 1, date.getDate(), name, type);

    // Fixos
    add(year, 1, 1, 'Confraternização Universal');
    add(year, 4, 21, 'Tiradentes');
    add(year, 5, 1, 'Dia do Trabalho');
    add(year, 9, 7, 'Independência do Brasil');
    add(year, 10, 12, 'Nossa Sra. Aparecida');
    add(year, 11, 2, 'Finados');
    add(year, 11, 15, 'Proclamação da República');
    if (year >= 2024) add(year, 11, 20, 'Consciência Negra');
    add(year, 12, 25, 'Natal');

    // Móveis
    const e = easter(year);
    addDate(shift(e, -48), 'Carnaval', 'facultativo');
    addDate(shift(e, -47), 'Carnaval', 'facultativo');
    addDate(shift(e, -46), 'Quarta de Cinzas', 'facultativo');
    addDate(shift(e, -2), 'Sexta-feira Santa');
    addDate(e, 'Páscoa', 'facultativo');
    addDate(shift(e, 60), 'Corpus Christi', 'facultativo');

    // Vésperas
    add(year, 12, 24, 'Véspera de Natal', 'facultativo');
    add(year, 12, 31, 'Véspera de Ano Novo', 'facultativo');

    return map;
  }

  /** Retorna { name, type } ou null para uma data no formato YYYY-MM-DD */
  function get(dateKey) {
    const year = Number(dateKey.slice(0, 4));
    if (!cache.has(year)) cache.set(year, build(year));
    return cache.get(year).get(dateKey) || null;
  }

  return { get };
})();
