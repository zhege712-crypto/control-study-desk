// Check the zero-background course: structure, links, formulas, rendered HTML and every
// number that the lessons claim. The model functions are the same ones the browser runs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {
  zeroIntro, zeroParts, zeroLessons, zeroIds, zeroLessonById, zeroTerms, zeroPlacement, zeroFaq, zeroMatches,
} from '../docs/zero-content.js';
import {zeroHTML, zeroResultsHTML} from '../docs/zero.js';
import {
  HEAT, SPEED, heatHistory, heatEquilibrium, speedHistory, speedEquilibrium,
  agreeHistory, mean, spread,
} from '../docs/zero-models.js';
import {blocks} from '../docs/content.js';

const require = createRequire(import.meta.url);
const katex = require('../docs/vendor/katex/dist/katex.min.js');
const sources = JSON.parse(readFileSync(new URL('../docs/study-sources.json', import.meta.url), 'utf8'));
const sourceIds = new Set(sources.map(source => source.id));
const blockIds = new Set(blocks.map(block => block.id));
const guideViews = new Set(['start', 'lab', 'research', 'history', 'studies', 'visuals', 'why']);

const close = (actual, expected, label, tolerance = 5e-3) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} != ${expected}`);
};

// ---- structure ----
assert.equal(zeroLessons.length, 12);
assert.equal(zeroParts.length, 4);
assert.deepEqual(zeroIds, zeroLessons.map(lesson => lesson.id));
assert.deepEqual(zeroIds, ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10', 'L11', 'L12']);
assert.equal(new Set(zeroIds).size, zeroIds.length);
for (const part of zeroParts) {
  assert.ok(part.title.trim() && part.goal.trim(), `part ${part.id}`);
  assert.ok(zeroLessons.some(lesson => lesson.part === part.id), `empty part ${part.id}`);
}
const requiredText = ['title', 'en', 'goal', 'story', 'manual', 'gap', 'output'];
const minLength = {title: 6, en: 3, goal: 15, story: 30, manual: 20, gap: 30, output: 15};
for (const lesson of zeroLessons) {
  for (const field of requiredText) assert.ok(lesson[field] && lesson[field].trim().length >= minLength[field], `${lesson.id}: ${field}`);
  assert.ok(Number.isInteger(lesson.minutes) && lesson.minutes >= 5 && lesson.minutes <= 12, `${lesson.id}: minutes`);
  assert.ok(lesson.terms.length >= 3, `${lesson.id}: too few terms`);
  for (const [zh, en, definition] of lesson.terms) {
    assert.ok(zh.trim() && en.trim() && definition.trim().length >= 8, `${lesson.id}: bad term ${zh}`);
  }
  const table = lesson.table;
  assert.ok(table && table.head.length >= 3 && table.rows.length >= 2, `${lesson.id}: table`);
  for (const row of table.rows) assert.equal(row.length, table.head.length, `${lesson.id}: table row width`);
  for (const key of ['misconception', 'check']) assert.ok(lesson[key].q.trim() && lesson[key].a.trim(), `${lesson.id}: ${key}`);
  if (lesson.formula) katex.renderToString(lesson.formula.tex, {throwOnError: true, strict: 'error'});
  for (const id of lesson.links?.blocks ?? []) assert.ok(blockIds.has(id), `${lesson.id}: unknown block ${id}`);
  for (const id of lesson.links?.papers ?? []) assert.ok(sourceIds.has(id), `${lesson.id}: unknown paper ${id}`);
  for (const [view] of lesson.links?.views ?? []) assert.ok(guideViews.has(view), `${lesson.id}: unknown view ${view}`);
  if (lesson.lab) assert.ok(['heat', 'speed', 'agree'].includes(lesson.lab), `${lesson.id}: unknown lab`);
}
assert.ok(zeroLessons.filter(lesson => lesson.lab).length === 6, 'expected six lesson pages with an embedded lab');
assert.ok(zeroLessons.find(lesson => lesson.id === 'L03').lab === 'heat');
assert.ok(zeroLessons.find(lesson => lesson.id === 'L06').lab === 'speed');
assert.ok(zeroLessons.find(lesson => lesson.id === 'L10').lab === 'agree');

// ---- placement quiz ----
assert.equal(zeroPlacement.questions.length, 3);
for (const question of zeroPlacement.questions) {
  assert.equal(question.options.length, 3);
  for (const [text, , advice] of question.options) assert.ok(text.trim() && advice.trim(), 'placement option');
}
for (const [text, target, advice] of zeroPlacement.questions[0].options) {
  assert.ok(zeroIds.includes(target), `placement target ${target}`);
  assert.ok(advice.trim(), `placement advice ${text}`);
}

// ---- glossary ----
assert.ok(zeroTerms.length >= 30, `expected at least 30 glossary terms, got ${zeroTerms.length}`);
assert.equal(new Set(zeroTerms.map(term => term.zh)).size, zeroTerms.length);
for (const term of zeroTerms) {
  assert.ok(term.en.trim() && term.definition.trim(), `term ${term.zh}`);
  assert.ok(zeroIds.includes(term.lesson), `term lesson ${term.lesson}`);
}

// ---- search ----
assert.deepEqual(zeroMatches(''), []);
assert.ok(zeroMatches('反馈').some(lesson => lesson.id === 'L03'));
assert.ok(zeroMatches('steady-state error').some(lesson => lesson.id === 'L08'));
assert.ok(zeroMatches('CBF').some(lesson => lesson.id === 'L11'));
assert.ok(zeroMatches('consensus').some(lesson => lesson.id === 'L10'));
assert.ok(zeroMatches('洗澡').some(lesson => lesson.id === 'L07'));

// ---- glossary and common questions ----
assert.ok(zeroFaq.length >= 4, 'expected at least four beginner questions');
for (const [question, answer] of zeroFaq) assert.ok(question.trim().length > 5 && answer.trim().length > 30, `faq: ${question}`);

// ---- lesson minutes ----
const totalMinutes = zeroLessons.reduce((sum, lesson) => sum + lesson.minutes, 0);
assert.ok(Math.abs(totalMinutes - zeroIntro.minutes) <= 10, `intro minutes ${zeroIntro.minutes} vs ${totalMinutes}`);

// ---- claimed numbers: heat lessons ----
const closed = heatHistory({mode: 'closed', gain: 0.3});
const row = step => closed[step];
close(row(0).temperature, 10, 'L05 step 0');
close(row(1).temperature, 11.2, 'L05 step 1');
close(row(2).temperature, 12.304, 'L05 step 2');
close(row(3).temperature, 13.32, 'L05 step 3');
close(row(4).temperature, 14.254, 'L05 step 4');
close(row(5).temperature, 15.114, 'L05 step 5');
close(heatEquilibrium(0.65), 19.75, 'L02 open-loop equilibrium');
const openLoop = heatHistory({mode: 'open', power: 0.65});
close(openLoop[5].temperature, 13.324, 'L02 open-loop step 5');
close(openLoop[20].temperature, 17.910, 'L02 open-loop step 20');
close(openLoop.at(-1).temperature, 19.6845, 'L02 open-loop at step 60');
assert.ok(openLoop.at(-1).temperature < HEAT.target, 'open loop must stay below target');
close(heatHistory({mode: 'closed', gain: 0.1}).at(-1).temperature, 17.2, 'L08 gain 0.1');
close(heatHistory({mode: 'closed', gain: 0.3}).at(-1).temperature, 19.8182, 'L08 gain 0.3');
close(heatHistory({mode: 'closed', gain: 1.0}).at(-1).temperature, 21.25, 'L08 gain 1.0');
const windowHistory = heatHistory({mode: 'closed', gain: 0.3, openWindow: true});
assert.ok(Math.abs(windowHistory.at(-1).temperature - 17.36) < 0.05, 'L08 open-window final');
assert.ok(heatEquilibrium(1, HEAT.windowAmbient) === 17, 'L08 full power in cold room equilibrium');
const waveLow = Math.min(...heatHistory({gain: 0.3, delay: 4}).slice(30).map(record => record.temperature));
const waveHigh = Math.max(...heatHistory({gain: 0.3, delay: 4}).slice(30).map(record => record.temperature));
close(waveLow, 18.93, 'L07 delay low', 0.06);
close(waveHigh, 20.78, 'L07 delay high', 0.06);
const strongerLow = Math.min(...heatHistory({gain: 1.5, delay: 4}).slice(30).map(record => record.temperature));
const strongerHigh = Math.max(...heatHistory({gain: 1.5, delay: 4}).slice(30).map(record => record.temperature));
close(strongerLow, 18.04, 'L07 stronger low', 0.06);
close(strongerHigh, 22.48, 'L07 stronger high', 0.06);

// ---- claimed numbers: cruise lesson ----
close(speedHistory({gain: 0.3}).at(-1).speed, 17.1429, 'L06 gain 0.3');
close(speedHistory({gain: 0.5}).at(-1).speed, 18.1818, 'L06 gain 0.5');
close(speedHistory({gain: 1.2}).at(-1).speed, 19.2, 'L06 gain 1.2');
close(speedHistory({gain: 2.0}).at(-1).speed, 19.9672, 'L06 gain 2.0');
close(speedEquilibrium(0.5), 18.1818, 'speed equilibrium');
assert.ok(speedHistory({gain: 0.3}).at(-1).speed < SPEED.target);

// ---- claimed numbers: agreement lesson ----
const agree = agreeHistory();
close(agree[1].positions[0], 1.2, 'L10 step1 A');
close(agree[1].positions[1], 6.0, 'L10 step1 B');
close(agree[1].positions[2], 10.8, 'L10 step1 C');
close(agree[2].positions[0], 2.16, 'L10 step2 A');
close(agree[2].positions[2], 9.84, 'L10 step2 C');
close(agree[3].positions[0], 2.928, 'L10 step3 A');
close(agree[3].positions[2], 9.072, 'L10 step3 C');
for (const record of agree) close(mean(record.positions), 6, `agreement mean step ${record.step}`);
assert.ok(spread(agree.at(-1).positions) < 0.01);

// ---- rendered HTML ----
const overview = zeroHTML('overview');
assert.ok(overview.includes('零基础入门'));
assert.ok(overview.includes('课程地图'));
assert.ok(overview.includes('术语表'));
assert.ok(overview.includes('新手常问'));
assert.ok(overview.includes('data-zero="L01"'));
assert.ok(overview.includes('data-zero-radio="feedback"'));
assert.ok(!/undefined|NaN/.test(overview), 'overview rendered undefined/NaN');
assert.equal(zeroHTML('L99'), overview, 'unknown lesson must fall back to the map');
for (const lesson of zeroLessons) {
  const html = zeroHTML(lesson.id);
  assert.ok(html.includes('本课目标'), `${lesson.id}: goal`);
  assert.ok(html.includes('本课术语'), `${lesson.id}: terms`);
  assert.ok(html.includes('自测一下'), `${lesson.id}: self-check`);
  assert.ok(html.includes('本课小产出'), `${lesson.id}: output`);
  assert.ok(html.includes('data-zero="overview"'), `${lesson.id}: back link`);
  assert.ok(!/undefined|NaN/.test(html), `${lesson.id}: rendered undefined/NaN`);
  if (lesson.lab) assert.ok(html.includes(`id="zero-lab-${lesson.lab}"`), `${lesson.id}: lab markup`);
  if (lesson.formula) assert.ok(html.includes('data-math='), `${lesson.id}: formula markup`);
  const prevIndex = zeroIds.indexOf(lesson.id) - 1;
  const nextIndex = zeroIds.indexOf(lesson.id) + 1;
  if (prevIndex >= 0) assert.ok(html.includes(`data-zero="${zeroIds[prevIndex]}"`), `${lesson.id}: previous link`);
  if (nextIndex < zeroIds.length) assert.ok(html.includes(`data-zero="${zeroIds[nextIndex]}"`), `${lesson.id}: next link`);
}
const results = zeroResultsHTML(zeroMatches('反馈'));
assert.ok(results.includes('data-zero="L03"'));
assert.ok(!/undefined|NaN/.test(results));

console.log(`Zero-background course checks passed: ${zeroLessons.length} lessons, ${zeroParts.length} parts, ${zeroTerms.length} terms, 6 embedded lab pages, formulas and all claimed numbers verified.`);
