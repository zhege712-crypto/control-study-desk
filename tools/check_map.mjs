// Check the control-structure map: structure, link targets, rendered HTML and search.
// The same data modules are imported by app.js, so this checks what the browser renders.
import assert from 'node:assert/strict';
import {
  mapIntro, mapLayers, mapCross, mapParts, mapDeltas, mapAdditions,
  mapLimits, mapPackaging, mapMethods, mapSteps, mapDemos, mapPartExamples,
} from '../docs/control-map-content.js';
import {mapHTML, mapPartDetailHTML, mapMethodDetailHTML, mapMatches, mapResultsHTML, mapPartIds, demoSceneHTML} from '../docs/control-map.js';
import {gainScene, consensusScene, barrierScene, GAIN, CONSENSUS, BARRIER} from '../docs/control-map-models.js';
import {blocks} from '../docs/content.js';
import {methodById} from '../docs/why-content.js';
import {zeroIds, zeroLessonById} from '../docs/zero-content.js';

const blockIds = new Set(blocks.map(block => block.id));
const zeroSet = new Set(zeroIds);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);
const limitIds = new Set(mapLimits.map(limit => limit.id));
const layerIds = new Set([...mapLayers.map(layer => layer.id), 'cross']);
const partIds = mapParts.map(part => part.id);

// ---- structure ----
assert.equal(mapLayers.length, 4);
assert.equal(new Set(mapLayers.map(layer => layer.id)).size, mapLayers.length);
for (const layer of mapLayers) assert.ok(layer.name.trim() && layer.en.trim() && layer.ask.trim() && layer.summary.trim(), `layer ${layer.id}`);
assert.ok(mapCross.summary.trim() && mapCross.ask.trim());
assert.equal(mapParts.length, 10);
assert.deepEqual(mapPartIds, partIds);
assert.equal(new Set(partIds).size, partIds.length);
for (const layer of mapLayers) assert.ok(mapParts.some(part => part.layer === layer.id), `empty layer ${layer.id}`);
assert.equal(mapParts.filter(part => part.layer === 'cross').length, 1, 'one cross-cutting evaluation part');
assert.equal(mapParts.filter(part => part.added).length, 1, 'exactly one multi-agent-added part (communication)');
assert.equal(mapParts.find(part => part.added).id, 'comm');

const required = ['name', 'en', 'duty', 'output', 'failure', 'question', 'multi'];
for (const part of mapParts) {
  for (const field of required) assert.ok(part[field] && part[field].trim().length >= (field === 'name' ? 2 : 4), `${part.id}: ${field}`);
  assert.ok(layerIds.has(part.layer), `${part.id}: layer`);
  for (const [kind, id] of part.links) {
    if (kind === 'why') assert.ok(methodById.has(id), `${part.id}: unknown why chapter ${id}`);
    else if (kind === 'zero') assert.ok(zeroSet.has(id), `${part.id}: unknown lesson ${id}`);
    else if (kind === 'block') assert.ok(blockIds.has(id), `${part.id}: unknown block ${id}`);
    else assert.fail(`${part.id}: unknown link kind ${kind}`);
  }
}

// ---- typical examples per part ----
assert.deepEqual(Object.keys(mapPartExamples).sort(), [...partIds].sort(), 'every part has a examples entry');
for (const part of mapParts) {
  const examples = mapPartExamples[part.id];
  assert.ok(Array.isArray(examples) && examples.length >= 4, `part ${part.id}: too few examples`);
  const names = examples.map(example => example.name);
  assert.equal(new Set(names).size, names.length, `part ${part.id}: duplicate example names`);
  for (const example of examples) {
    assert.ok(example.name.trim().length >= 2 && example.note.trim().length >= 6, `part ${part.id}: example ${example.name}`);
    if (example.why) assert.ok(methodById.has(example.why), `part ${part.id}: unknown example chapter ${example.why}`);
  }
}
assert.ok(mapPartExamples.law.some(example => example.name.includes('PID')));
assert.ok(mapPartExamples.estimate.some(example => example.name.includes('Kalman')));
assert.ok(mapPartExamples.guard.some(example => example.name.includes('CBF')));
assert.ok(mapPartExamples.plan.some(example => example.name.includes('MPC')));
assert.ok(mapPartExamples.comm.some(example => example.name.includes('一致性')));

