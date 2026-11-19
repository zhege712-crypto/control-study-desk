// Render and mount the control-structure map (#view=map). Pure render functions stay free of DOM
// access so tools/check_map.mjs can import this module under Node.
import {
  mapIntro, mapLayers, mapCross, mapParts, mapDeltas, mapAdditions,
  mapLimits, mapPackaging, mapMethods, mapSteps, mapDemos, mapPartExamples,
} from './control-map-content.js?v=20261119-map3';
import {gainScene, consensusScene, barrierScene} from './control-map-models.js?v=20261119-map3';
import {blocks} from './content.js';
import {methodById} from './why-content.js?v=20261117-why1';
import {zeroIds, zeroLessonById} from './zero-content.js?v=20261118-zero2';

export const mapPartIds = mapParts.map(part => part.id);
const partById = new Map(mapParts.map(part => [part.id, part]));
const layerById = new Map(mapLayers.map(layer => [layer.id, layer]));
const limitById = new Map(mapLimits.map(limit => [limit.id, limit]));
const methodByMapId = new Map(mapMethods.map(method => [method.id, method]));
const demoByPart = new Map(mapDemos.map(demo => [demo.part, demo]));
const examplesByPart = new Map(Object.entries(mapPartExamples));
const blockById = new Map(blocks.map(block => [block.id, block]));
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const layerName = part => part.layer === 'cross' ? '贯穿' : layerById.get(part.layer).name;
const fmt = (value, digits = 2) => Number(value).toFixed(digits);
const signed = (value, digits = 2) => fmt(value, digits).replace('-', '−');

function linkButton([kind, id]) {
  if (kind === 'why') {
    const chapter = methodById.get(id);
    return chapter ? `<button class="map-link" data-why="${esc(id)}"><span>读</span>${esc(chapter.title)}</button>` : '';
  }
  if (kind === 'zero') {
    const lesson = zeroLessonById.get(id);
    return lesson ? `<button class="map-link" data-zero="${esc(id)}"><span>入门</span>第 ${zeroIds.indexOf(id) + 1} 课 · ${esc(lesson.title)}</button>` : '';
  }
  const block = blockById.get(id);
  return block ? `<button class="map-link" data-block="${esc(id)}"><span>概念</span>${esc(block.title)}</button>` : '';
}

// ---- side examples -------------------------------------------------------

const CHART_COLORS = ['#265b87', '#326a59', '#73538c'];

function chartSVG({series, xMax, yMin, yMax, refs = [], xUnit = '', yDigits = 1, aria}) {
  const width = 300, height = 156;
  const pad = {l: 32, r: 10, t: 12, b: 22};
  const X = value => pad.l + (value / xMax) * (width - pad.l - pad.r);
  const Y = value => height - pad.b - ((value - yMin) / (yMax - yMin)) * (height - pad.t - pad.b);
  const grid = [0, 0.5, 1].map(fraction => {
    const y = pad.t + fraction * (height - pad.t - pad.b);
    const value = yMax - fraction * (yMax - yMin);
    return `<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${width - pad.r}" y2="${y.toFixed(1)}" stroke="#e3ebf2"/><text x="${pad.l - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="8" fill="#687c8e">${fmt(value, yDigits)}</text>`;
  }).join('');
  const lines = series.map(item => `<polyline points="${item.points.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ')}" fill="none" stroke="${item.color}" stroke-width="1.8"/>`).join('');
  const refLines = refs.map(ref => `<line x1="${pad.l}" y1="${Y(ref.value).toFixed(1)}" x2="${width - pad.r}" y2="${Y(ref.value).toFixed(1)}" stroke="${ref.color || '#9c4c2d'}" stroke-width="1.2" stroke-dasharray="4 3"/>`).join('');
  const xLabels = `<text x="${pad.l}" y="${height - 7}" text-anchor="middle" font-size="8" fill="#687c8e">0</text><text x="${width - pad.r}" y="${height - 7}" text-anchor="middle" font-size="8" fill="#687c8e">${fmt(xMax, 0)}${esc(xUnit)}</text>`;
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(aria)}">${grid}${refLines}${lines}${xLabels}</svg>`;
}

