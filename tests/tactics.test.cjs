const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const dom = new JSDOM(fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8'), {
  url: 'http://localhost/?team=sq2#elencos',
  runScripts: 'outside-only',
});
const window = dom.window;
const document = window.document;
const store = new Map();
window.GBLShared = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, value) => store.set(key, value),
};
window.RBAC = {
  isAdmin: () => false,
  getProfile: () => ({ team_id: 'sq2' }),
  isGuest: () => false,
};
window.eval(fs.readFileSync(path.join(__dirname, '../js/kits.js'), 'utf8'));
const source = fs.readFileSync(path.join(__dirname, '../js/squads.js'), 'utf8');
window.eval(source.replace('  renderSquadsHub();\n})();',
  '  window.tactics = { FORMATIONS_DATA, splitStartersAndSubs, readSquads, state };\n  renderSquadsHub();\n})();'));
const tactics = window.tactics;
assert.ok(tactics, 'Expose internals while still rendering the real page');
const squads = tactics.readSquads();
const pitchNodes = () => [...document.querySelectorAll('[data-pitch-player]')];
const playerIds = () => pitchNodes().map((node) => node.dataset.pitchPlayer).sort();
function change(selector, value) {
  const control = document.querySelector(selector);
  control.value = value;
  control.dispatchEvent(new window.Event('change', { bubbles: true }));
}
try {
  assert.equal(tactics.state.selectedTeamId, 'sq2');
  const originalData = store.get('gbl.squads.v2');
  const originalNodes = new Map(pitchNodes().map((node) => [node.dataset.pitchPlayer, node]));
  const originalIds = playerIds();
  assert.equal(originalIds.length, 11);

  for (const [key, layout] of Object.entries(tactics.FORMATIONS_DATA)) {
    assert.equal(layout.length, 11, key);
    assert.equal(layout[0].role, 'GK');
    assert.equal(new Set(layout.map((slot) => slot.x + ':' + slot.y)).size, 11);
    for (const slot of layout) {
      assert.ok(slot.x >= 0 && slot.x <= 100);
      assert.ok(slot.y >= 0 && slot.y <= 100);
    }
    change('#squadFormationSelect', key);
    assert.equal(tactics.state.selectedTeamId, 'sq2');
    assert.deepEqual(playerIds(), originalIds, 'Changing formation keeps the same XI');
    for (const node of pitchNodes()) {
      assert.equal(node, originalNodes.get(node.dataset.pitchPlayer), 'Reuse DOM nodes for transitions');
      const index = [...originalNodes.keys()].indexOf(node.dataset.pitchPlayer);
      assert.equal(node.style.left, layout[index].x + '%');
      assert.equal(node.style.top, layout[index].y + '%');
      assert.equal(node.dataset.slotRole, layout[index].role);
    }
    for (const club of squads) {
      const { starters, subs } = tactics.splitStartersAndSubs(club);
      assert.equal(starters.length, 11);
      assert.equal(new Set(starters.map((player) => player.id)).size, 11);
      assert.ok(subs.length <= 5);
      assert.ok(subs.every((sub) => !starters.some((player) => player.id === sub.id)));
    }
  }
  assert.equal(store.get('gbl.squads.v2'), originalData, 'Formation preview never writes team data');
  change('#squadFormationSelect', '4-2-2-2');
  for (const club of squads) {
    change('#squadClubSelect', club.id);
    assert.equal(tactics.state.selectedTeamId, club.id);
    assert.equal(document.querySelector('#squadFormationSelect').value, '4-2-2-2');
    const expected = Array.from(tactics.splitStartersAndSubs(club).starters, (player) => player.id).sort();
    assert.deepEqual(playerIds(), expected, 'Each selected team loads its own XI');
  }
  const selectedTeam = tactics.state.selectedTeamId;
  store.set('gbl.squads.v2', JSON.stringify([...squads].reverse()));
  window.dispatchEvent(new window.CustomEvent('gbl:datachange'));
  assert.equal(tactics.state.selectedTeamId, selectedTeam, 'Server reordering preserves selected team identity');
  assert.equal(document.querySelector('#squadClubSelect').value, selectedTeam);
  assert.equal(tactics.state.selectedFormation, '4-2-2-2');
  document.querySelector('#nextSquadClub').click();
  assert.notEqual(tactics.state.selectedTeamId, selectedTeam);
  assert.equal(tactics.state.selectedFormation, '4-2-2-2');
  document.querySelector('#prevSquadClub').click();
  assert.equal(tactics.state.selectedTeamId, selectedTeam);
  document.querySelector('[data-select-club="' + squads[0].id + '"]').click();
  assert.equal(tactics.state.selectedTeamId, squads[0].id);
  assert.equal(tactics.state.selectedFormation, '4-2-2-2');

  const manual = { ...squads[0], starterIds: Array.from(tactics.splitStartersAndSubs(squads[0]).starters, (player) => player.id).reverse() };
  assert.deepEqual(Array.from(tactics.splitStartersAndSubs(manual).starters, (player) => player.id), manual.starterIds);
  assert.deepEqual(Array.from(tactics.splitStartersAndSubs({ ...manual, formation: '5-3-2' }).starters, (player) => player.id), manual.starterIds);
  const incomplete = tactics.splitStartersAndSubs({ ...squads[0], roster: squads[0].roster.slice(0, 4), starterIds: [] });
  assert.equal(incomplete.starters.length, new Set(incomplete.starters.map((player) => player.id)).size);
  assert.equal(tactics.splitStartersAndSubs({ ...squads[0], roster: [] }).starters.length, 0);
  console.log('Passed: independent team/formation selection, all layouts, stable XI and DOM nodes, navigation, reordered data and legacy lineups.');
} finally {
  window.close();
}
