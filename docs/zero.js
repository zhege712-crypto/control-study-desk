// Render and mount the zero-background course (#view=zero). Pure render functions stay free of
// DOM access so tools/check_zero.mjs can import this module under Node.
import {
  zeroIntro, zeroParts, zeroLessons, zeroLessonById, zeroPlacement, zeroNextSteps, zeroFaq,
  zeroTerms, zeroIds, zeroMatches,
} from './zero-content.js?v=20261118-zero2';
import {
  HEAT, SPEED, TOTAL_STEPS, heatHistory, speedHistory, agreeHistory, mean, spread,
} from './zero-models.js?v=20261118-zero2';
import {blocks} from './content.js';

export {zeroIds, zeroMatches, zeroTerms};

const blockNames = new Map(blocks.map(block => [block.id, block.title]));
const completed = new Set(); // In-page memory only: no localStorage, no server.
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const fmt = (value, digits = 1) => Number(value).toFixed(digits);
const dayLabel = lesson => `第 ${zeroIds.indexOf(lesson.id) + 1} / ${zeroIds.length} 课`;

function lessonButton(id, label, cls = 'zero-lesson-link') {
  return `<button class="${cls}" data-zero="${esc(id)}">${esc(label)}</button>`;
}
function viewButton(id, label) {
  return `<button class="secondary-button" data-study-view="${esc(id)}">${esc(label)}</button>`;
}

function placementHTML() {
  return `<section class="zero-section zero-placement" aria-labelledby="zero-placement-title">
    <h2 id="zero-placement-title">先花 30 秒：你适合从哪一课开始？</h2>
    <p>${esc(zeroPlacement.lead)}</p>
    <div class="zero-questions">${zeroPlacement.questions.map((question, index) => `<fieldset class="zero-question"><legend>${index + 1}. ${esc(question.label)}</legend>${question.options.map(([text], optionIndex) => `<label><input type="radio" name="zero-placement-${esc(question.id)}" value="${optionIndex}" data-zero-radio="${esc(question.id)}"> ${esc(text)}</label>`).join('')}</fieldset>`).join('')}</div>
    <div class="zero-placement-actions"><button class="primary-button" id="zero-placement-run">看看建议</button><button class="ref-link" id="zero-placement-reset">重选</button></div>
    <p id="zero-placement-result" class="zero-placement-result" role="status" aria-live="polite"></p>
    <p class="zero-note">${esc(zeroPlacement.note)}</p>
  </section>`;
}

function lessonCardHTML(lesson) {
  return `<article class="zero-card">
    <div class="zero-card-top"><span class="zero-number">${esc(lesson.id.slice(1))}</span><span class="zero-card-meta">${lesson.minutes} 分钟</span>${completed.has(lesson.id) ? '<span class="zero-done" aria-label="已在本页标记完成">✓ 已读</span>' : ''}</div>
    <h3><button class="zero-card-open" data-zero="${esc(lesson.id)}">${esc(lesson.title)}</button></h3>
    <p class="zero-card-en">${esc(lesson.en)}</p>
    <p>${esc(lesson.goal)}</p>
  </article>`;
}

function mapHTML() {
  return `<section class="zero-section" aria-labelledby="zero-map-title">
    <h2 id="zero-map-title">课程地图：4 个部分，12 课</h2>
    <p>按顺序走完约 ${zeroIntro.minutes} 分钟；每课一个生活场景、一个术语卡和一个自测题。你可以随时跳到感兴趣的一课。</p>
    ${zeroParts.map(part => `<div class="zero-part"><div class="zero-part-head"><div class="zero-part-tag">${esc(part.id)}</div><div><h3>${esc(part.title)}</h3><p>${esc(part.goal)}</p></div></div><div class="zero-cards">${zeroLessons.filter(lesson => lesson.part === part.id).map(lessonCardHTML).join('')}</div></div>`).join('')}
  </section>`;
}

function methodHTML() {
  return `<section class="zero-section" aria-labelledby="zero-method-title">
    <h2 id="zero-method-title">每一课怎么读</h2>
    <div class="zero-methods">${zeroIntro.method.map(([title, text], index) => `<div><span>${index + 1}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`).join('')}</div>
    <p class="zero-note">不需要先学微积分或编程。表格里的数字都能手算；公式都放在可展开的“可选”里，看不懂可以先跳过。</p>
  </section>`;
}