function barrierSVG(scene) {
  const width = 300, height = 86, track = 44;
  const X = value => 18 + ((value + 1.05) / 2.1) * 264;
  const ticks = [-1, 0, 1].map(value => `<line x1="${X(value).toFixed(1)}" y1="${track}" x2="${X(value).toFixed(1)}" y2="${track + 12}" stroke="#8b9eae"/><text x="${X(value).toFixed(1)}" y="${track + 26}" text-anchor="middle" font-size="8" fill="#687c8e">${value}</text>`).join('');
  const allowed = scene.feasible
    ? `<rect x="${X(scene.lower).toFixed(1)}" y="${track}" width="${Math.max(2, X(scene.upper) - X(scene.lower)).toFixed(1)}" height="12" fill="#dff0e8" stroke="#326a59"/>`
    : '<text x="150" y="30" text-anchor="middle" font-size="9" fill="#9c4c2d">安全输入区间为空</text>';
  const nominal = `<circle cx="${X(scene.nominal).toFixed(1)}" cy="${track + 6}" r="6" fill="none" stroke="#73538c" stroke-width="2"/>`;
  const filtered = scene.feasible ? `<circle cx="${X(scene.filtered).toFixed(1)}" cy="${track + 6}" r="4" fill="#265b87"/>` : '';
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(`一维输入轴：想做的输入 ${fmt(scene.nominal, 1)}，${scene.feasible ? `允许区间 ${fmt(scene.lower, 2)} 到 ${fmt(scene.upper, 2)}，过滤后 ${fmt(scene.filtered, 2)}` : '没有安全输入'}。紫色圆圈是想做的动作，蓝点是过滤结果，绿色段是允许区间。`)}"><rect x="18" y="${track}" width="264" height="12" fill="#eef2f5" stroke="#c4d0db"/>${allowed}${ticks}${nominal}${filtered}</svg>`;
}

function demoDefaults(demo) {
  return Object.fromEntries(demo.ranges.map(range => [range.key, range.value]));
}

