import {INITIAL,TOPOLOGIES,mean,spread,disagreement,consensusHistory,formationHistory,communicationHistory,safetyProjection} from './lab-models.js';
import {actionsHTML,mountActions} from './research-actions.js';

const colors=['#265b87','#326a59','#73538c','#9c4c2d'];
const names=['A','B','C','D'];
const link=(id,label)=>`<button class="term-link" data-block="${id}">${label}</button>`;
const labLink=(id,label)=>`<button class="secondary-button" data-lab="${id}">${label}</button>`;
const fmt=(x,d=2)=>Math.abs(x)>=1e4?Number(x).toExponential(2):Number(x).toFixed(d);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const math=s=>`<div class="math" data-math="${s}"></div>`;

export const labNames={consensus:'一致性：局部规则如何形成整体变化',formation:'编队：一致的是位置，还是偏移后的状态',communication:'通信：消息更少时，误差会怎样变化',safety:'安全过滤：想做的动作与允许的动作'};
export const guideFormulas=[
  String.raw`x_i(k+1)=x_i(k)+\varepsilon\sum_{j\in\mathcal N_i}(x_j(k)-x_i(k))`,
  String.raw`z_i=p_i-r_i,\qquad z(k+1)=(I-0.2L)z(k)`,
  String.raw`u_i(k)=0.15\sum_{j\in\mathcal N_i}(\hat x_j(k)-\hat x_i(k))`,
  String.raw`|x_i(k)-\hat x_i(k-1)|\ge\theta`,
  String.raw`\dot d=u,\quad h=d,\quad u+\kappa d\ge0,\quad u\in[-1,1]`,
];