function labIndexHTML() {
  const labs = [
    ['L03', '取暖器实验', '看开环和闭环的差别：固定档位为什么停不到目标？'],
    ['L06', '定速巡航实验', '调增益，看最终速度、接近速度和执行器上限。'],
    ['L10', '三台机器人实验', '看三个只和邻居说话的个体怎样靠近、通信断开又会怎样。'],
  ];
  return `<section class="zero-section" aria-labelledby="zero-labs-title">
    <h2 id="zero-labs-title">三个离线实验</h2>
    <p>实验全部在本地运行，不联网、不上传。每个实验都有“播放 / 前进一步 / 重置”和当前数值。</p>
    <div class="zero-lab-index">${labs.map(([id, title, text]) => `<article><h3>${esc(title)}</h3><p>${esc(text)}</p>${lessonButton(id, `去第 ${zeroIds.indexOf(id) + 1} 课做实验`, 'secondary-button')}</article>`).join('')}</div>
  </section>`;
}

function glossaryHTML() {
  return `<section class="zero-section" aria-labelledby="zero-glossary-title">
    <h2 id="zero-glossary-title">术语表：${zeroTerms.length} 个词，先认识中文和英文</h2>
    <p>读论文时遇到不认识的词，可以回到这里。每个词都标了第一次出现在哪一课。</p>
    <details class="zero-glossary"><summary>展开术语表</summary><div class="zero-table-scroll"><table><caption>中文术语与英文术语对照；解释为本站教学表述</caption><thead><tr><th scope="col">中文</th><th scope="col">英文</th><th scope="col">一句话解释</th><th scope="col">首次出现</th></tr></thead><tbody>${zeroTerms.map(term => `<tr><th scope="row">${esc(term.zh)}</th><td>${esc(term.en)}</td><td>${esc(term.definition)}</td><td>${lessonButton(term.lesson, term.lesson)}</td></tr>`).join('')}</tbody></table></div></details>
  </section>`;
}