export function demoSceneHTML(kind, params) {
  if (kind === 'gain') {
    const scene = gainScene(params.gain);
    const visual = chartSVG({
      series: [{color: CHART_COLORS[0], points: scene.points}],
      xMax: 8, yMin: 0, yMax: 1.8, yDigits: 1, xUnit: ' s',
      refs: [{value: scene.target, label: '目标'}],
      aria: `位置随时间变化：比例增益 ${fmt(scene.gain, 1)}，最大超调 ${Math.round(scene.overshoot * 100)}%，虚线是目标位置。`,
    });
    const readout = `<p><strong>k = ${fmt(scene.gain, 1)}：</strong>最大超调约 ${Math.round(scene.overshoot * 100)}%，${scene.settleLabel}。</p><p>k 小 → 慢但稳；k 大 → 快但更容易冲过头。这里只有比例增益可调，阻尼固定为 0.9。</p>`;
    return {readout, visual};
  }
  if (kind === 'consensus') {
    const scene = consensusScene(params.gain);
    const visual = chartSVG({
      series: [0, 1, 2].map(index => ({color: CHART_COLORS[index], points: scene.points.map(point => [point[0], point[index + 1]])})),
      xMax: 40, yMin: 0, yMax: 15, yDigits: 0, xUnit: ' 步',
      refs: [{value: scene.mean, label: '平均 6 m'}],
      aria: `三台机器人的位置随步数变化：一致增益 ${fmt(scene.gain, 2)}，40 步后最大差距 ${fmt(scene.finalSpread, 2)} 米，虚线是保持不变的初始平均位置。`,
    });
    const trend = scene.finalSpread < 0.01 ? '40 步后已经基本一致' : scene.finalSpread < 1 ? '差距已缩小，但还在缓慢收敛' : '差距仍然明显，增益接近稳定上限时会来回摆';
    const readout = `<p><strong>g = ${fmt(scene.gain, 2)}：</strong>40 步后最大差距 ${fmt(scene.finalSpread, 2)} m（初始 14.00 m），平均值保持 ${fmt(scene.mean, 2)} m。</p><p>${trend}。增益太小 → 收敛慢；接近约 0.66 → 来回摆并更难收敛。</p>`;
    return {readout, visual};
  }
  const scene = barrierScene(params);
  const visual = barrierSVG(scene);
  let readout;
  if (!scene.feasible) {
    readout = `<p><strong>h = ${fmt(scene.margin, 2)}, b = ${fmt(scene.drift, 1)}, 想做的输入 ${signed(scene.nominal, 1)}：</strong>安全要求 u ≥ ${fmt(scene.lower, 2)}，但执行器最多 ${fmt(scene.upper, 2)}，允许区间为空。</p><p>这时没有安全输入：需要提前留余量、改任务或加执行能力，而不是让过滤器硬选一个动作。</p>`;
  } else if (scene.changed) {
    readout = `<p><strong>h = ${fmt(scene.margin, 2)}, b = ${fmt(scene.drift, 1)}：</strong>允许输入 [${signed(scene.lower, 2)}, ${fmt(scene.upper, 2)}]；想做的输入 ${signed(scene.nominal, 1)} 在界外，过滤后 u = ${signed(scene.filtered, 2)}。</p><p>安全条件（本例）：ḣ = −b + u，要求 ḣ + 2h ≥ 0，即 u ≥ b − 2h；再受执行器 −1 ≤ u ≤ 1 限制。</p>`;
  } else {
    readout = `<p><strong>h = ${fmt(scene.margin, 2)}, b = ${fmt(scene.drift, 1)}：</strong>允许输入 [${signed(scene.lower, 2)}, ${fmt(scene.upper, 2)}]；想做的输入 ${signed(scene.nominal, 1)} 本身在界内，过滤器不修改它。</p><p>安全条件（本例）：ḣ = −b + u，要求 ḣ + 2h ≥ 0，即 u ≥ b − 2h；再受执行器 −1 ≤ u ≤ 1 限制。</p>`;
  }
  return {readout, visual};
}

function demoPanelHTML(part) {
  const demo = demoByPart.get(part.id);
  if (!demo) return '';
  const scene = demoSceneHTML(demo.kind, demoDefaults(demo));
  return `<aside class="map-demo" data-demo="${esc(demo.kind)}" aria-label="互动例子：${esc(demo.title)}">
    <p class="map-demo-kicker">动手例子 · 可拖滑条</p>
    <h3>${esc(demo.title)}</h3>
    <p class="map-demo-lead">${esc(demo.lead)}</p>
    <div class="map-demo-controls">${demo.ranges.map(range => `<label class="map-demo-control"><span>${esc(range.label)} <output data-demo-out="${esc(range.key)}">${fmt(range.value, range.digits)}</output></span><input type="range" data-demo-range="${esc(range.key)}" min="${range.min}" max="${range.max}" step="${range.step}" value="${range.value}" aria-label="${esc(range.label)}"></label>`).join('')}</div>
    <div class="map-demo-actions"><button type="button" class="ref-link" data-demo-reset>重置滑条</button></div>
    <div class="map-demo-readout" data-demo-readout aria-live="polite">${scene.readout}</div>
    <div class="map-demo-visual" data-demo-visual>${scene.visual}</div>
    <p class="map-demo-note">${esc(demo.note)}</p>
  </aside>`;
}

// ---- part detail ---------------------------------------------------------