function graphSVG(topology='path') {
  const points=[[40,40],[160,40],[160,140],[40,140]];
  return `<svg class="communication-graph" viewBox="0 0 200 180" role="img" aria-label="四节点${topology==='split'?'断开':topology==='ring'?'环形':'链式'}无向通信图">${TOPOLOGIES[topology].map(([i,j])=>`<line x1="${points[i][0]}" y1="${points[i][1]}" x2="${points[j][0]}" y2="${points[j][1]}" class="network-edge"/>`).join('')}${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="19" fill="${colors[i]}" stroke="none"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="white">${names[i]}</text>`).join('')}</svg>`;
}
const labTabs=current=>`<div class="lab-tabs" aria-label="选择交互例子">${Object.entries(labNames).map(([id,name])=>`<button class="${id===current?'active':''}" data-lab="${id}" ${id===current?'aria-current="page"':''}>${name.split('：')[0]}</button>`).join('')}</div>`;
const originNote='<p class="scope-note">交互区是网页自编的确定性教学模型，使用无量纲状态；没有调用研究工作区的控制器、训练、求解器或物理实验。概念出处与已有论文区块相连，示例不冒充论文复现。</p>';
const exercise=(question,answer)=>`<details class="thinking-question"><summary>${question}</summary><p>${answer}</p></details>`;

function startHTML() {
  const path=[
    ['补齐运动、程序和反馈','手算两步运动，解释一次状态更新和一次反馈。','motion-basics','从基础三问开始'],
    ['把一个系统说清楚','能说明谁是 agent、它知道什么、能改变什么。','mas-basics','看一个四车例子'],
    ['让一条局部规则跑起来','先手算一个 agent 的一次更新，再预测整组会怎样变化。','consensus-starter','读懂第一条控制律'],
    ['换一个目标，看看发生什么','区分状态一致、保持队形、跟踪目标与途中安全。','formation-starter','分清四类要求'],
    ['把论文读成一张问题卡','找出模型、信息、假设、机制与结论边界。','read-first-paper','用 Z08 定位正文'],
    ['留下能被检查的第一份结果','保存运行规则、完整过程、比较设置和失败记录。','first-reproduction','运行我的第一份代码'],
  ];
  return `<section class="beginner-start"><div class="start-lead"><div><h1>多智能体研究，<br>从理解变化到检验问题。</h1><p class="guide-intro">先补运动、程序更新与反馈，再把协作现象写成模型和问题。每一轮都留下可以检查的材料，并据此决定下一步。</p><button class="primary-button" data-block="motion-basics">先补运动与反馈基础</button> <button class="secondary-button" data-study-view="research">已有基础，直接研究起步</button><p class="small-copy">基础三问从单位和两步手算讲起，不预设学过控制。方法区逐步使用高数和线代；需要时可回到数学桥梁。</p></div><div class="starter-graph">${graphSVG()}<p>每个人只和相邻的人交换信息。<br>他们能一起走向同一个结果吗？</p></div></div>
  <section class="guide-section"><h2>先补这三个基础问题</h2><div class="question-links">${link('motion-basics','位置、速度、加速度怎样联系？')}${link('update-basics','程序怎样按步骤更新变量？')}${link('feedback-basics','根据当前状态调整动作，怎样形成反馈？')}</div><p>小产出：一张两步运动表、一段保留旧状态的程序、一个能解释增益影响的反馈例子。基础会了可以直接跳过。</p></section>
  <section class="guide-section"><h2>你可能正卡在这里</h2><div class="question-links">${link('math-bridge','公式里的矩阵到底在算什么？')}${link('formation-starter','一致性与编队有什么区别？')}${link('control-learning','一定要先学强化学习吗？')}${link('research-loop','读完论文以后，怎样开始一轮研究？')}${link('literature-gap','怎样检索，才不在阅读上踏步？')}${link('failure-diagnosis','结果不好时，先查什么？')}</div></section>
  <section class="guide-section"><h2>一条可选的入门路径</h2><p>每一站都有一个小产出。你可以按顺序走，也可以从眼前的问题进入。</p><ol class="learning-path">${path.map(([title,outcome,id,label])=>`<li><div><h3>${title}</h3><p>${outcome}</p></div>${link(id,label)}</li>`).join('')}</ol></section>
  <section class="guide-section"><h2>同一个概念，可以换一种方式理解</h2><div class="learning-modes"><div><h3>先看变化</h3><p>调通信图、拖动时间、切换目标，观察哪个现象改变。</p>${labLink('consensus','打开四个交互例子')}</div><div><h3>再算一步</h3><p>从四个具体数字开始，逐项解释更新规则与矩阵。</p>${link('math-bridge','补齐这次需要的数学')}</div><div><h3>最后动手</h3><p>下载短代码，保存一个能检查的结果，填写自己的问题卡。</p><button class="term-link" data-study-view="research">进入研究起步</button></div></div></section>
  <section class="guide-section"><h2>把这些区别留在脑中</h2><p>多个 agent、分布式计算和多智能体强化学习并不是同一个意思；状态收敛、任务完成和全过程安全也要分别检查。每个基础区块末尾都有一题“想一想”，可以先自己回答，再展开解释。</p>${link('stability-language','分清收敛、稳定与安全')} · ${link('architectures','分清计算架构')} · ${link('information','分清真实状态与收到的信息')}</section></section>`;
}

function playerHTML(max=60) {
  return `<div class="lab-player"><button id="lab-play" class="secondary-button">播放</button><button id="lab-step" class="secondary-button">前进一步</button><button id="lab-reset" class="ref-link">回到起点</button><label for="lab-time">更新步 <output id="lab-time-value">0 / ${max}</output></label><input id="lab-time" type="range" min="0" max="${max}" value="0" aria-label="更新步"/></div>`;
}
function commonLab(id,body,explanation) {
  return `<section class="lab-page"><button class="back-button" data-study-view="start">返回初学者入口</button><h1>${labNames[id]}</h1>${labTabs(id)}${body}<section class="guide-section"><h2>从图走到公式</h2>${explanation}</section>${originNote}</section>`;
}
function labHTML(id) {
  if(id==='formation')return commonLab(id,`<p class="guide-intro">先预测：如果每个点都追求“位置相同”，最后还会有队形吗？切换目标后，再拖动时间。</p><div class="lab-controls"><label for="formation-mode">控制目标<select id="formation-mode"><option value="formation">保留正方形队形</option><option value="consensus">所有位置一致</option></select></label></div>${playerHTML(40)}<div class="lab-surface"><div id="formation-scene"></div><div id="formation-values"></div></div><p id="lab-observation" class="lab-observation" role="status"></p><p class="small-copy">位置直接更新，固定无向环形通信，步长 0.2。没有速度、加速度、输入上限或避碰约束；这里不把移动点当作可执行机器人轨迹。</p>`,`${math(guideFormulas[1])}<p>保持队形时，对偏移后的 zᵢ 做一致性更新；位置一致时令所有 rᵢ=0。两种目标都保留初始质心，只有相对位置要求不同。</p>${exercise('想一想：末端队形正确，能说明途中没有碰撞吗？','不能。这个教学更新没有设置避碰约束。要讨论物理运动，必须另加动力学、执行条件与全过程安全要求。')}${link('formation-starter','继续看编队的定义')} · ${link('safe-set','看安全集合')}`);
  if(id==='communication')return commonLab(id,`<p class="guide-intro">四个 agent 用最近广播的状态计算。拖动阈值，比较“每步广播”和“变化足够大才广播”；把次数与误差一起看。</p><div class="lab-controls"><label for="comm-threshold">广播阈值 θ <output id="comm-threshold-value">2.0</output><input id="comm-threshold" type="range" min="0" max="5" step=".5" value="2"/></label></div>${playerHTML()}<div class="comparison-columns"><div><h2>每步广播</h2><div id="periodic-values"></div></div><div><h2>阈值广播</h2><div id="event-values"></div></div></div><div id="comm-chart" class="lab-surface"></div><p id="lab-observation" class="lab-observation" role="status"></p><p class="small-copy">固定四节点链，控制增益 0.15，同样初值与 60 次同步更新；双方都含初始 4 次节点广播，每个末次采样的发送也计入。这里统计节点广播次数，不是链路包数、字节、能耗或连续时间 MIET。</p>`,`${math(guideFormulas[2])}${math(guideFormulas[3])}<p>每轮先用已广播的 x̂ 计算控制，更新真实 x，再在新采样点检测并同时更新符合条件的消息。所有边无时延、无丢包；阈值固定。θ=0 时等同每步广播。</p><p>较少发送与较小误差是不同目标。固定正阈值不提供精确渐近一致的自动保证。Z08 采用模型估计、自适应变量和边触发 sleeping time，网页例子只用于认识信息保持，不是其复现。</p>${exercise('想一想：一个节点广播一次，等于网络只传了一个包吗？','取决于网络。广播介质、逐邻居单播和重传机制有不同成本；这里的计数只记录一次节点状态发布。')}${link('information','消息和真实状态的区别')} · ${link('trigger','看论文中的事件触发')} · ${link('fair-comparison','怎样报告比较')}`);
  if(id==='safety')return commonLab(id,`<p class="guide-intro">任务控制器希望靠近边界，安全条件限制允许的输入。改变余量与原动作，看过滤器何时介入；再试试互相冲突的硬约束。</p><div class="lab-controls safety-controls"><label for="safety-distance">安全余量 d <output id="safety-distance-value">0.20</output><input id="safety-distance" type="range" min="0" max="2" step=".05" value=".2"/></label><label for="safety-nominal">原动作 u_nom <output id="safety-nominal-value">−1.00</output><input id="safety-nominal" type="range" min="-1" max="1" step=".05" value="-1"/></label><label for="safety-kappa">κ <output id="safety-kappa-value">1.0</output><input id="safety-kappa" type="range" min=".2" max="2" step=".2" value="1"/></label><label class="checkbox-label"><input id="safety-conflict" type="checkbox"/>另加硬约束 u ≤ −0.4</label></div><div id="safety-scene" class="lab-surface"></div><p id="lab-observation" class="lab-observation" role="status"></p><p class="small-copy">一维连续理想积分器 ḋ=u，d≥0，输入范围 [−1,1]；这里只解析一个时刻的投影，不运行车辆或完整闭环。横轴是输入值，不是位置。</p>`,`${math(guideFormulas[4])}<p>因此允许的下界是 max(−1,−κd)，上界默认是 1；加额外硬约束后上界为 −0.4。在非空区间内，选择离原动作最近的点，就得到此一维二次目标的解析解。若区间为空，本页不输出可执行动作，也不把无解当作已经安全接管。</p>${exercise('想一想：κ 变大，是否一定更安全？','在 d>0 时，下界 −κd 变小，允许更负的 u，也就是更快接近边界。不能把“增益更大”直接读成“更安全”；采样与执行条件还需要另查。')}${link('cbf','CBF 原文依据')} · ${link('cbf-qp','QP 怎么写')} · ${link('slack','软约束放松了什么')}`);
  return commonLab('consensus',`<p class="guide-intro">四个数起初是 10、30、70、90。每个人只向邻居靠近一点。先看一轮变化，再断开图或增大步长，检验你的预测。</p><div class="lab-controls"><label for="consensus-topology">谁和谁通信<select id="consensus-topology"><option value="path">连通链 A—B—C—D</option><option value="ring">连通环 A—B—C—D—A</option><option value="split">断开：A—B 与 C—D</option></select></label><label for="consensus-gain">更新步长<select id="consensus-gain"><option value="0.2">0.2 · 这个例子中收敛</option><option value="0.6">0.6 · 对连通图过大</option></select></label></div>${playerHTML()}<div class="consensus-scene lab-surface"><div id="consensus-graph"></div><div id="consensus-values"></div></div><div id="consensus-chart" class="lab-surface"></div><p id="lab-observation" class="lab-observation" role="status"></p><p class="small-copy">固定无向图、对称单位权重、同步离散更新、无扰动、无输入上限。图里的点表示通信节点，曲线表示无量纲标量状态，不表示车辆位置。坐标纵轴随数据范围调整，完整数值在上方列出。</p>`,`${math(guideFormulas[0])}<p>ε=0.2 的第一步：A=14，B=34，C=66，D=86。每条边两端的增减相抵，因此平均值保留为 50。连通性让信息能跨越整张图；合适步长让分歧衰减。断开图只在各自小组内达成一致。</p>${exercise('先预测：整体平均还是 50，四个人就一定一致了吗？','不一定。断开图的两组可以分别趋向 20 和 80，而整体平均仍为 50。需要看每个状态或分歧指标。')}${link('consensus-starter','一步步读懂推导')} · ${link('laplacian','把邻居差写成矩阵')} · <a href="./examples/consensus_demo.py" download>下载 Python 代码</a>`);
}

const fieldSpecs=[
  ['task','研究对象与任务','例如：四个标量 agent，在固定链式图上缩小状态分歧。'],
  ['model','模型与可控制的动作','动力学、时间刻度、输入接口与限制；哪些是教学简化？'],
  ['information','决策时实际可用的信息','本地测量、邻居消息、时间戳；哪些只能离线评价？'],
  ['mechanism','准备检验的机制或假设','只改变哪一个环节，为什么它可能影响结果？'],
  ['baseline','同条件的比较对象','已有方法或简单规则；双方信息、参数与资源怎样对齐？'],
  ['metrics','观察什么好处、代价与失败','完整时域、每个体、最差个体；单位与完成条件是什么？'],
  ['evidence','当前依据与尚未验证的部分','论文 DOI／版本／页码、已读深度、还缺的检索或证明。'],
  ['stop','边界、预算与停止条件','案例范围、尝试次数；什么结果会否定当前解释或要求停止？'],
];
function researchHTML() {
  return `<section class="research-start"><button class="back-button" data-study-view="start">返回初学者入口</button><h1>从一个疑问，推进到一份证据</h1><p class="guide-intro">先写清这一轮要减少什么不确定性，再选择阅读、推导、反例或小规模验证。结束时留下材料和下一步判断。这里提供方法与教学练习，研究方向由你决定。</p>
  ${actionsHTML()}
  <section class="guide-section"><h2>按当前问题找做法</h2><div class="question-links">${link('research-loop','怎样开始一轮有效研究？')}${link('problem-contract','怎样把大方向缩成明确问题？')}${link('literature-gap','怎样核对最近邻与研究差距？')}${link('method-choice','怎样选择反馈、优化、触发或学习？')}${link('minimal-study','现在需要推导、反例还是小实验？')}${link('experiment-design','怎样设计能解释原因的比较？')}${link('failure-diagnosis','怎样定位失败而不盲目调参？')}${link('research-decision','什么时候继续、修改或停止？')}</div></section>
  <section class="guide-section"><h2>先交付一份能核对的小结果</h2><p>下载只依赖 Python 标准库的教学脚本。先核对两步运动、同步更新、反馈限制与一个区间反例，再选择一个案例输出完整记录。无需安装控制工具箱。</p><p><a href="./examples/research_starter.py" download>下载基础与研究练习脚本 .py</a></p><pre><code>python research_starter.py --check