// ---- multi-agent deltas ----
assert.equal(mapDeltas.length, 10);
assert.equal(new Set(mapDeltas.map(row => row.dim)).size, mapDeltas.length);
for (const row of mapDeltas) {
  for (const field of ['dim', 'single', 'added', 'effect']) assert.ok(row[field] && row[field].trim().length >= 2, `delta ${row.dim}: ${field}`);
}
assert.equal(mapAdditions.length, 3);
for (const item of mapAdditions) assert.ok(item.name.trim() && item.text.trim().length >= 10, `addition ${item.name}`);

// ---- limitations ----
assert.equal(mapLimits.length, 8);
assert.equal(new Set(mapLimits.map(limit => limit.id)).size, mapLimits.length);
for (const limit of mapLimits) {
  assert.ok(limit.title.trim() && limit.limitation.trim() && limit.symptom.trim() && limit.question.trim(), `limit ${limit.id}`);
  assert.ok(layerIds.has(limit.layer), `limit ${limit.id}: layer`);
  assert.ok(limit.parts.length >= 1, `limit ${limit.id}: parts`);
  for (const id of limit.parts) assert.ok(partIds.includes(id), `limit ${limit.id}: unknown part ${id}`);
  for (const id of limit.parts) assert.ok(mapPartIds.includes(id));
}
for (const id of partIds) assert.ok(mapLimits.some(limit => limit.parts.includes(id)), `part ${id} is not reachable from any limitation`);
assert.equal(mapPackaging.length, 4);
for (const text of mapPackaging) assert.ok(text.trim().length >= 10);

// ---- method locator and usage ----
assert.equal(mapMethods.length, 11);
assert.equal(new Set(mapMethods.map(method => method.id)).size, mapMethods.length);
for (const method of mapMethods) {
  assert.ok(method.name.trim() && method.change.trim().length >= 8, `method ${method.id}`);
  assert.ok(partIds.includes(method.part), `method ${method.id}: part`);
  assert.ok(methodById.has(method.why), `method ${method.id}: why`);
  assert.ok(method.checks.length >= 1, `method ${method.id}: checks`);
  for (const id of method.checks) assert.ok(limitIds.has(id), `method ${method.id}: unknown limit ${id}`);
}
assert.equal(mapSteps.length, 4);
for (const step of mapSteps) assert.ok(step.title.trim() && step.text.trim().length >= 10);

// ---- side examples ----
assert.equal(mapDemos.length, 3);
assert.deepEqual(mapDemos.map(demo => demo.part).sort(), ['comm', 'guard', 'law']);
assert.equal(new Set(mapDemos.map(demo => demo.kind)).size, mapDemos.length);
for (const demo of mapDemos) {
  assert.ok(partIds.includes(demo.part), `demo part ${demo.part}`);
  assert.ok(['gain', 'consensus', 'barrier'].includes(demo.kind), `demo kind ${demo.kind}`);
  assert.ok(demo.title.trim() && demo.lead.trim().length >= 10 && demo.note.trim().length >= 20, `demo ${demo.part}`);
  assert.ok(demo.ranges.length >= 1, `demo ${demo.part}: ranges`);
  for (const range of demo.ranges) {
    assert.ok(range.label.trim(), `demo ${demo.part}: label`);
    assert.ok(range.min < range.max && range.step > 0, `demo ${demo.part}: range ${range.key}`);
    assert.ok(range.value >= range.min && range.value <= range.max, `demo ${demo.part}: default ${range.key}`);
    assert.ok(Number.isInteger(range.digits) && range.digits >= 0 && range.digits <= 3, `demo ${demo.part}: digits`);
  }
  const part = mapParts.find(item => item.id === demo.part);
  const html = mapPartDetailHTML(part);
  assert.ok(html.includes(`data-demo="${demo.kind}"`) && html.includes('data-demo-range=') && html.includes('data-demo-readout'), `${demo.part}: demo markup`);
  assert.ok(html.includes(esc(demo.title)), `${demo.part}: demo title`);
}

