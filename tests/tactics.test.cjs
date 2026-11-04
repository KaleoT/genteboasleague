const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/squads.js'), 'utf8').replace(/\r\n/g, '\n');
const listeners = new Map();
const store = new Map();
const context = {
  URLSearchParams, location: {search:''},
  document: { querySelector: (selector) => selector === '#squadFormationSelect'
    ? { addEventListener: (type, listener) => listeners.set(type, listener) } : null },
  window: { addEventListener() {}, dispatchEvent() {} },
  GBLShared: { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, value) },
  RBAC: { isAdmin: () => false, getProfile: () => ({ team_id: 'sq1' }) },
  CustomEvent: function(type) { this.type = type; },
};
const instrumented = source.replace('  renderSquadsHub();\n})();',
  '  globalThis.tactics = { FORMATION_PRESETS, getFormationKey, splitStartersAndSubs, DEFAULT_SQUADS, canManageFormation, normalizeSquadRosterLimit };\n})();');
assert.notEqual(instrumented, source, 'Expose internals without running the page renderer');
vm.runInNewContext(instrumented, context);
const t = context.tactics;
const squads = t.normalizeSquadRosterLimit(JSON.parse(JSON.stringify(t.DEFAULT_SQUADS)));
for (const [key, slots] of Object.entries(t.FORMATION_PRESETS)) {
  assert.equal(slots.length, 11, key);
  assert.equal(slots.filter(s => s.role === 'GK').length, 1, key);
  assert.equal(new Set(slots.map(s => s.left + ':' + s.top)).size, 11, key);
  assert.equal(t.getFormationKey('Esquema ' + key + ' Ofensivo'), key);
  for (const slot of slots) {
    assert.ok(parseFloat(slot.left) >= 0 && parseFloat(slot.left) <= 100);
    assert.ok(parseFloat(slot.top) >= 0 && parseFloat(slot.top) <= 100);
  }
  for (const squad of squads) {
    const { starters, subs } = t.splitStartersAndSubs({ ...squad, formation: key });
    assert.equal(starters.length, 11, squad.name + ' / ' + key);
    assert.equal(new Set(starters.map(p => p.id)).size, 11);
    assert.equal(starters[0].pos, 'GK');
    assert.ok(subs.length <= 5);
    assert.ok(subs.every(sub => !starters.some(p => p.id === sub.id)));
  }
}
assert.equal(t.getFormationKey('4-4-2 Losango'), '4-1-2-1-2');
assert.equal(t.getFormationKey('Esquema desconhecido'), '4-3-3');
const joker = squads[0];
const initial = t.splitStartersAndSubs(joker).lineup;
assert.equal(initial[5].pos, 'DMF');
assert.equal(initial[6].pos, 'DMF');
assert.equal(initial[7].pos, 'AMF');
assert.equal(initial[8].pos, 'LWF');
assert.equal(initial[9].pos, 'CF');
assert.equal(initial[10].pos, 'RWF');
assert.equal(t.canManageFormation(joker), true);
assert.equal(t.canManageFormation(squads[1]), false);
store.set('gbl.squads.v2', JSON.stringify(squads));
store.set('gbl.clubs.v2', JSON.stringify([{ id: 'c1', name: joker.name }]));
listeners.get('change')({ target: { value: '5-3-2' } });
const saved = JSON.parse(store.get('gbl.squads.v2'));
assert.equal(saved[0].formation, '5-3-2');
assert.deepEqual([...saved[0].starterIds].sort(), Array.from(initial, p => p.id).sort());
assert.equal(JSON.parse(store.get('gbl.clubs.v2'))[0].formation, '5-3-2');
assert.equal(t.splitStartersAndSubs(saved[0]).starters.length, 11);
const unchanged = store.get('gbl.squads.v2');
context.RBAC.getProfile = () => ({ team_id: 'sq2' });
listeners.get('change')({ target: { value: '4-4-2' } });
assert.equal(store.get('gbl.squads.v2'), unchanged);
context.RBAC.isAdmin = () => true;
listeners.get('change')({ target: { value: '4-4-2' } });
assert.equal(JSON.parse(store.get('gbl.squads.v2'))[0].formation, '4-4-2');
const manual = { ...joker, starterIds: Array.from(initial, p => p.id), starterFormation: '4-2-1-3' };
assert.deepEqual(Array.from(t.splitStartersAndSubs(manual).starters, p => p.id), manual.starterIds);
const remapped = t.splitStartersAndSubs({ ...manual, formation: '4-3-3' });
assert.equal(remapped.lineup[5].pos, 'DMF');
assert.equal(remapped.lineup[8].pos, 'LWF');
assert.equal(remapped.lineup[10].pos, 'RWF');
const incomplete = t.splitStartersAndSubs({ ...joker, roster: joker.roster.slice(0, 4) });
assert.equal(incomplete.starters.length, new Set(incomplete.starters.map(p => p.id)).size);
assert.equal(t.splitStartersAndSubs({ ...joker, roster: [] }).starters.length, 0);
console.log('Passed: 11 formations across 17 clubs, Joker FC 4-2-1-3, persistence, permissions, manual lineup and incomplete rosters.');