python research_starter.py --case motion
python research_starter.py --case feedback
python research_starter.py --case consensus
python research_starter.py --case invariant</code></pre><p>需要保留记录时，可在命令末尾加 <code>&gt; teaching-log.jsonl</code>，请自行选择新文件名避免覆盖。完成标准：能解释第一步，核对原状态与实际输入，并写一句当前例子不能推出什么。脚本是解析教学练习，不读取私人数据，不是论文复现。</p></section>
  <section class="guide-section"><h2>可以平行探索的几个入口</h2><div class="table-scroll"><table class="study-table"><caption>问题入口与第一份可检查的材料；不表示新颖性或优先级</caption><thead><tr><th>入口</th><th>先问什么</th><th>先留下什么</th></tr></thead><tbody><tr><th>协作与任务</th><td>共同目标怎样分到各 agent？谁承担成本？</td><td>任务、动作权限和个体成本定义</td></tr><tr><th>信息与通信</th><td>消息何时变旧，补发何时值得？</td><td>信息时间线与同条件通信／误差比较</td></tr><tr><th>约束与安全</th><td>输入受限时，可行选择何时消失？</td><td>约束、可行域、无解及备份处理</td></tr><tr><th>模型与学习</th><td>哪个决策需要数据适应，简单规则差在哪里？</td><td>可执行决策、强基线与未解决状态</td></tr></tbody></table></div></section>
  <section class="guide-section"><h2>填写我的第一张问题卡</h2><p>内容只留在当前页面内存中，不提交服务器，也不自动保存。刷新会清空；可下载为 Markdown 自己保管。不要把私人数据或未公开材料贴进公开 Issue。</p><div class="workbook-actions"><button id="workbook-example" class="secondary-button">填入通信练习示例</button><button id="workbook-clear" class="ref-link">清空问题卡</button></div><form id="research-workbook" class="workbook-fields">${fieldSpecs.map(([id,label,placeholder])=>`<label for="draft-${id}">${label}<textarea id="draft-${id}" data-draft-field="${id}" rows="3" maxlength="2000" placeholder="${placeholder}"></textarea></label>`).join('')}</form><p id="workbook-status" role="status">0 / 8 项已填写。这是问题草稿，不是创新性或研究资格评分。</p><details class="draft-preview"><summary>预览将下载的文字</summary><pre id="workbook-preview"></pre></details><div class="workbook-actions"><button id="workbook-download" class="primary-button">下载我的问题卡 .md</button><button id="workbook-copy" class="secondary-button">复制问题卡</button></div><p class="small-copy">练习示例仅使用本页四 agent 简化模型，展示如何描述问题，不提供新的科研结果。自行下载的文件保存在你选择的位置。</p></section>
  <section class="guide-section"><h2>下一篇论文，用这五问来读</h2><p>谁的什么误差？在什么模型与信息条件下？方法新增了什么可执行机制？与谁比较？哪些结果会让解释站不住？</p>${link('fair-comparison','查看比较与消融细节')} · ${link('control-learning','判断学习承担什么职责')} · ${link('stability-language','准确描述你观察到的性质')}</section></section>`;
}

export function beginnerHTML(view,lab='consensus') {
  return view==='research'?researchHTML():view==='lab'?labHTML(lab):startHTML();
}

function plot(series,{labels=names,steps=60,nonnegative=false,caption='四个节点的状态 xᵢ（无量纲）随更新步变化'}={}) {
  const flat=series.flat(),min=nonnegative?0:Math.min(...flat),max=Math.max(...flat),pad=Math.max((max-min)*.08,1);
  const lo=nonnegative?0:min-pad,hi=max+pad;
  const x=k=>90+k/steps*460,y=v=>176-(v-lo)/(hi-lo)*145;
  const axis=v=>Math.abs(v)>=1e4?Number(v).toExponential(0):fmt(v,1);
  return `<figure class="teaching-plot"><figcaption>${esc(caption)}</figcaption><svg class="history-plot" viewBox="0 0 600 220" role="img" aria-label="${caption}"><path d="M90 25V176H550" class="plot-axis"/><text x="7" y="36">${axis(hi)}</text><text x="7" y="178">${axis(lo)}</text><text x="88" y="197">0</text><text x="510" y="197">${steps} 步</text>${series.map((s,i)=>`<polyline points="${s.map((v,k)=>`${x(k)},${y(v)}`).join(' ')}" fill="none" stroke="${colors[i]}" stroke-width="2.4"/><text x="${90+i*125}" y="216" fill="${colors[i]}">${esc(labels[i])}</text>`).join('')}</svg></figure>`;
}
function valuesHTML(x) {
  return `<table class="state-values"><caption>各节点当前的标量状态</caption><tbody>${x.map((v,i)=>`<tr><th scope="row" style="color:${colors[i]}">${names[i]}</th><td>${fmt(v)}</td></tr>`).join('')}</tbody></table><p class="small-copy">平均 ${fmt(mean(x))} · 跨度 ${fmt(spread(x))}<br>均方根分歧 ${fmt(disagreement(x))}</p>`;
}
function renderMath(root) {
  root.querySelectorAll('[data-math]').forEach(el=>window.katex?.render(el.dataset.math,el,{displayMode:true,throwOnError:false,trust:false}));
}

export function mountBeginner(root,view,lab) {
  renderMath(root);
  if(view==='research'){const stopWorkbook=mountWorkbook(root),stopActions=mountActions(root);return ()=>{stopWorkbook();stopActions();};}
  if(view!=='lab')return ()=>{};
  let k=0,timer=null,history,periodic,event;
  const $=s=>root.querySelector(s);
  const stop=()=>{clearInterval(timer);timer=null;if($('#lab-play'))$('#lab-play').textContent='播放';};
  const readNumber=id=>Number($(id).value);
  function recompute() {
    stop();k=0;
    if(lab==='consensus')history=consensusHistory({topology:$('#consensus-topology').value,gain:readNumber('#consensus-gain')});
    if(lab==='formation')history=formationHistory({formation:$('#formation-mode').value==='formation'});
    if(lab==='communication') {
      periodic=communicationHistory({periodic:true});event=communicationHistory({threshold:readNumber('#comm-threshold')});
      $('#comm-threshold-value').textContent=fmt(readNumber('#comm-threshold'),1);
    }
    draw();
  }
  function draw() {
    if(lab==='consensus') {
      const x=history[k],topology=$('#consensus-topology').value,gain=readNumber('#consensus-gain');
      $('#consensus-graph').innerHTML=graphSVG(topology);
      $('#consensus-values').innerHTML=valuesHTML(x);
      $('#consensus-chart').innerHTML=plot(names.map((_,i)=>history.slice(0,k+1).map(x=>x[i])));
      $('#lab-observation').textContent=topology==='split'?`第 ${k} 步：图断成两组。A、B 的长期目标为 20；C、D 为 80；整体平均仍为 50。` : gain>.5?`第 ${k} 步：这个连通图上的 0.6 步长会放大某些分歧方向。观察跨度 ${fmt(spread(x))}，不能只看平均。`:`第 ${k} 步：平均保留在 ${fmt(mean(x))}；当前跨度 ${fmt(spread(x))}。继续更新，四个状态逐渐接近 50。`;
    }
    if(lab==='formation') {
      const positions=history[k],forming=$('#formation-mode').value==='formation';
      $('#formation-scene').innerHTML=`<svg class="formation-scene" viewBox="0 0 440 330" role="img" aria-label="四个点当前的二维位置；${forming?'目标为平移后的正方形':'目标为同一位置'}"><path d="M25 172.5H410M220 20V310" class="plot-axis"/><text x="390" y="193">pₓ</text><text x="230" y="28">pᵧ</text>${(forming?[[-1,-.5],[1,-.5],[1,1.5],[-1,1.5]]:[[0,.5]]).map(([x,y])=>`<circle cx="${220+x*43}" cy="${172.5-y*43}" r="13" class="formation-target"/>`).join('')}${positions.map(([x,y],i)=>`<circle cx="${220+x*43}" cy="${172.5-y*43}" r="9" fill="${colors[i]}" stroke="white"/><text x="${234+x*43}" y="${177-y*43}" fill="${colors[i]}">${names[i]}</text>`).join('')}<text x="25" y="320">虚线圆：渐近目标位置。坐标单位为教学单位。</text></svg>`;
      $('#formation-values').innerHTML=`<table class="state-values"><caption>当前坐标（pₓ, pᵧ）</caption><tbody>${positions.map((p,i)=>`<tr><th scope="row">${names[i]}</th><td>(${fmt(p[0])}, ${fmt(p[1])})</td></tr>`).join('')}</tbody></table>`;
      $('#lab-observation').textContent=forming?`第 ${k} 步：各点保留自己的队形偏移，逐渐形成以 (0, 0.5) 为中心的正方形。`:`第 ${k} 步：所有点逐渐重合于 (0, 0.5)。这满足位置一致，却没有留下队形间距。`;
    }
    if(lab==='communication') {
      const p=periodic[k],e=event[k];
      const panel=s=>`<p class="comparison-result"><strong>${s.broadcasts}</strong> 次节点广播<br>均方根分歧 <strong>${fmt(s.error)}</strong></p><p class="small-copy">状态：[${s.x.map(x=>fmt(x,1)).join(', ')}]<br>已发布：[${s.held.map(x=>fmt(x,1)).join(', ')}]</p>`;
      $('#periodic-values').innerHTML=panel(p);$('#event-values').innerHTML=panel(e);
      $('#comm-chart').innerHTML=plot([periodic.slice(0,k+1).map(s=>s.error),event.slice(0,k+1).map(s=>s.error)],{labels:['每步广播','阈值广播'],nonnegative:true,caption:'均方根分歧 E（无量纲）随更新步变化；两种广播机制同条件比较'});
      $('#lab-observation').textContent=`第 ${k} 步：阈值 ${fmt(readNumber('#comm-threshold'),1)}；本步发布节点 ${e.fired.length?e.fired.map(i=>names[i]).join('、'):'无'}。两种机制分别发布 ${p.broadcasts} 与 ${e.broadcasts} 次；请同时比较上方误差。`;
    }
    if(lab==='safety') {
      const args={distance:readNumber('#safety-distance'),nominal:readNumber('#safety-nominal'),kappa:readNumber('#safety-kappa'),conflict:$('#safety-conflict').checked},p=safetyProjection(args),sx=u=>300+u*220;
      for(const key of ['distance','nominal','kappa'])$('#safety-'+key+'-value').textContent=fmt(args[key],key==='kappa'?1:2);
      $('#safety-scene').innerHTML=`<svg class="safety-interval" viewBox="0 0 600 180" role="img" aria-label="允许输入区间${p.feasible?'非空':'为空'}"><line x1="80" y1="85" x2="520" y2="85" class="plot-axis"/>${p.feasible?`<line x1="${sx(p.lower)}" y1="85" x2="${sx(p.upper)}" y2="85" stroke="#326a59" stroke-width="10"/><circle cx="${sx(p.action)}" cy="85" r="8" fill="#265b87"/>`:''}<path d="M${sx(args.nominal)} 51V110" stroke="#9c4c2d" stroke-width="2" stroke-dasharray="4 3"/><text x="70" y="139">−1</text><text x="295" y="139">0</text><text x="515" y="139">1</text><text x="80" y="27">棕色虚线：原动作 · 绿色线：允许区间 · 蓝点：过滤后动作</text><text x="80" y="168">区间下界 ${fmt(p.lower)}，上界 ${fmt(p.upper)}${p.feasible?'':'：没有交集'}</text></svg>`;
      $('#lab-observation').textContent=p.feasible?`允许输入为 [${fmt(p.lower)}, ${fmt(p.upper)}]。原动作 ${fmt(args.nominal)} → 实际选择 ${fmt(p.action)}${Math.abs(p.action-args.nominal)<1e-8?'，本次无需修改。':'，选择离原动作最近的可行点。'}`:`无解：CBF 要求 u ≥ ${fmt(p.lower)}，另一硬约束要求 u ≤ ${fmt(p.upper)}。本页不输出动作；修改任务、约束或设计备份策略需要重新论证。`;
      $('#lab-observation').classList.toggle('infeasible',!p.feasible);
      return;
    }
    $('#lab-time').value=k;$('#lab-time-value').textContent=`${k} / ${lab==='formation'?40:60}`;
    $('#lab-step').disabled=k>=(lab==='formation'?40:60);
  }
  if(lab==='safety') {
    for(const input of root.querySelectorAll('.safety-controls input'))input.addEventListener('input',draw);
    draw();return stop;
  }
  for(const input of root.querySelectorAll('.lab-controls select,.lab-controls input'))input.addEventListener('input',recompute);
  $('#lab-time').addEventListener('input',()=>{stop();k=readNumber('#lab-time');draw();});
  $('#lab-step').addEventListener('click',()=>{stop();k=Math.min(k+1,lab==='formation'?40:60);draw();});
  $('#lab-reset').addEventListener('click',()=>{stop();k=0;draw();});
  $('#lab-play').addEventListener('click',()=>{
    if(timer){stop();return;}
    const max=lab==='formation'?40:60;if(k>=max)k=0;
    $('#lab-play').textContent='暂停';
    timer=setInterval(()=>{k++;draw();if(k>=max)stop();},300);
  });
  recompute();return stop;
}

let workbookDraft={};
function mountWorkbook(root) {
  const fields=Object.fromEntries(fieldSpecs.map(([id])=>[id,root.querySelector('#draft-'+id)]));
  for(const id in fields)fields[id].value=workbookDraft[id]||'';
  const status=root.querySelector('#workbook-status');
  const markdown=()=>`# 我的第一张多智能体研究问题卡\n\n状态：学习／研究草稿，未完成新颖性核验。\n\n${fieldSpecs.map(([id,title])=>`## ${title}\n\n${fields[id].value.trim()||'待填写'}\n`).join('\n')}\n填写日期：${new Date().toLocaleDateString('sv-SE')}\n`;
  function update() {
    workbookDraft=Object.fromEntries(Object.entries(fields).map(([id,field])=>[id,field.value]));
    root.querySelector('#workbook-preview').textContent=markdown();
    status.textContent=`${Object.values(fields).filter(f=>f.value.trim()).length} / 8 项已填写。这是问题草稿，不是创新性或研究资格评分。`;
  }
  root.querySelector('#research-workbook').addEventListener('submit',e=>e.preventDefault());
  for(const field of Object.values(fields))field.addEventListener('input',update);
  root.querySelector('#workbook-example').addEventListener('click',()=>{
    const example={task:'教学练习：四个标量 agent 在固定无向链上缩小状态分歧。',model:'x(k+1)=x(k)+u(k)；初值 [10,30,70,90]，增益 0.15，无扰动或输入上限。',information:'本地当前状态用于触发检测；控制仅用各节点最近发布的状态。同轮消息同时更新，无时延、无丢包。',mechanism:'观察固定阈值发布能减少多少广播，以及有限 60 步内会留下多少分歧。不是新颖性主张。',baseline:'每步广播；保持相同图、初值、控制增益、更新时域和广播计数口径。',metrics:'节点广播次数（初始 4 次也计入），每步均方根分歧、跨度与每个节点状态。次数不是字节或能耗。',evidence:'自编基础离散教学模型；Z08 DOI 10.1109/TAC.2022.3223973 的文件第 2–3 页仅作信息／通信概念背景，不称论文复现。',stop:'仅比较网页给定阈值和 60 步。没有精确渐近一致性或车辆安全结论；如比较条件不同先停止解释并检查。'};
    for(const id in fields)fields[id].value=example[id];update();
    status.textContent='已填入教学示例；它展示写法，不代表已完成研究或发现创新点。';
  });
  root.querySelector('#workbook-clear').addEventListener('click',()=>{for(const field of Object.values(fields))field.value='';update();});
  root.querySelector('#workbook-download').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([markdown()],{type:'text/markdown;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='my-first-mas-question.md';anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='已生成问题卡下载。请按浏览器提示保存；网页没有上传此草稿。';
  });
  root.querySelector('#workbook-copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(markdown());status.textContent='问题卡已复制到剪贴板。';}catch{status.textContent='当前浏览器不允许复制，可下载或从文字预览中手动复制。';}
  });
  update();return ()=>{};
}