// Independently checked teaching arithmetic for the three examples.
const barrierDefault = barrierScene({margin: 0.2, drift: 0, nominal: -1});
assert.equal(barrierDefault.feasible, true);
close(barrierDefault.lower, -0.4, 'barrier default lower');
close(barrierDefault.filtered, -0.4, 'barrier default filtered');
assert.equal(barrierDefault.changed, true);
close(barrierScene({margin: 0.3, drift: 1, nominal: 0}).lower, 0.4, 'barrier b - 2h');
assert.equal(barrierScene({margin: 0.5, drift: 0, nominal: 0.3}).changed, false, 'barrier inside interval');
const barrierInfeasible = barrierScene({margin: 0, drift: 2, nominal: 0.5});
assert.equal(barrierInfeasible.feasible, false);
assert.equal(barrierInfeasible.filtered, null);
assert.ok(barrierInfeasible.lower > BARRIER.uMax, 'infeasible state demands u above the actuator limit');
close(barrierInfeasible.lower, 2, 'infeasible lower');

const slowGain = gainScene(0.4), fastGain = gainScene(1.2), veryFastGain = gainScene(4);
for (const scene of [slowGain, fastGain, veryFastGain]) {
  assert.equal(scene.points.length, GAIN.maxSteps + 1);
  assert.ok(scene.points.every(point => Number.isFinite(point[0]) && Number.isFinite(point[1])));
  assert.ok(scene.overshoot >= 0 && scene.settleTime !== null);
}
assert.ok(fastGain.overshoot > slowGain.overshoot && veryFastGain.overshoot > fastGain.overshoot, 'gain overshoot ordering');
assert.ok(slowGain.settleTime !== null && fastGain.settleTime !== null, 'both gain settings settle within eight seconds');
close(veryFastGain.points[0][1], 0, 'gain starts at zero');

const slowConsensus = consensusScene(0.2);
assert.ok(slowConsensus.finalSpread < 0.01, `consensus default spread ${slowConsensus.finalSpread}`);
assert.ok(consensusScene(0.65).finalSpread > slowConsensus.finalSpread, 'near-boundary consensus gain keeps a spread');
assert.ok(consensusScene(0.65).finalSpread > 0.1 && consensusScene(0.65).finalSpread < 14, 'near-boundary spread stays bounded');
for (const point of slowConsensus.points) close((point[1] + point[2] + point[3]) / 3, CONSENSUS.mean, 'consensus mean');
close(slowConsensus.points[1][1], 0.8, 'consensus A step 1');
close(slowConsensus.points[1][2], 5.2, 'consensus B step 1');
close(slowConsensus.points[1][3], 12, 'consensus C step 1');

for (const demo of mapDemos) {
  const params = Object.fromEntries(demo.ranges.map(range => [range.key, range.value]));
  const scene = demoSceneHTML(demo.kind, params);
  assert.ok(scene.readout.trim().length > 30, `demo ${demo.kind}: readout`);
  assert.ok(scene.visual.includes('<svg'), `demo ${demo.kind}: visual`);
  assert.ok(!/undefined|NaN/.test(scene.readout + scene.visual), `demo ${demo.kind}: rendered undefined/NaN`);
}
assert.ok(demoSceneHTML('barrier', {margin: 0, drift: 2, nominal: 0.5}).readout.includes('允许区间为空'));
assert.ok(demoSceneHTML('barrier', {margin: 0, drift: 2, nominal: 0.5}).visual.includes('安全输入区间为空'));