function faqHTML() {
  return `<section class="zero-section" aria-labelledby="zero-faq-title">
    <h2 id="zero-faq-title">新手常问</h2>
    <div class="zero-faq">${zeroFaq.map(([question, answer]) => `<details class="zero-details"><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join('')}</div>
  </section>`;
}

function nextStepsHTML() {
  return `<section class="zero-section" aria-labelledby="zero-next-title">
    <h2 id="zero-next-title">学完以后去哪儿</h2>
    <p>12 课建立的是地图和直觉。真正的论文需要核对模型、假设、版本和阅读深度；本站每个论文区块都标明了这些。</p>
    <div class="zero-next">${zeroNextSteps.map(([title, view, text]) => `<article><h3>${esc(title)}</h3><p>${esc(text)}</p>${viewButton(view, '打开')}</article>`).join('')}</div>
    <p class="zero-note">${esc(zeroIntro.boundary)}</p>
  </section>`;
}

function overviewHTML() {
  const firstLesson = zeroLessons[0];
  return `<article class="zero-page">
    <header class="zero-hero"><p class="zero-kicker">零基础路线 · 不需要控制基础</p><h1>${esc(zeroIntro.title)}</h1><p class="zero-lead">${esc(zeroIntro.lead)}</p><div class="zero-hero-actions">${lessonButton(firstLesson.id, '从第 1 课开始', 'primary-button')}${lessonButton('L05', '我会一点，从第 5 课开始', 'secondary-button')}<button class="term-link" id="zero-jump-placement">先做 3 题自测</button></div></header>
    ${placementHTML()}
    <section class="zero-section zero-first" aria-labelledby="zero-first-title"><h2 id="zero-first-title">一句话先记住</h2><p class="zero-first-line">控制 = 看实际结果，和目标比较，再决定下一步动作。</p><p>后面 12 课都在展开这句话：看什么、比什么、怎么决定、会出什么问题、多台机器怎么办。</p></section>
    ${mapHTML()}
    ${methodHTML()}
    ${faqHTML()}
    ${labIndexHTML()}
    ${glossaryHTML()}
    ${nextStepsHTML()}
    <p class="zero-note">这一版是新增的入门路线，原有“初学者入口”“看图理解数学”“论文区块”等内容保持不变；两套入口可以互相跳转。</p>
  </article>`;
}

function tableHTML(table) {
  return `<div class="zero-table-scroll"><table><caption>${esc(table.caption)}</caption><thead><tr>${table.head.map(head => `<th scope="col">${esc(head)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${table.note ? `<p class="zero-note">${esc(table.note)}</p>` : ''}`;
}

function termsHTML(lesson) {
  return `<section class="zero-section" aria-labelledby="zero-terms-${esc(lesson.id)}"><h2 id="zero-terms-${esc(lesson.id)}">本课术语</h2><div class="zero-terms">${lesson.terms.map(([zh, en, definition]) => `<div class="zero-term"><p><strong>${esc(zh)}</strong><span>${esc(en)}</span></p><p>${esc(definition)}</p></div>`).join('')}</div></section>`;
}

function linksHTML(lesson) {
  const links = lesson.links;
  if (!links) return '';
  const buttons = [];
  for (const [view, label] of links.views ?? []) buttons.push(`<button class="secondary-button" data-study-view="${esc(view)}">${esc(label)}</button>`);
  for (const id of links.blocks ?? []) buttons.push(`<button class="secondary-button" data-block="${esc(id)}">概念区块：${esc(blockNames.get(id) ?? id)}</button>`);
  for (const id of links.papers ?? []) buttons.push(`<button class="secondary-button" data-study-paper="${esc(id)}">论文区块：${esc(id)}</button>`);
  if (!buttons.length) return '';
  return `<section class="zero-section"><h2>把这一课接回现有内容</h2><div class="zero-links">${buttons.join('')}</div></section>`;
}

function labShellHTML(lesson) {
  const lab = lesson.lab;
  if (!lab) return '';
  if (lab === 'heat') return heatLabHTML();
  if (lab === 'speed') return speedLabHTML();
  if (lab === 'agree') return agreeLabHTML();
  return '';
}

function lessonHTML(lesson) {
  const index = zeroIds.indexOf(lesson.id);
  const previous = zeroLessons[index - 1];
  const next = zeroLessons[index + 1];
  const done = completed.has(lesson.id);
  return `<article class="zero-page zero-lesson">
    <nav class="zero-breadcrumb" aria-label="课程导航"><button class="back-button" data-zero="overview">← 返回课程地图</button><span>${dayLabel(lesson)}</span></nav>
    <header class="zero-lesson-head"><p class="zero-kicker">${esc(zeroParts.find(part => part.id === lesson.part)?.title ?? '')}</p><h1>${esc(lesson.id.slice(1))} · ${esc(lesson.title)}</h1><p class="zero-en">${esc(lesson.en)} · ${lesson.minutes} 分钟</p><p class="zero-goal"><strong>本课目标：</strong>${esc(lesson.goal)}</p></header>
    <section class="zero-section zero-story"><h2>先看一个生活场景</h2><p>${esc(lesson.story)}</p><p>${esc(lesson.manual)}</p><p class="zero-gap"><strong>自动化多了什么：</strong>${esc(lesson.gap)}</p></section>
    <section class="zero-section"><h2>用一张表看清</h2>${tableHTML(lesson.table)}</section>
    ${labShellHTML(lesson)}
    ${lesson.formula ? `<details class="zero-formula"><summary>可选：把这一课写成公式（可以跳过）</summary><p class="zero-formula-label">${esc(lesson.formula.label)}</p><div class="math" data-math="${esc(lesson.formula.tex)}"></div><p>${esc(lesson.formula.plain)}</p></details>` : ''}
    ${termsHTML(lesson)}
    <section class="zero-section"><h2>常见误解</h2><details class="zero-details"><summary>${esc(lesson.misconception.q)}</summary><p>${esc(lesson.misconception.a)}</p></details><h2 class="zero-check-title">自测一下</h2><details class="zero-details"><summary>${esc(lesson.check.q)}</summary><p>${esc(lesson.check.a)}</p></details></section>
    <section class="zero-section zero-output"><h2>本课小产出</h2><p>${esc(lesson.output)}</p><button class="secondary-button" id="zero-mark-done" aria-pressed="${done}">${done ? '已标记读完（仅本页记忆）' : '标记本课读完（仅本页记忆）'}</button><p class="zero-note">标记只保留在当前页面，刷新即清除；不写本地存储，也不上传。</p></section>
    ${linksHTML(lesson)}
    <nav class="zero-pager" aria-label="上一课和下一课">${previous ? lessonButton(previous.id, `← 第 ${zeroIds.indexOf(previous.id) + 1} 课：${previous.title}`, 'zero-pager-link') : '<span></span>'}${next ? lessonButton(next.id, `第 ${zeroIds.indexOf(next.id) + 1} 课：${next.title} →`, 'zero-pager-link') : lessonButton('overview', '完成：回到课程地图 →', 'zero-pager-link')}</nav>
  </article>`;
}

function playerHTML(max) {
  return `<div class="zero-player"><button class="secondary-button" id="zero-play">播放</button><button class="secondary-button" id="zero-step">前进一步</button><button class="ref-link" id="zero-reset">重置</button><label for="zero-time">时间步 <output id="zero-time-value">0 / ${max}</output></label><input id="zero-time" type="range" min="0" max="${max}" value="${max}" aria-label="时间步"></div>`;
}

function labFrameHTML({id, title, intro, controls, steps, footnote}) {
  return `<section class="zero-section zero-lab" id="zero-lab-${esc(id)}" aria-labelledby="zero-lab-${esc(id)}-title"><p class="zero-kicker">离线实验</p><h2 id="zero-lab-${esc(id)}-title">${esc(title)}</h2><p>${esc(intro)}</p><div class="zero-lab-controls">${controls}</div>${playerHTML(steps)}<div id="zero-lab-${esc(id)}-chart" class="zero-chart" role="img" aria-label="${esc(title)}的曲线"></div><div id="zero-lab-${esc(id)}-readout" class="zero-readout" role="status" aria-live="polite"></div><div id="zero-lab-${esc(id)}-table" class="zero-table-scroll"></div><p class="zero-note">${esc(footnote)}</p></section>`;
}

function heatLabHTML() {
  return labFrameHTML({
    id: 'heat', title: '实验一：房间取暖', steps: TOTAL_STEPS,
    intro: '改控制方式、增益、延迟或窗户，看室温曲线怎么变。读图先看三处：横轴是第几步，纵轴是室温，虚线是目标 22°C；打开窗户后，第 40 步起室外温度从 10°C 降到 2°C。',
    controls: `<label for="zero-heat-mode">控制方式<select id="zero-heat-mode"><option value="closed">闭环：测室温再调功率</option><option value="open">开环：固定 65% 档位</option></select></label>
      <label for="zero-heat-gain">增益<select id="zero-heat-gain"><option value="0.1">0.1 · 很温柔</option><option value="0.3" selected>0.3 · 本课默认</option><option value="1.0">1.0 · 很急</option><option value="1.5">1.5 · 过猛</option></select></label>
      <label for="zero-heat-delay">测量延迟<select id="zero-heat-delay"><option value="0">0 步（及时）</option><option value="4">4 步（消息晚到）</option></select></label>
      <label class="zero-check-label"><input type="checkbox" id="zero-heat-window"> 打开窗户（第 40 步起室外 2°C）</label>`,
    footnote: '教学模型：室温每分钟按 T←T+1.2×功率−0.08×(T−室外) 更新，功率上限为 1。它是自编的简化模型，不是真实房屋实验。',
  });
}

function speedLabHTML() {
  return labFrameHTML({
    id: 'speed', title: '实验二：定速巡航', steps: TOTAL_STEPS,
    intro: '目标是 20 m/s。读图先看横轴（第几步）、纵轴（车速）和虚线（目标 20 m/s）；改增益与延迟，看车速怎样接近目标；勾选“上坡”后，第 20 步起出现持续阻力。',
    controls: `<label for="zero-speed-gain">增益<select id="zero-speed-gain"><option value="0.3">0.3 · 很稳但慢</option><option value="0.5" selected>0.5 · 本课默认</option><option value="1.2">1.2 · 反应快</option><option value="2.0">2.0 · 很激进</option></select></label>
      <label for="zero-speed-delay">测量延迟<select id="zero-speed-delay"><option value="0">0 步（及时）</option><option value="3">3 步（消息晚到）</option></select></label>
      <label class="zero-check-label"><input type="checkbox" id="zero-speed-slope"> 上坡（第 20 步起持续阻力）</label>`,
    footnote: '教学模型：车速每秒按 v←v+加速度−0.05×v−坡度 更新，加速度上限为 ±2。它不包含发动机细节、风阻和轮胎模型，不是车辆实验。',
  });
}

function agreeLabHTML() {
  return labFrameHTML({
    id: 'agree', title: '实验三：三台机器人达成一致', steps: 40,
    intro: '三台机器人在 0、6、12 米处，每台只看相邻的邻居并往平均方向挪一点。改增益，看它们靠近多快；增益太大时会发生什么？',
    controls: `<label for="zero-agree-gain">增益<select id="zero-agree-gain"><option value="0.1">0.1 · 很慢</option><option value="0.2" selected>0.2 · 本课默认</option><option value="0.5">0.5 · 很快</option><option value="1.0">1.0 · 过大</option></select></label>`,
    footnote: '教学模型：每步 x₀←x₀+g(x₁−x₀)，x₁←x₁+g(x₀−x₁)+g(x₂−x₁)，x₂←x₂+g(x₁−x₂)。没有物理运动、避碰、消息延迟或丢包。',
  });
}

// ---- pure chart helpers ----
function axisTicks(min, max, count = 4) {
  const step = (max - min) / count;
  return Array.from({length: count + 1}, (_, i) => min + step * i);
}
function lineChart({lines, yMin, yMax, xMax, refs = [], bands = [], current = null, yUnit = '', xUnit = '步', label = '随步数变化的折线图'}) {
  const left = 78, right = 14, top = 18, bottom = 42, width = 600, height = 250;
  const plotW = width - left - right, plotH = height - top - bottom;
  const x = k => left + (k / xMax) * plotW;
  const y = v => top + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const ticks = axisTicks(yMin, yMax);
  const grid = ticks.map(t => `<line x1="${left}" y1="${y(t).toFixed(1)}" x2="${width - right}" y2="${y(t).toFixed(1)}" class="chart-grid"/><text x="${left - 10}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end" class="chart-tick">${fmt(t, 0)}${esc(yUnit)}</text>`).join('');
  const bandShapes = bands.map(([from, to, label]) => `<rect x="${x(from).toFixed(1)}" y="${top}" width="${(x(to) - x(from)).toFixed(1)}" height="${plotH}" class="chart-band"/>${label ? `<text x="${(x(from) + 6).toFixed(1)}" y="${top + 16}" class="chart-band-label">${esc(label)}</text>` : ''}`).join('');
  const refShapes = refs.map(([value, label]) => `<line x1="${left}" y1="${y(value).toFixed(1)}" x2="${width - right}" y2="${y(value).toFixed(1)}" class="chart-ref"/>${label ? `<text x="${width - right - 4}" y="${(y(value) - 6).toFixed(1)}" text-anchor="end" class="chart-ref-label">${esc(label)}</text>` : ''}`).join('');
  const curves = lines.map(line => {
    const points = line.points.filter(([k]) => current === null || k <= current).map(([k, v]) => `${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `<polyline points="${points}" fill="none" class="chart-line" style="stroke:${line.color}"/>`;
  }).join('');
  const currentLine = current === null ? '' : `<line x1="${x(current).toFixed(1)}" y1="${top}" x2="${x(current).toFixed(1)}" y2="${top + plotH}" class="chart-current"/>`;
  const legend = lines.map((line, i) => `<text x="${left + 14 + i * 120}" y="${height - 14}" class="chart-legend" style="fill:${line.color}">${esc(line.label)}</text>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">${grid}${bandShapes}${refShapes}${curves}${currentLine}<line x1="${left}" y1="${top + plotH}" x2="${width - right}" y2="${top + plotH}" class="chart-axis"/><line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" class="chart-axis"/><text x="${width - right}" y="${height - 4}" text-anchor="end" class="chart-tick">${esc(xUnit)}</text>${legend}</svg>`;
}

function stateTableHTML(caption, head, rows) {
  return `<table><caption>${esc(caption)}</caption><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function sampleRows(history, valueOf, steps = [0, 1, 2, 5, 10, 20, 40, TOTAL_STEPS]) {
  return steps.filter(step => step <= history.length - 1).map(step => [String(step), ...valueOf(history[step])]);
}

// ---- mount ----
export function mountZero(root, zero = 'overview') {
  root.querySelectorAll('[data-math]').forEach(el => window.katex?.render(el.dataset.math, el, {displayMode: true, throwOnError: false, trust: false, strict: 'ignore'}));
  const $ = selector => root.querySelector(selector);
  const lesson = zeroLessonById.get(zero);
  const cleanup = [];

  // Placement quiz (overview only).
  if (!lesson) {
    const run = $('#zero-placement-run');
    if (run) {
      const handler = () => {
        const first = root.querySelector('[data-zero-radio="feedback"]:checked');
        const result = $('#zero-placement-result');
        if (!first) {
          result.textContent = '先回答第 1 题就可以给出建议；其余两题可以跳过。';
          return;
        }
        const option = zeroPlacement.questions[0].options[Number(first.value)];
        const [, id, why] = option;
        const target = zeroLessonById.get(id);
        result.innerHTML = `<strong>建议：${esc(dayLabel(target))}「${esc(target.title)}」。</strong>${esc(why)} <button class="primary-button" data-zero="${esc(id)}">从这一课开始</button>`;
      };
      run.addEventListener('click', handler);
      cleanup.push(() => run.removeEventListener('click', handler));
    }
    const jump = $('#zero-jump-placement');
    if (jump) {
      const handler = () => root.querySelector('.zero-placement')?.scrollIntoView({behavior: 'smooth', block: 'start'});
      jump.addEventListener('click', handler);
      cleanup.push(() => jump.removeEventListener('click', handler));
    }
    const reset = $('#zero-placement-reset');
    if (reset) {
      const handler = () => {
        root.querySelectorAll('[data-zero-radio]').forEach(input => { input.checked = false; });
        const result = $('#zero-placement-result');
        if (result) result.textContent = '';
      };
      reset.addEventListener('click', handler);
      cleanup.push(() => reset.removeEventListener('click', handler));
    }
  }

  // Lesson completion mark (in-page only).
  const mark = $('#zero-mark-done');
  if (mark && lesson) {
    const handler = () => {
      if (completed.has(lesson.id)) completed.delete(lesson.id); else completed.add(lesson.id);
      mark.setAttribute('aria-pressed', String(completed.has(lesson.id)));
      mark.textContent = completed.has(lesson.id) ? '已标记读完（仅本页记忆）' : '标记本课读完（仅本页记忆）';
    };
    mark.addEventListener('click', handler);
    cleanup.push(() => mark.removeEventListener('click', handler));
  }

  // Labs.
  if (lesson?.lab === 'heat') cleanup.push(mountHeatLab(root));
  if (lesson?.lab === 'speed') cleanup.push(mountSpeedLab(root));
  if (lesson?.lab === 'agree') cleanup.push(mountAgreeLab(root));

  return () => cleanup.forEach(stop => stop());
}

function mountPlayer(root, max, onChange) {
  let step = max;
  let timer = null;
  const $ = selector => root.querySelector(selector);
  const range = $('#zero-time'), output = $('#zero-time-value'), play = $('#zero-play');
  const paint = () => {
    if (output) output.textContent = `${step} / ${max}`;
    if (range) range.value = String(step);
    onChange(step);
  };
  const stop = () => {
    if (timer) { clearInterval(timer); timer = null; }
    if (play) play.textContent = '播放';
  };
  const togglePlay = () => {
    if (timer) { stop(); return; }
    if (step >= max) step = 0;
    play.textContent = '暂停';
    timer = setInterval(() => {
      step = Math.min(max, step + 1);
      paint();
      if (step >= max) stop();
    }, 120);
  };
  play?.addEventListener('click', togglePlay);
  $('#zero-step')?.addEventListener('click', () => { stop(); step = Math.min(max, step + 1); paint(); });
  $('#zero-reset')?.addEventListener('click', () => { stop(); step = 0; paint(); });
  range?.addEventListener('input', event => { stop(); step = Number(event.target.value); paint(); });
  paint();
  return stop;
}

function mountHeatLab(root) {
  const $ = selector => root.querySelector(selector);
  const chart = $('#zero-lab-heat-chart'), readout = $('#zero-lab-heat-readout'), table = $('#zero-lab-heat-table');
  if (!chart) return () => {};
  let step = TOTAL_STEPS;
  const draw = shownStep => {
    const mode = $('#zero-heat-mode').value;
    const gain = Number($('#zero-heat-gain').value);
    const delay = Number($('#zero-heat-delay').value);
    const openWindow = $('#zero-heat-window').checked;
    const history = heatHistory({mode, gain, delay, openWindow});
    const last = history[Math.min(shownStep, history.length - 1)];
    chart.innerHTML = lineChart({
      lines: [{label: '室温 °C', color: '#265b87', points: history.map(record => [record.step, record.temperature])}],
      yMin: 8, yMax: 24, xMax: TOTAL_STEPS, yUnit: '°', current: shownStep, label: '取暖器实验：室温随步数变化，虚线是目标 22°C',
      refs: [[HEAT.target, '目标 22°C']],
      bands: openWindow ? [[HEAT.windowStep, TOTAL_STEPS, '开窗 · 室外 2°C']] : [],
    });
    const tail = history.slice(30);
    const low = Math.min(...tail.map(record => record.temperature));
    const high = Math.max(...tail.map(record => record.temperature));
    readout.innerHTML = `<p><strong>第 ${shownStep} 步：室温 ${fmt(last.temperature, 2)}°C</strong> · 功率 ${fmt(last.power, 2)} · ${mode === 'open' ? '开环固定档位' : `闭环，增益 ${gain}`}${delay ? ` · 测量延迟 ${delay} 步` : ''}${openWindow ? ' · 窗户已打开' : ''}</p><p>距目标 ${fmt(Math.abs(last.temperature - HEAT.target), 2)}°C；第 30 步后的波动范围 ${fmt(low, 2)}–${fmt(high, 2)}°C。</p>`;
    table.innerHTML = stateTableHTML('选定时间步的室温与功率', ['步', '室温 °C', '功率', '距目标 °C'], sampleRows(history, record => [fmt(record.temperature, 2), fmt(record.power, 2), fmt(record.temperature - HEAT.target, 2)], [0, 5, 10, 20, 40, 50, TOTAL_STEPS]));
  };
  const stopPlayer = mountPlayer(root, TOTAL_STEPS, value => { step = value; draw(value); });
  const redraw = () => draw(step);
  for (const selector of ['#zero-heat-mode', '#zero-heat-gain', '#zero-heat-delay', '#zero-heat-window']) $(selector)?.addEventListener('change', redraw);
  return stopPlayer;
}

function mountSpeedLab(root) {
  const $ = selector => root.querySelector(selector);
  const chart = $('#zero-lab-speed-chart'), readout = $('#zero-lab-speed-readout'), table = $('#zero-lab-speed-table');
  if (!chart) return () => {};
  let step = TOTAL_STEPS;
  const draw = shownStep => {
    const gain = Number($('#zero-speed-gain').value);
    const delay = Number($('#zero-speed-delay').value);
    const slope = $('#zero-speed-slope').checked ? 0.4 : 0;
    const history = speedHistory({gain, delay, slope});
    chart.innerHTML = lineChart({
      lines: [{label: '车速 m/s', color: '#326a59', points: history.map(record => [record.step, record.speed])}],
      yMin: 0, yMax: 24, xMax: TOTAL_STEPS, current: shownStep, label: '定速巡航实验：车速随步数变化，虚线是目标 20 m/s',
      refs: [[SPEED.target, '目标 20 m/s']],
      bands: slope ? [[20, TOTAL_STEPS, '上坡 · 持续阻力']] : [],
    });
    const last = history[Math.min(shownStep, history.length - 1)];
    const tail = history.slice(30);
    const low = Math.min(...tail.map(record => record.speed));
    const high = Math.max(...tail.map(record => record.speed));
    readout.innerHTML = `<p><strong>第 ${shownStep} 步：车速 ${fmt(last.speed, 2)} m/s</strong> · 加速度指令 ${fmt(last.accel, 2)} m/s² · 增益 ${gain}${delay ? ` · 延迟 ${delay} 步` : ''}${slope ? ' · 上坡' : ''}</p><p>距目标 ${fmt(Math.abs(last.speed - SPEED.target), 2)} m/s；第 30 步后波动范围 ${fmt(low, 2)}–${fmt(high, 2)} m/s。</p>`;
    table.innerHTML = stateTableHTML('选定时间步的车速与加速度指令', ['步', '车速 m/s', '加速度 m/s²', '距目标 m/s'], sampleRows(history, record => [fmt(record.speed, 2), fmt(record.accel, 2), fmt(record.speed - SPEED.target, 2)]));
  };
  const stopPlayer = mountPlayer(root, TOTAL_STEPS, value => { step = value; draw(value); });
  const redraw = () => draw(step);
  for (const selector of ['#zero-speed-gain', '#zero-speed-delay', '#zero-speed-slope']) $(selector)?.addEventListener('change', redraw);
  return stopPlayer;
}

function mountAgreeLab(root) {
  const $ = selector => root.querySelector(selector);
  const chart = $('#zero-lab-agree-chart'), readout = $('#zero-lab-agree-readout'), table = $('#zero-lab-agree-table');
  if (!chart) return () => {};
  const colors = ['#265b87', '#326a59', '#73538c'];
  let step = 40;
  const draw = shownStep => {
    const gain = Number($('#zero-agree-gain').value);
    const history = agreeHistory({gain});
    chart.innerHTML = lineChart({
      lines: [
        {label: '机器人 A', color: colors[0], points: history.map((record, k) => [k, record.positions[0]])},
        {label: '机器人 B', color: colors[1], points: history.map((record, k) => [k, record.positions[1]])},
        {label: '机器人 C', color: colors[2], points: history.map((record, k) => [k, record.positions[2]])},
      ],
      yMin: -2, yMax: 14, xMax: 40, current: shownStep, label: '三台机器人位置随步数变化，虚线是平均值 6 m', refs: [[mean(history[0].positions), '平均值 6 m']],
    });
    const now = history[Math.min(shownStep, history.length - 1)].positions;
    readout.innerHTML = `<p><strong>第 ${shownStep} 步：A ${fmt(now[0], 2)} m · B ${fmt(now[1], 2)} m · C ${fmt(now[2], 2)} m</strong></p><p>平均 ${fmt(mean(now), 2)} m（不变）；三者最大差距 ${fmt(spread(now), 2)} m，增益 ${gain}${gain >= 1 ? '（过大，来回摆）' : ''}。</p>`;
    table.innerHTML = stateTableHTML('选定时间步的三台机器人位置', ['步', 'A / m', 'B / m', 'C / m', '最大差距 / m'], history.filter((_, k) => [0, 1, 2, 5, 10, 20, 40].includes(k)).map(record => [String(record.step), fmt(record.positions[0], 2), fmt(record.positions[1], 2), fmt(record.positions[2], 2), fmt(spread(record.positions), 2)]));
  };
  const stopPlayer = mountPlayer(root, 40, value => { step = value; draw(value); });
  $('#zero-agree-gain')?.addEventListener('change', () => draw(step));
  return stopPlayer;
}

export function zeroResultsHTML(matches) {
  return matches.map(lesson => `<article class="zero-result"><h2><button class="term-link" data-zero="${esc(lesson.id)}">${esc(lesson.title)}</button></h2><p class="small-copy">${esc(lesson.en)} · ${lesson.minutes} 分钟 · 第 ${zeroIds.indexOf(lesson.id) + 1} 课</p><p>${esc(lesson.goal)}</p></article>`).join('');
}

export function zeroHTML(zero = 'overview') {
  const lesson = zeroLessonById.get(zero);
  return lesson ? lessonHTML(lesson) : overviewHTML();
}


