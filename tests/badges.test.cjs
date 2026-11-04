(async () => {
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const badgeSource = read('js/rbac.js').slice(read('js/rbac.js').indexOf('const GBLBadges ='));
const store = new Map();
let quota = Infinity;
const events = [];
const messages = [];
const context = {
  GBLShared: {
    getItem: (key) => store.get(key) ?? null,
    setItem(key, value) {
      const size = [...store].reduce((total, [k, v]) => total + (k === key ? 0 : v.length), value.length);
      if (size > quota) throw new Error('QuotaExceededError');
      store.set(key, value);
    },
  },
  window: { dispatchEvent: (event) => events.push(event) },
  RBAC: { requireAdmin: () => true, showToast: (message) => messages.push(message) },
  CustomEvent: function(type, options) { this.type = type; this.detail = options?.detail; },
};
vm.runInNewContext('(function() {\n' + badgeSource + '\n})();', context);
let badges = context.window.GBLBadges;
const names = Array.from({ length: 14 }, (_, i) => `Time ${i + 1} FC`)
  .concat(['Augusto FC', 'Adevogados FC', 'Panissa FC']);
const image = (i) => `data:image/png;base64,${String(i).padStart(3, '0')}${'A'.repeat(12000)}`;
const squads = names.map((name, i) => ({ id: `sq${i + 1}`, name, roster: [{ id: `p${i}` }],
  ...(i < 14 ? { badge_url: image(i), shield_image: image(i) } : {}) }));
const clubs = squads.map((sq, i) => ({ ...sq, id: `c${i + 1}` }));
const ranking = { historico: squads.map(sq => ({ ...sq })), temporada2026: squads.map(sq => ({ ...sq })) };
const map = {};
squads.slice(0, 14).forEach((sq, i) => { map[sq.name.toLowerCase()] = image(i); map[sq.id] = image(i); });
store.set('gbl.squads.v2', JSON.stringify(squads));
store.set('gbl.clubs.v2', JSON.stringify(clubs));
store.set('gbl.ranking.v2', JSON.stringify(ranking));
store.set('gbl.badges.v1', JSON.stringify(map));
const oldSize = [...store.values()].reduce((sum, value) => sum + value.length, 0);
quota = oldSize + 100;
assert.throws(() => context.GBLShared.setItem('extra', image(15)), /Quota/);
for (let i = 14; i < 17; i++) {
  assert.equal(badges.setClubBadge(`sq${i + 1}`, image(i)), true, names[i]);
}
// Reload the module and retrieve by every identity used across the site.
vm.runInNewContext('(function() {\n' + badgeSource + '\n})();', context);
badges = context.window.GBLBadges;
names.forEach((name, i) => {
  for (const identity of [name, `sq${i + 1}`, squads[i], clubs[i], ranking.historico[i]]) {
    assert.equal(badges.getClubBadgeData(identity).customUrl, image(i), name);
  }
});
assert.ok([...store.values()].reduce((sum, value) => sum + value.length, 0) < oldSize / 4);
assert.deepEqual(JSON.parse(store.get('gbl.squads.v2'))[0].roster, squads[0].roster);
assert.equal(badges.setClubBadge('sq15', 'https://example.test/new.png'), true);
assert.equal(badges.getClubBadgeData(squads[14]).customUrl, 'https://example.test/new.png');
assert.equal(badges.removeClubBadge('sq15'), true);
assert.equal(badges.getClubBadgeData({ ...squads[14], badge_url: image(14) }).hasCustom, false);
assert.equal(badges.getClubBadgeData('Panissa FC').customUrl, image(16));
const beforeFailure = store.get('gbl.badges.v1');
const eventCount = events.length;
assert.equal(badges.setClubBadge('sq15', 'A'.repeat(quota)), false);
assert.equal(store.get('gbl.badges.v1'), beforeFailure);
assert.equal(events.length, eventCount);
assert.match(messages.at(-1), /Não foi possível salvar/);
context.RBAC.requireAdmin = () => false;
assert.equal(badges.setClubBadge('sq17', 'denied'), false);
assert.equal(badges.getClubBadgeData('sq17').customUrl, image(16));
context.RBAC.requireAdmin = () => true;

console.log('Passed: legacy shield display, replacement, permissions and failure recovery. Multipart modal and file lifecycle are covered by uploads.test.cjs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