function examplesHTML(part) {
  const examples = examplesByPart.get(part.id) || [];
  if (!examples.length) return '';
  return `<div class="map-examples"><h4>典型例子：控制器 / 算法 / 机制</h4><ul>${examples.map(example => `<li>${example.why ? `<button class="term-link" data-why="${esc(example.why)}">${esc(example.name)}</button>` : `<strong>${esc(example.name)}</strong>`}<span>${esc(example.note)}</span></li>`).join('')}</ul></div>`;
}

function partBodyHTML(part) {
  const index = mapParts.indexOf(part) + 1;
  return `<div class="map-detail-head">
    <span class="map-layer-tag map-layer-${esc(part.layer)}">${esc(layerName(part))} · 部分 ${String(index).padStart(2, '0')}</span>
    <h3>${esc(part.name)} <small>${esc(part.en)}</small>${part.added ? '<span class="map-added">多智能体新增</span>' : ''}</h3>
  </div>
  <p class="map-detail-duty">${esc(part.duty)}</p>
  <dl class="map-detail-grid">
    <div><dt>典型输出</dt><dd>${esc(part.output)}</dd></div>
    <div><dt>常见失效</dt><dd>${esc(part.failure)}</dd></div>
    <div><dt>该问的问题</dt><dd>${esc(part.question)}</dd></div>
  </dl>
  <p class="map-detail-multi"><strong>多智能体时：</strong>${esc(part.multi)}</p>
  ${examplesHTML(part)}
  <div class="map-detail-links"><span>相关入口</span>${part.links.map(linkButton).join('')}</div>`;
}

export function mapPartDetailHTML(part) {
  if (!part) return '';
  return `<div class="map-detail-body">${partBodyHTML(part)}</div>${demoPanelHTML(part)}`;
}

export function mapMethodDetailHTML(id) {
  const method = methodByMapId.get(id) || mapMethods[0];
  const part = partById.get(method.part);
  const checks = method.checks
    .map(limitId => limitById.get(limitId))
    .filter(Boolean)
    .map(limit => `<button class="term-link" data-map-filter-focus="${esc(limit.layer)}">${esc(limit.title)}</button>`)
    .join('、');
  const chapter = methodById.get(method.why);
  const demo = demoByPart.get(part.id);
  return `<p><strong>${esc(method.name)}</strong> 接在 <button class="term-link" data-map-part="${esc(part.id)}">${esc(layerName(part))} · ${esc(part.name)}</button>。</p>
  <p>它改变的是：${esc(method.change)}</p>
  <p>先查：${checks} 相关的局限。</p>
  ${chapter ? `<p><button class="map-link" data-why="${esc(method.why)}"><span>读</span>${esc(chapter.title)}</button></p>` : ''}
  ${demo ? `<p><button class="term-link" data-map-demo-jump="${esc(part.id)}">看这一部分的滑条例子</button></p>` : ''}`;
}

function partChip(part, selected) {
  const index = mapParts.indexOf(part) + 1;
  return `<button class="map-chip ${selected === part.id ? 'is-selected' : ''}" data-map-part="${esc(part.id)}" aria-pressed="${selected === part.id}">
    <span class="map-chip-num">${String(index).padStart(2, '0')}</span>
    <span class="map-chip-name">${esc(part.name)}${part.added ? '<i class="map-chip-added" aria-label="多智能体新增">+</i>' : ''}${demoByPart.has(part.id) ? '<i class="map-chip-demo" aria-label="有滑条例子">例</i>' : ''}</span>
    <small>${esc(part.en)}</small>
  </button>`;
}

function limitCard(limit) {
  const layerLabel = limit.layer === 'cross' ? '贯穿' : layerById.get(limit.layer).name;
  return `<article class="map-limit" data-layer="${esc(limit.layer)}" data-limit="${esc(limit.id)}">
    <div class="map-limit-head"><h3>${esc(limit.title)}</h3><span class="map-layer-tag map-layer-${esc(limit.layer)}">${esc(layerLabel)}</span></div>
    <p><strong>局限：</strong>${esc(limit.limitation)}</p>
    <p><strong>现实表现：</strong>${esc(limit.symptom)}</p>
    <p><strong>该问：</strong>${esc(limit.question)}</p>
    <div class="map-limit-parts"><span>涉及部分</span>${limit.parts.map(id => partById.get(id)).filter(Boolean).map(part => `<button class="term-link" data-map-part="${esc(part.id)}">${esc(part.name)}</button>`).join('')}</div>
  </article>`;
}