// ---- rendered HTML ----
const overview = mapHTML();
assert.ok(overview.includes(mapIntro.title) && overview.includes(mapIntro.lead));
assert.equal((overview.match(/class="map-chip /g) || []).length, 10, 'ten part chips');
assert.equal((overview.match(/class="map-limit"/g) || []).length, 8, 'eight limitation cards');
assert.equal((overview.match(/data-map-method="/g) || []).length, 11, 'eleven method buttons');
assert.equal((overview.match(/data-map-filter="/g) || []).length, 6, 'six layer filters');
assert.ok(overview.includes('id="map-part-detail"') && overview.includes('id="map-method-detail"'));
assert.ok(overview.includes('map-structure') && overview.includes('map-delta') && overview.includes('map-limits') && overview.includes('map-usage'));
assert.ok(!/undefined|NaN/.test(overview), 'overview rendered undefined/NaN');
assert.ok(!overview.includes('data-demo-range='), 'the default part has no side example');
assert.equal((overview.match(/map-chip-demo/g) || []).length, 3, 'three example badges');
assert.equal((mapHTML('law').match(/data-demo-range="/g) || []).length, 1, 'gain example has one slider');
assert.equal((mapHTML('guard').match(/data-demo-range="/g) || []).length, 3, 'CBF example has three sliders');
assert.ok(mapHTML('guard').includes('data-demo="barrier"') && mapHTML('law').includes('data-demo="gain"') && mapHTML('comm').includes('data-demo="consensus"'));
assert.ok(mapMethodDetailHTML('safety').includes('data-map-demo-jump="guard"'), 'CBF locator reaches its example');
assert.equal(mapHTML('L99'), mapHTML('goal'), 'unknown part must fall back to the first part');

for (const part of mapParts) {
  const detail = mapPartDetailHTML(part);
  assert.ok(detail.includes(esc(part.name)) && detail.includes(esc(part.en)), `${part.id}: detail identity`);
  assert.ok(detail.includes(part.duty) && detail.includes(part.output) && detail.includes(part.failure) && detail.includes(part.question), `${part.id}: detail fields`);
  assert.ok(detail.includes(part.multi), `${part.id}: multi-agent line`);
  assert.ok(detail.includes('典型例子'), `${part.id}: examples heading`);
  for (const example of mapPartExamples[part.id]) assert.ok(detail.includes(esc(example.name)), `${part.id}: example ${example.name}`);
  for (const [kind, id] of part.links) {
    const attr = kind === 'why' ? `data-why="${id}"` : kind === 'zero' ? `data-zero="${id}"` : `data-block="${id}"`;
    assert.ok(detail.includes(attr), `${part.id}: link markup ${attr}`);
  }
  assert.ok(!/undefined|NaN/.test(detail), `${part.id}: rendered undefined/NaN`);
}
assert.ok(mapHTML('comm').includes('多智能体新增'));

for (const method of mapMethods) {
  const detail = mapMethodDetailHTML(method.id);
  assert.ok(detail.includes(method.name) && detail.includes(method.change), `method ${method.id}: detail`);
  for (const id of method.checks) assert.ok(detail.includes(`data-map-filter-focus="${mapLimits.find(limit => limit.id === id).layer}"`), `method ${method.id}: check link ${id}`);
  assert.ok(!/undefined|NaN/.test(detail), `method ${method.id}: rendered undefined/NaN`);
}

// ---- search ----
assert.deepEqual(mapMatches(''), {parts: [], limits: []});
assert.ok(mapMatches('通信').parts.some(part => part.id === 'comm'));
assert.ok(mapMatches('避碰').parts.some(part => part.id === 'guard'));
assert.ok(mapMatches('饱和').limits.some(limit => limit.id === 'execute'));
assert.ok(mapMatches('分布外').limits.some(limit => limit.id === 'learning'), 'search reaches limitation text');
const results = mapResultsHTML(mapMatches('通信'));
assert.ok(results.includes('data-map-open="comm"'));
assert.ok(!/undefined|NaN/.test(results));

console.log(`Control-map checks passed: ${mapLayers.length} layers + ${mapCross.name}, ${mapParts.length} parts, ${mapDeltas.length} multi-agent deltas, ${mapLimits.length} limitation groups, ${mapMethods.length} locator methods, ${Object.values(mapPartExamples).flat().length} named examples, ${mapDemos.length} slider examples; links, teaching arithmetic and rendered HTML valid.`);