const filterButtons = [['all', '全部'], ...mapLayers.map(layer => [layer.id, layer.name]), ['cross', '贯穿']];

export function mapHTML(partId = 'goal') {
  const selected = partById.has(partId) ? partId : mapParts[0].id;
  const selectedHasDemo = demoByPart.has(selected);
  return `<article class="map-page">
    <header class="map-hero">
      <p class="map-kicker">${esc(mapIntro.kicker)}</p>
      <h1>${esc(mapIntro.title)}</h1>
      <p class="map-lead">${esc(mapIntro.lead)}</p>
      <nav class="map-jump" aria-label="页面目录">
        <button data-map-jump="map-structure">组成</button>
        <button data-map-jump="map-delta">多智能体增量</button>
        <button data-map-jump="map-limits">局限</button>
        <button data-map-jump="map-usage">用法</button>
      </nav>
    </header>

    <section class="map-section" id="map-structure" aria-labelledby="map-structure-title">
      <h2 id="map-structure-title">一、控制由什么组成</h2>
      <p class="map-intro-line">四层十部分，评价贯穿所有层。点一个部分，看它负责什么、会怎样失败、有哪些典型控制器/算法，以及多智能体改变了什么。带“例”的部分有可拖滑条的动手例子。</p>
      <div class="map-board">
        ${mapLayers.map(layer => `<div class="map-layer" data-layer="${esc(layer.id)}">
          <div class="map-layer-head">
            <span class="map-layer-tag map-layer-${esc(layer.id)}">${esc(layer.name)}</span>
            <span class="map-layer-en">${esc(layer.en)}</span>
            <span class="map-layer-ask">${esc(layer.ask)}</span>
            <p>${esc(layer.summary)}</p>
          </div>
          <div class="map-chips" role="group" aria-label="${esc(layer.name)}的部分">${mapParts.filter(part => part.layer === layer.id).map(part => partChip(part, selected)).join('')}</div>
        </div>`).join('')}
        <div class="map-layer map-layer-cross" data-layer="cross">
          <div class="map-layer-head">
            <span class="map-layer-tag map-layer-cross">贯穿</span>
            <span class="map-layer-en">Evaluation</span>
            <span class="map-layer-ask">${esc(mapCross.ask)}</span>
            <p>${esc(mapCross.summary)}</p>
          </div>
          <div class="map-chips" role="group" aria-label="贯穿所有层的部分">${mapParts.filter(part => part.layer === 'cross').map(part => partChip(part, selected)).join('')}</div>
        </div>
      </div>
      <div class="map-detail${selectedHasDemo ? ' has-demo' : ''}" id="map-part-detail" aria-live="polite">${mapPartDetailHTML(partById.get(selected))}</div>
      <details class="map-note"><summary>这张图的边界，以及为什么这样组织</summary><p>${esc(mapIntro.note)}</p><p>${esc(mapIntro.closing)}</p></details>
    </section>

    <section class="map-section" id="map-delta" aria-labelledby="map-delta-title">
      <h2 id="map-delta-title">二、多智能体比一般控制多了什么</h2>
      <p class="map-intro-line">不是控制律变复杂，而是每个部分从“单体、集中、全局”变成“局部、异步、相互影响”，并新增通信、组织与耦合安全。</p>
      <div class="map-table-scroll" role="region" aria-label="一般控制与多智能体控制对照" tabindex="0"><table>
        <caption>一般控制与多智能体控制的逐维对照（教学整理）</caption>
        <thead><tr><th scope="col">维度</th><th scope="col">一般控制</th><th scope="col">多智能体新增</th><th scope="col">直接后果</th></tr></thead>
        <tbody>${mapDeltas.map(row => `<tr><th scope="row">${esc(row.dim)}</th><td>${esc(row.single)}</td><td>${esc(row.added)}</td><td>${esc(row.effect)}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="map-additions">${mapAdditions.map(item => `<div><h3>${esc(item.name)}</h3><p>${esc(item.text)}</p></div>`).join('')}</div>
    </section>

    <section class="map-section" id="map-limits" aria-labelledby="map-limits-title">
      <h2 id="map-limits-title">三、局限性：按上面的部分归并</h2>
      <p class="map-intro-line">同一组局限可以横跨多个部分；先按层筛选，再逐项问“假设有没有被验证”。</p>
      <div class="map-filter" role="group" aria-label="按层筛选局限">${filterButtons.map(([id, label]) => `<button data-map-filter="${id}" aria-pressed="${id === 'all'}" class="${id === 'all' ? 'is-selected' : ''}">${esc(label)}</button>`).join('')}</div>
      <p class="map-filter-count" id="map-limit-count">共 ${mapLimits.length} 组</p>
      <div class="map-limits">${mapLimits.map(limitCard).join('')}</div>
      <div class="map-packaging"><h3>最常见的四种“包装”</h3><ul>${mapPackaging.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>
    </section>

    <section class="map-section" id="map-usage" aria-labelledby="map-usage-title">
      <h2 id="map-usage-title">四、怎么用这张图</h2>
      <ol class="map-steps">${mapSteps.map((step, index) => `<li><span>${index + 1}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`).join('')}</ol>
      <div class="map-locator">
        <h3>定位练习：把方法放回结构</h3>
        <p>点一个方法，看它接在哪一部分、先查哪组局限；有例子的部分可以顺手拖一下滑条。</p>
        <div class="map-methods" role="group" aria-label="选择一个方法">${mapMethods.map(method => `<button data-map-method="${esc(method.id)}" aria-pressed="${method.id === mapMethods[0].id}" class="${method.id === mapMethods[0].id ? 'is-selected' : ''}">${esc(method.name)}</button>`).join('')}</div>
        <div class="map-method-detail" id="map-method-detail" aria-live="polite">${mapMethodDetailHTML(mapMethods[0].id)}</div>
      </div>
      <div class="map-next">
        <p>下一步：<button class="term-link" data-study-view="zero">走 12 课零基础入门</button> · <button class="term-link" data-why="overview">按困难读 14 章</button> · <button class="term-link" data-study-view="research">把判断写成研究行动单</button></p>
      </div>
    </section>
  </article>`;
}

export function mapMatches(query) {
  const q = String(query ?? '').trim().toLocaleLowerCase();
  if (!q) return {parts: [], limits: []};
  const hit = value => String(value).toLocaleLowerCase().includes(q);
  const parts = mapParts.filter(part => [part.name, part.en, part.duty, part.output, part.failure, part.question, part.multi].some(hit));
  const limits = mapLimits.filter(limit => [limit.title, limit.limitation, limit.symptom, limit.question].some(hit));
  return {parts, limits};
}

export function mapResultsHTML({parts, limits}) {
  const rows = [
    ...parts.map(part => `<article class="map-result"><h3><button class="term-link" data-map-open="${esc(part.id)}">${esc(part.name)}</button><span>${esc(layerName(part))}</span></h3><p>${esc(part.duty)}</p></article>`),
    ...limits.map(limit => `<article class="map-result"><h3><button class="term-link" data-map-open="${esc(limit.parts[0])}">${esc(limit.title)} · 局限</button></h3><p>${esc(limit.limitation)}。${esc(limit.question)}</p></article>`),
  ];
  return rows.join('');
}

function refreshDemo(panel) {
  const demo = mapDemos.find(item => item.kind === panel.dataset.demo);
  if (!demo) return;
  const params = {};
  panel.querySelectorAll('[data-demo-range]').forEach(input => { params[input.dataset.demoRange] = Number(input.value); });
  demo.ranges.forEach(range => {
    const output = panel.querySelector(`[data-demo-out="${range.key}"]`);
    if (output) output.textContent = fmt(params[range.key], range.digits);
  });
  const scene = demoSceneHTML(demo.kind, params);
  const readout = panel.querySelector('[data-demo-readout]');
  const visual = panel.querySelector('[data-demo-visual]');
  if (readout) readout.innerHTML = scene.readout;
  if (visual) visual.innerHTML = scene.visual;
}

export function mountMap(root, {onSelect} = {}) {
  const $ = selector => root.querySelector(selector);
  const selectPart = id => {
    const part = partById.get(id);
    if (!part) return;
    const detail = $('#map-part-detail');
    if (detail) {
      detail.innerHTML = mapPartDetailHTML(part);
      detail.classList.toggle('has-demo', demoByPart.has(id));
    }
    root.querySelectorAll('.map-chip').forEach(chip => {
      const active = chip.dataset.mapPart === id;
      chip.classList.toggle('is-selected', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    onSelect?.(id);
  };
  const selectMethod = id => {
    const method = methodByMapId.get(id);
    if (!method) return;
    const detail = $('#map-method-detail');
    if (detail) detail.innerHTML = mapMethodDetailHTML(id);
    root.querySelectorAll('[data-map-method]').forEach(button => {
      const active = button.dataset.mapMethod === id;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  const applyFilter = layer => {
    root.querySelectorAll('[data-map-filter]').forEach(button => {
      const active = button.dataset.mapFilter === layer;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    let shown = 0;
    root.querySelectorAll('.map-limit').forEach(card => {
      const visible = layer === 'all' || card.dataset.layer === layer;
      card.hidden = !visible;
      if (visible) shown++;
    });
    const count = $('#map-limit-count');
    if (count) count.textContent = layer === 'all' ? `共 ${mapLimits.length} 组` : `显示 ${shown} / ${mapLimits.length} 组`;
  };
  const jumpTo = id => {
    const target = root.querySelector('#' + id), main = root.closest('main');
    if (!target || !main) return;
    main.scrollTo({top: main.scrollTop + target.getBoundingClientRect().top - main.getBoundingClientRect().top - 14, behavior: 'smooth'});
    const heading = target.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({preventScroll: true});
  };
  const onClick = event => {
    const jump = event.target.closest('[data-map-jump]');
    if (jump) { jumpTo(jump.dataset.mapJump); return; }
    const reset = event.target.closest('[data-demo-reset]');
    if (reset) {
      const panel = reset.closest('.map-demo');
      panel?.querySelectorAll('[data-demo-range]').forEach(input => { input.value = input.defaultValue; });
      if (panel) refreshDemo(panel);
      return;
    }
    const demoJump = event.target.closest('[data-map-demo-jump]');
    if (demoJump) { selectPart(demoJump.dataset.mapDemoJump); jumpTo('map-structure'); return; }
    const chip = event.target.closest('[data-map-part]');
    if (chip) { selectPart(chip.dataset.mapPart); return; }
    const method = event.target.closest('[data-map-method]');
    if (method) { selectMethod(method.dataset.mapMethod); return; }
    const filter = event.target.closest('[data-map-filter]');
    if (filter) { applyFilter(filter.dataset.mapFilter); return; }
    const focus = event.target.closest('[data-map-filter-focus]');
    if (focus) { applyFilter(focus.dataset.mapFilterFocus); jumpTo('map-limits'); return; }
  };
  const onInput = event => {
    if (!event.target.matches('[data-demo-range]')) return;
    const panel = event.target.closest('.map-demo');
    if (panel) refreshDemo(panel);
  };
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  return () => { root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); };
}
