// Chinese teaching copy is explicitly requested; source notation is retained in each reference.
import { additionalBlocks } from './terms-expanded.js';
import { beginnerBlocks } from './beginner-content.js';
export const groups = [
  { id: 'all', name: '全部区块', description: '从一个问题进入，沿着联系继续。' },
  { id: 'starter', name: '入门与研究', description: '从具体例子认识多智能体，再把想法写成可检查的问题。' },
  { id: 'terms', name: '专业术语', description: '先读懂缩写和公式中的角色，再回到方法与论文。' },
  { id: 'model', name: '模型与预测', description: '先弄清系统如何变化，再讨论怎样决策。' },
  { id: 'safety', name: '约束与安全', description: '从当前没有违规，走向未来仍有可行选择。' },
  { id: 'network', name: '协作与通信', description: '局部信息如何支撑多个智能体的共同变化。' },
  { id: 'learning', name: '学习与决策', description: '看清学习的对象、动作和优化目标。' },
];

const ref = (paper, page, label) => ({ paper, page, label });
export const blocks = [
  {
    id: 'model', group: 'model', title: '模型里的状态和输入，究竟是什么？', term: 'State · Input · Dynamics',
    intro: '同一个字母 u，可能指直接施加的加速度，也可能指还要经过执行器的命令。先看接口，再看算法。',
    tags: ['状态空间', '动力学', '执行器', 'state', 'input'], related: ['mpc', 'safe-set', 'rl-state'],
    refs: [ref('R01', 3, '§2.1.1 / Eq. (1)'), ref('V01', 4, '§III-C / Eq. (1)')],
    sections: [
      { title: '从直觉进入', kind: '教学解释', html: '<p>状态是模型用来描述“系统现在怎样”的变量；输入是控制器可以选择的量。预测模型回答：给定当前状态、输入和允许的扰动，下一步会在哪里？这些定义取决于建模选择。</p>' },
      { title: '两篇论文怎样写', kind: '原文依据', html: String.raw`<p>R01 用统一的离散模型描述控制输入和不确定性：</p><div class="math" data-math="x_{k+1}=f(x_k,u_k,d_k)"></div><p>V01 沿预先给定的行驶路径建模，取 <span class="math-inline" data-math="x_k=[\Delta s_k,\Delta v_k,s_k^1,v_k^1]^\top"></span>，并明确将 <span class="math-inline" data-math="u_k"></span> 定义为自车加速度。目标车恒速与理想横向路径跟踪是这个模型的假设。</p>` },
      { title: '读公式时检查这四件事', kind: '教学重组', html: '<ul><li>每个状态量的单位是什么？</li><li>输入是直接作用量，还是发送给另一个模块的命令？</li><li>采样间隔是多少？离散模型如何得到？</li><li>哪些行为被当成扰动，哪些被假定已知？</li></ul><p>如果另一个实现有执行器滞后、命令队列或低层控制器，就需要重新说明从命令到实际输入的映射。</p>' },
      { title: '前置知识：差分方程', kind: '基础补充', optional: true, html: '<p>下标 k 表示采样序号。x<sub>k+1</sub> 是下一次采样的状态；它不表示系统只在采样时刻才运动。采样点之间是否满足约束，仍需要额外分析。</p>' },
    ],
  },
  {
    id: 'mpc', group: 'model', title: '既然规划了一串动作，为什么只执行第一个？', term: 'Model Predictive Control',
    intro: 'MPC 把预测和反馈连接起来：规划一段未来，只执行当前动作，得到新测量后再规划。',
    tags: ['MPC', '滚动优化', '预测时域', 'receding horizon'], related: ['horizon', 'terminal', 'model', 'recursive', 'data-driven'],
    refs: [ref('R02', 4, '§2.2 / Algorithm 1'), ref('V01', 4, '§IV-A / Eq. (4)')],
    sections: [
      { title: '一轮 MPC 在做什么', kind: '原文依据', html: '<p>R02 的 Algorithm 1 给出三个步骤：根据当前测量求解有限时域优化；应用最优输入序列的第一个分量；到下一时刻重新求解。预测轨迹从最新状态出发，因此每轮都能利用新信息。</p>' },
      { title: '把“想要”和“必须”分开', kind: '教学解释', html: '<p>目标函数表达想改善的性能；约束表达允许的状态和输入。V01 的目标同时考虑期望速度、输入变化与加速度大小，但它另外设置输入、速度与安全距离约束。给一个指标加权，并不等于强制满足它。</p>' },
      { title: '公式里有两条时间轴', kind: '公式释义', optional: true, html: String.raw`<div class="math" data-math="x_{k+j\mid k},\quad u_{k+j\mid k}"></div><p>右侧的 k 表示“在哪个时刻做预测”；左侧的 k+j 表示“预测哪一时刻”。下一轮预测会改变，即使它预测的是同一物理时刻。R02 使用带横线的轨迹记号和时域 L；V01 使用这个双下标和时域 N。这里的对应是教学映射，不把两篇的模型与约束视为相同。</p>` },
      { title: '为什么还需要别的设计', kind: '适用边界', html: '<p>R02 明确说明：直接滚动求解基本优化问题，闭环不一定稳定。稳定性与约束满足要依赖进一步条件，例如合适的时域或终端设计。求出一次最优解，不能单独说明以后每轮都有解。</p>' },
    ],
  },
  {
    id: 'safe-set', group: 'safety', title: '现在没有碰撞，就已经安全吗？', term: 'Safe Set vs. Constraint Set',
    intro: '一个状态此刻没有违规，却可能已经来不及避免未来的违规。安全集合要考虑后续还能做什么。',
    tags: ['安全集合', '约束集合', '刹车', 'safe set', 'collision'], related: ['invariance', 'filter', 'model'],
    refs: [ref('R01', 4, '§2.2 / Failure conditions'), ref('R01', 5, 'Safe Set Versus Constraint Set')],
    sections: [
      { title: '先区分两个集合', kind: '原文依据', html: String.raw`<p>R01 用 <span class="math-inline" data-math="\mathcal F"></span> 表示失败状态，补集 <span class="math-inline" data-math="\mathcal F^c"></span> 表示当前满足状态约束的集合。安全集合还需要保证能够持续避免进入失败集合。论文举例：无人机尚未撞上障碍，但若飞得过快、已无法避开，也可能处于不安全状态。</p>` },
      { title: '用停车距离看一眼', kind: '教学示例', demo: 'braking', html: '<p>下面仅用一个理想例子理解区别：质点朝固定墙运动，可立即施加恒定最大制动 b = 4 m/s²，不考虑时延、车身长度、坡度与不确定性。把“停车点不越过墙”作为示例判据；它不是车辆安全认证。</p>' },
      { title: '示例公式从哪里来', kind: '教学推导', optional: true, html: String.raw`<p>恒定加速度关系为 <span class="math-inline" data-math="v_f^2=v^2+2a\Delta s"></span>。令末速度为 0、制动加速度为 −b，就得到：</p><div class="math" data-math="d_{\mathrm{stop}}=\frac{v^2}{2b}"></div><p>这只是本网页的基础力学示例，并非 R01 给出的车辆模型。若边界接触也视为碰撞，就需要严格余量，而不能把等号当作安全。</p>` },
      { title: '读到“安全”时追问', kind: '教学重组', html: '<p>它指当前几何上不碰撞、有限时域不违规，还是在声明的假设下始终能避免失败？同一个词可能对应不同的数学对象。</p>' },
    ],
  },
  {
    id: 'invariance', group: 'safety', title: '“留在集合里”为什么能说明未来？', term: 'Controlled Invariance',
    intro: '关键不是只检查下一步，而是对集合内每个状态，都保留一个能继续留在集合内的合法动作。',
    tags: ['控制不变性', '终端集合', 'invariant', '鲁棒'], related: ['safe-set', 'recursive', 'filter'],
    refs: [ref('R01', 4, '§2.2.2 / Eq. (4)'), ref('V01', 5, 'Definition 4.1')],
    sections: [
      { title: '定义里藏着两个量词', kind: '教学解释', html: String.raw`<div class="math" data-math="\forall x\in X_T,\ \exists u\in\mathcal U:\ f(x,u,0)\in X_T"></div><p>先是“每一个状态”，再是“存在一个允许的输入”。输入可以随状态改变；定义并不要求用同一个固定输入控制所有状态。这是对 R01 与 V01 定义的统一教学写法。</p>` },
      { title: '为什么可以反复使用', kind: '教学推导', html: '<p>如果起点在集合中，定义给出一个合法动作，使下一状态仍在集合中。下一状态又满足相同的起点条件，于是可以再找一个动作。这个逻辑能重复，前提是模型、输入限制和每一步的条件持续成立。</p>' },
      { title: '加入不确定性后，条件更强', kind: '原文依据', optional: true, html: String.raw`<p>R01 的鲁棒控制不变集合要求存在一个策略，覆盖声明扰动集合内的所有扰动。教学上可写为：</p><div class="math" data-math="\forall x\in\Omega,\ \exists u\in\mathcal U,\ \forall d\in\mathcal D:\ f(x,u,d)\in\Omega"></div><p>这里动作不能在知道当步尚未观测的扰动后再选择。若信息结构不同，量词与策略定义也应重写。</p>` },
      { title: '它与安全集合的关系', kind: '适用边界', html: '<p>一个控制不变集合只有在不含失败状态时，才可用于相应的安全要求。找到一个这样的集合，也不代表找到了最大的安全集合，更不代表任务一定能完成。</p>' },
    ],
  },
  {
    id: 'recursive', group: 'safety', title: '这一步有解，怎样让下一步仍有解？', term: 'Recursive Feasibility',
    intro: '终端集合提供一种“接得下去”的结构，把有限长度的计划与后续合法动作联系起来。',
    tags: ['递归可行性', '终端约束', 'MPC', 'feasibility'], related: ['terminal', 'backup', 'mpc', 'invariance', 'model'],
    refs: [ref('V01', 5, '§IV-C / Definition 4.1'), ref('V01', 6, 'Theorem 4.1 / Eq. (8)'), ref('R02', 4, '§2.2 / Terminal ingredients')],
    sections: [
      { title: '先明确要证明什么', kind: '原文依据', html: '<p>V01 将递归可行性解释为：当前时刻的 MPC 优化问题可行，则下一时刻也可行。论文通过终端集合构造处理这个问题，后方合流集合的控制不变性由 Theorem 4.1 给出。</p>' },
      { title: '常见证明思路：移位，再补一个动作', kind: '教学重组', html: String.raw`<p>在精确预测、固定约束、标准时不变 MPC 等条件下，设当前有一个可行序列：</p><div class="math" data-math="u_{0\mid k},u_{1\mid k},\ldots,u_{N-1\mid k}"></div><p>执行第一个动作后，把剩下的序列往前移，并在末尾追加终端集合内的控制动作，就能构造下一轮的候选序列。若所有约束仍成立，这个候选说明下一轮至少有一个可行解；它无须是最优解。</p><p>这是常见的教学证明骨架，不是对 V01 完整证明的替代或独立核验。</p>` },
      { title: '回到这篇合流论文', kind: '原文依据', optional: true, html: String.raw`<div class="math" data-math="x_{N\mid k}\in X_T=\Omega_1\cup\Omega_2"></div><p>V01 的终端集合区分在目标车前方或后方合流。后方集合有采样时间、制动能力等条件；前方合流后的距离维持依赖目标车行为假设。论文也明确说明，这不是最大控制不变集合。</p>` },
      { title: '可行性不会自动给出什么', kind: '适用边界', html: '<p>递归可行性依赖声明的模型、初始可行域、约束和执行条件。它本身不等于最优性能、有限时间完成，或包含执行器滞后、感知误差和实际横向运动后的保证。</p>' },
    ],
  },
  {
    id: 'filter', group: 'safety', title: '性能控制器提出动作，谁来把关？', term: 'Safety Filter',
    intro: '把“我想做什么”与“这个动作是否允许”拆开，是理解安全过滤器的一条入口。',
    tags: ['安全过滤器', '名义控制器', 'RL', 'shield', 'filter', 'CBF'], related: ['cbf', 'cbf-qp', 'backup', 'safe-set', 'invariance', 'reward'],
    refs: [ref('R01', 7, '§2.3 / Proposition 1')],
    sections: [
      { title: '一条动作经过两个角色', kind: '原文依据', html: '<p>R01 将安全过滤器描述为运行时监测过程：在必要时修改系统原本打算采用的动作，以避免潜在的灾难性失败。提出动作的控制器与检查动作的机制可以承担不同职责。</p><div class="flow"><span>性能控制器<br><small>提出动作</small></span><b>→</b><span>安全过滤器<br><small>检查或修改</small></span><b>→</b><span>系统<br><small>执行动作</small></span></div>' },
      { title: '看清输入输出', kind: '公式释义', html: String.raw`<div class="math" data-math="u_k=\phi\bigl(x_k,\pi_{\mathrm{task}}(x_k)\bigr)"></div><p>这是 R01 Eq. (8b) 的结构：任务策略提出动作，过滤映射结合当前状态给出实际控制输入。具体怎样判断和修改，取决于所用安全过滤方案。一个常见入口是<button class="term-link" data-block="cbf">CBF（控制障碍函数）</button>及其<button class="term-link" data-block="cbf-qp">CBF-QP</button>实现。</p>` },
      { title: '理想结果和可实现方案有距离', kind: '适用边界', html: '<p>R01 的“完美过滤器”命题基于最大安全集合及相应可用安全动作。论文紧接着指出，对多数实际机器人难以直接高效获得这样的最小干预过滤器。不能把这个理想命题直接套到任意近似实现上。</p>' },
    ],
  },
  {
    id: 'data-driven', group: 'model', title: '没有显式辨识模型，也能预测轨迹吗？', term: 'Data-Driven MPC · Fundamental Lemma',
    intro: '在特定条件下，历史输入输出轨迹的线性组合，可以表示系统的有限长度轨迹。条件是理解它的核心。',
    tags: ['数据驱动', 'Hankel', '持续激励', 'PE', 'DeePC'], related: ['hankel', 'pe', 'model', 'mpc', 'rl-state'],
    refs: [ref('R02', 3, '§2.1 / Definition 1 / Theorem 1'), ref('R02', 4, '§2.2')],
    sections: [
      { title: '从数据表示轨迹', kind: '原文依据', html: String.raw`<p>R02 的预备知识讨论未知的离散 LTI 系统，假设可控、可观，并有一条输入输出数据轨迹。在所述持续激励条件下，长度 L 的轨迹可以通过 Hankel 数据矩阵参数化：</p><div class="math" data-math="\begin{bmatrix}H_L(u^d)\\H_L(y^d)\end{bmatrix}\alpha=\begin{bmatrix}\bar u\\\bar y\end{bmatrix}"></div><p>这里的系数 α 用于组合数据列；它不是强化学习的动作策略。</p>` },
      { title: '持续激励意味着什么', kind: '基础补充', optional: true, html: String.raw`<p>R02 定义输入序列在阶数 L 持续激励（PE），要求其 Hankel 矩阵满行秩：</p><div class="math" data-math="\operatorname{rank}H_L(u)=mL"></div><p>基本引理要求历史输入在阶数 L+n 持续激励，n 是状态维数。直觉上，数据必须包含足够丰富的变化；单纯增加重复数据的数量，不能代替秩条件。</p>` },
      { title: '它与 MPC 怎样连接', kind: '教学解释', html: '<p>MPC 需要表达“哪些预测轨迹是系统能够产生的”。显式模型是一种表达方式；满足条件的数据轨迹表示是另一种。预测表示替换以后，闭环稳定、噪声处理和约束满足仍需要各自的设计与分析。</p>' },
      { title: '先别把结论扩展到所有数据', kind: '适用边界', html: '<p>这里展示的是综述中无噪声 LTI 预备结果。不能直接当作任意噪声、任意非线性系统或任意有限数据下的保证。本版尚未展开综述后续的鲁棒与非线性构造。</p>' },
    ],
  },
  {
    id: 'graph', group: 'network', title: '通信图怎样进入多智能体控制？', term: 'Graph · Relative State · Consensus',
    intro: '谁能从谁那里获得信息，会改变每个智能体可用的控制量，也会进入证明条件。',
    tags: ['图论', 'Laplacian', '一致性', 'consensus', 'relative state'], related: ['laplacian', 'trigger', 'model', 'invariance'],
    refs: [ref('Z08', 2, '§II-A / §II-B / Eq. (2)')],
    sections: [
      { title: '图中的点和边代表什么', kind: '原文依据', html: '<p>Z08 用节点表示智能体，用有向的边记号表示信息接收关系；研究的问题采用无向连通通信图。每个智能体采用相同形式的线性时不变动力学，控制目标是状态差渐近趋于零。</p>' },
      { title: '相对状态是一个自然接口', kind: '公式释义', html: String.raw`<div class="math" data-math="z_{ij}(t)=x_i(t)-x_j(t)"></div><p>这对应 Z08 Eq. (2)。同步要求所有相连智能体的状态差最终趋于零。这里的“趋于零”是渐近性质，不表示有限时刻后必然完全相同，也不直接表示车辆不碰撞。</p>` },
      { title: '同名矩阵也要核对约定', kind: '原文依据', optional: true, html: String.raw`<p>Z08 将一条双向连接记作两条方向相反的边，因此使用：</p><div class="math" data-math="L=\tfrac12 DD^\top"></div><p>论文特别解释了它与每条无向边只记一次时 <span class="math-inline" data-math="L=DD^\top"></span> 的差别。跨论文合并符号前，先看边的计数和关联矩阵 D 的定义。</p>` },
      { title: '同步之外的要求要单独写', kind: '教学解释', html: '<p>如果任务是车辆编队，还需要说明间距、车辆尺寸、输入限制和任务参考。一个状态同步结论不会自动变成这些物理要求的证明。</p>' },
    ],
  },
  {
    id: 'trigger', group: 'network', title: '不一直通信，中间靠什么控制？', term: 'Event-Triggered Communication',
    intro: '通信事件之间仍需要本地状态和估计器运行。减少通信不等于停止计算。',
    tags: ['事件触发', 'event-triggered', '估计器', 'MIET', 'Zeno'], related: ['miet', 'graph', 'model', 'reward'],
    refs: [ref('Z08', 2, '§III-A / Eq. (3)'), ref('Z08', 3, 'Eq. (11) / Remarks 2–3'), ref('Z08', 1, 'Abstract / Stated result')],
    sections: [
      { title: '事件到来时校正，中间用模型推演', kind: '原文依据', html: String.raw`<p>Z08 只在边事件时刻采样相对状态。事件之间，双方各自运行相对状态估计器：</p><div class="math" data-math="\dot{\hat z}_{ij}=A\hat z_{ij},\qquad \hat z_{ij}(t_k^{ij})=z_{ij}(t_k^{ij})"></div><p>控制器使用这些估计量及自适应变量。这里的估计传播并没有声称包含相邻智能体所有实时控制输入。</p>` },
      { title: '什么时候再交换信息', kind: '原文依据', html: '<p>论文的边触发机制结合本地检测条件与 sleeping time。触发可由边两端的任一方发起；通信发生后重置相关变量。Remark 2 说明检测无需持续共享信息，Remark 3 明确指出这是以本地计算换取通信。</p>' },
      { title: '正的事件间隔在解决什么', kind: '教学解释', optional: true, html: '<p>如果事件在有限时间内无限密集，理论控制器将难以实现。论文声明获得严格正的最小事件间隔（MIET）。本版仅解释其作用与机制，未独立核验完整的 MIET 证明，也不把它扩展为硬件实时保证。</p>' },
      { title: '使用前保留这些边界', kind: '适用边界', html: '<p>此处对应无向连通图、线性时不变智能体及文中设计条件。不能仅凭“分布式”“事件触发”的名称，就推断它覆盖时延、丢包、输入饱和或车辆碰撞安全。</p>' },
    ],
  },
  {
    id: 'rl-state', group: 'learning', title: '这篇强化学习论文，究竟让智能体决定什么？', term: 'State · Action · Reward',
    intro: '先列出状态、动作和奖励，再判断它是在选队形、调参数，还是直接控制车辆。',
    tags: ['强化学习', 'MDP', 'DQN', 'SOC', '队列重排'], related: ['model', 'reward', 'mpc'],
    refs: [ref('Z11', 2, '§II / §III-A / Eqs. (2)–(4)'), ref('Z11', 3, 'Algorithm A1')],
    sections: [
      { title: '以车辆重排论文为例', kind: '原文依据', html: '<p>Z11 在预先给定的重排地点选择车辆顺序。状态包括各车电池荷电状态（SOC）和剩余重排地点数量；动作是车辆排列；目标是减小终点 SOC 的标准差。最后一次重排使用文中引用的 SOC 排序规则。</p>' },
      { title: '把三个对象放在一起', kind: '公式释义', html: String.raw`<div class="math" data-math="S(t_j)=[s_1(t_j),\ldots,s_N(t_j),l]"></div><p>此处大写 S 表示强化学习状态，小写 s 表示 SOC；它与 V01 中表示路径位置的 s 不是同一个物理量。动作 a 选择排列，奖励在终点反映 SOC 分散程度；终点之前的奖励按文中定义为零。</p>` },
      { title: '排列决策与执行轨迹分开看', kind: '教学解释', html: '<p>“选择下一段采用什么顺序”与“怎样让车辆实际完成换位”是不同层次的问题。当前读到的状态、动作与能耗更新式用于路线阶段的排列决策；它们本身不提供完整换位轨迹的碰撞证明。</p>' },
      { title: '读到 RL 时先填这四项', kind: '教学重组', optional: true, html: '<ul><li>状态：决策时实际知道哪些信息？</li><li>动作：究竟能改变什么？</li><li>转移：一次决策跨越多长时间或哪一段路线？</li><li>奖励：优化的是平均性能、最差个体，还是别的指标？</li></ul><p>这篇是 2024 IEEE SMC 会议论文，来源类型与期刊文献分别标明。</p>' },
    ],
  },
  {
    id: 'reward', group: 'learning', title: '奖励里的惩罚，等于必须满足的约束吗？', term: 'Objective · Constraint · Guarantee',
    intro: '优化哪个数，与保证哪些行为，是两件需要分别核对的事。把论文读成“职责分工”会更清楚。',
    tags: ['奖励', '惩罚', '硬约束', '性能', 'guarantee'], related: ['rl-state', 'filter', 'cbf-qp', 'clf', 'mpc', 'safe-set'],
    refs: [ref('Z11', 2, 'Eq. (2) / Eq. (4)'), ref('V01', 5, '§IV-B / Hard constraints'), ref('R01', 7, '§2.3 / Eqs. (7)–(8)')],
    sections: [
      { title: '把三种角色放到一张桌上', kind: '跨论文教学重组', html: '<p>Z11 的奖励表达终点 SOC 均衡目标；V01 分别写出性能代价与硬约束；R01 则讨论性能策略与安全过滤机制怎样分工。它们解决的问题与假设不同，这里只比较各个数学对象承担的职责。</p>' },
      { title: '一个简单反例', kind: '教学示例', html: '<p>假设两个动作的性能收益分别为 10 和 1，前者违规会扣 5 分。如果只最大化“收益减惩罚”，违规动作得 5 分，仍高于合规动作的 1 分。这个示例只是说明有限惩罚可能被收益抵消，不是在评价某篇论文的实际奖励设置。</p>' },
      { title: '正确的问题不是只看有没有罚项', kind: '教学解释', html: '<p>要问：哪些行为被从可选集合中排除？哪些只是降低得分？执行时有没有另一个验证或过滤机制？所声称的保证靠什么假设与推理成立？观察到测试中没有违规，是实验记录，还需要与定理的对象和适用域分开。</p>' },
    ],
  },
  {
    id: 'cbf', group: 'terms', title: 'CBF：怎样用一个函数描述安全边界？', term: 'Control Barrier Function · 控制障碍函数',
    intro: 'CBF 不只给状态打一个安全分数，还要求存在合法控制，使轨迹不会从声明的安全集合穿出去。',
    tags: ['CBF', '控制障碍函数', '控制屏障函数', '安全边界', 'zeroing CBF', 'barrier'], related: ['discrete-cbf', 'control-affine', 'class-k', 'lie-derivative', 'relative-degree', 'cbf-qp', 'clf', 'invariance'],
    refs: [ref('R01', 11, '§3.2 / Eq. (12)'), ref('R01', 12, 'Eq. (13) / CBF synthesis limitations')],
    sections: [
      { title: '先把“边界”画在脑中', kind: '直觉解释', html: String.raw`<p>选一个随状态变化的函数 h，让允许的状态满足 <span class="math-inline" data-math="h(x)\ge0"></span>，边界对应 h(x)=0。CBF 条件约束 h 的变化速度，尤其是在边界处，不能让轨迹继续向负值方向穿出去。</p><p>“控制障碍函数”和“控制屏障函数”都是常见译法。这里沿用综述的安全集合约定 h≥0；读其他论文时要先核对它是否采用相反的符号。</p>` },
      { title: '原文定义与控制条件', kind: '原文依据', html: String.raw`<p>R01 的 zeroing CBF 表述使用二次连续可微的 h，并要求在所述安全集合上满足：</p><div class="math" data-math="\sup_{u\in\mathcal U}\nabla h(x)^\top f^c(x,u)\ge-\alpha(h(x))"></div><p>这里 <span class="math-inline" data-math="\dot x=f^c(x,u)"></span> 是连续时间动力学，α 是<button class="term-link" data-block="class-k">扩展 Class K 函数</button>。控制仿射模型下，实际执行的动作应满足：</p><div class="math" data-math="L_{\bar f}h(x)+L_{\bar g}h(x)u+\alpha(h(x))\ge0"></div><p>存在满足条件的动作，与控制器真正选到并执行这个动作，是需要连接起来的两件事。Lie 导数记号在<button class="term-link" data-block="lie-derivative">单独的术语区块</button>解释。</p>` },
      { title: '一个能手算的边界例子', kind: '教学示例', html: String.raw`<p>假设一维系统 <span class="math-inline" data-math="\dot x=u,\ u\in[-1,1]"></span>，想保持 x≥0。取 h(x)=x、α(h)=h，条件变成 u+x≥0。</p><p>在 x=0 时，它要求 u≥0；在 x=0.5 时，可允许 u=−0.5，逐渐接近边界。这说明 CBF 不必禁止一切“靠近边界”的动作。这个理想例子由网页教学构造，不是论文实验。</p>` },
      { title: '什么时候不能直接套用', kind: '适用条件', html: '<p>把一个距离公式叫作 h，并不自动得到有效 CBF。需要核对所声明域上的可行输入、解的存在与适当正则性、初始状态、模型和控制执行条件。原文也指出：给定 CBF 后求动作，与找到有效 CBF，是难度不同的问题。</p><p>这里的连续时间条件不能直接当成采样、时延、执行器滞后或高相对阶系统的完整保证。遇到控制量在一阶导数中不出现的情况，先看“相对阶”。</p>' },
    ],
  },
  {
    id: 'clf', group: 'terms', title: 'CLF：怎样表达“状态在走向目标”？', term: 'Control Lyapunov Function · 控制 Lyapunov 函数',
    intro: 'CLF 用一个随控制能够下降的函数描述趋向目标的可能性；它与 CBF 所关心的安全边界各有职责。',
    tags: ['CLF', '控制李雅普诺夫函数', '控制Lyapunov函数', '稳定性', 'stability', 'Lyapunov'], related: ['cbf', 'cbf-qp', 'safe-set', 'reward'],
    refs: [ref('R01', 11, '§3.2 / CLF motivation'), ref('R01', 5, 'Safety Versus Stability')],
    sections: [
      { title: '用一个“到目标的量”理解', kind: '直觉解释', html: '<p>设 W(x) 在目标处为零，在附近其他状态处为正。如果每个非目标状态都能找到合法动作，让 W 严格下降，那么 W 可以帮助构造朝目标稳定的控制。一般的 CLF 只要求可选控制带来合适的下降性质，不把某一种指数下降率当作唯一形式。</p><p>W 只是本区块的教学记号，用来与安全函数 h 区分。</p>' },
      { title: '一个常用的充分条件写法', kind: '教学公式', html: String.raw`<p>对控制仿射系统，一个常见的指数下降设计条件是：</p><div class="math" data-math="L_{\bar f}W(x)+L_{\bar g}W(x)u\le-cW(x),\quad c>0"></div><p>这不是 R01 逐字给出的 CLF 定义或新定理，而是用于解释“可控下降”的标准教学形式。它还需要正定性、合适的定义域、控制可行性以及相应闭环解等条件；局部结论与全局结论不能混用。</p>` },
      { title: '与 CBF 放在一起比较', kind: '跨概念解释', html: '<p>CLF 通常追问：是否能朝目标收敛？CBF 追问：是否能保持在安全集合内？R01 明确指出安全和稳定是不同性质，通常互相不能推出。沿途会穿过障碍的“趋向目标”，仍然可能不安全。</p><p>同时加入两类约束时，还要检查它们与输入限制是否冲突。不能因为两条不等式分别合理，就假定合在一起一定有解。</p>' },
      { title: '最简单的一维例子', kind: '教学示例', optional: true, html: String.raw`<p>在 <span class="math-inline" data-math="\dot x=u"></span> 中，选 W(x)=x²/2，采用 u=−x，便有：</p><div class="math" data-math="\dot W=xu=-x^2=-2W"></div><p>这是无输入限制的理想示例；若加上饱和限制，就必须重新检查哪些状态还能满足所选下降率。</p>` },
    ],
  },
  {
    id: 'cbf-qp', group: 'terms', title: 'QP 与 CBF-QP：怎样求一个尽量少改的安全动作？', term: 'Quadratic Program · 二次规划 · CBF-QP',
    intro: 'QP 是一种优化问题的形式。CBF-QP 把“尽量靠近原动作”作为目标，把安全条件放进约束。',
    tags: ['QP', '二次规划', 'CBF-QP', 'CLF-CBF-QP', 'quadratic programming', '软约束', 'slack'], related: ['slack', 'control-affine', 'cbf', 'clf', 'lie-derivative', 'filter', 'reward'],
    refs: [ref('R01', 12, '§3.2 / Eqs. (13a)–(13b)')],
    sections: [
      { title: 'QP 这个名字说明什么', kind: '基础解释', html: String.raw`<p>常见 QP 具有二次目标和线性等式、不等式约束，例如：</p><div class="math" data-math="\min_z\ \tfrac12 z^\top Hz+q^\top z\quad\mathrm{s.t.}\ Az\le b"></div><p>H 为半正定矩阵时，配合线性约束得到凸 QP。这描述问题的结构；它本身既不是某个控制器，也不自动给出安全、唯一解或实时性。</p>` },
      { title: '把 CBF 条件放进去', kind: '原文依据', html: String.raw`<p>R01 Eq. (13) 在每个状态 x 下，寻找偏离任务动作最小的允许输入。用 <span class="math-inline" data-math="u_{\rm nom}=\pi_{\rm task}(x)"></span> 简写原文的任务策略，可写为：</p><div class="math" data-math="\begin{aligned}\min_{u\in\mathcal U}\quad&\tfrac12\|u-u_{\rm nom}\|^2\\\mathrm{s.t.}\quad&L_{\bar f}h+L_{\bar g}h\,u+\alpha(h)\ge0.\end{aligned}"></div><p>给定 x 后，CBF 条件对 u 是仿射的。若输入集合也能用线性约束表示，就符合这里讨论的凸 QP 结构。不能只看到“二次目标”，就忽略输入集合或其他约束的形式。</p>` },
      { title: '手算一个最小改动', kind: '教学示例', html: String.raw`<p>沿用 <span class="math-inline" data-math="\dot x=u"></span>、h=x、α(h)=h 的理想示例。在 x=0.2、原动作 u<sub>nom</sub>=−1、输入范围 [−1,1] 时，CBF 条件要求 u≥−0.2。离 −1 最近的可行输入是 −0.2。</p><p>这里是解析投影示例，不调用求解器，不宣称车辆控制效果。</p>` },
      { title: '无解与松弛变量要怎样理解', kind: '教学补充', optional: true, html: String.raw`<p>多个障碍、输入限制或额外任务条件可能使可行集为空。某些 CLF-CBF 设计用 δ 松弛任务下降要求，例如 <span class="math-inline" data-math="\dot W\le-cW+\delta"></span>，并对 δ 加代价。</p><p>这是一种额外设计选择，不是上面 R01 Eq. (13) 自带的内容。放松 CLF、放松 CBF 和放松物理输入约束会改变不同的保证；“加松弛”不能自动同时保住安全与可行性。</p>` },
    ],
  },
  {
    id: 'lie-derivative', group: 'terms', title: 'Lie 导数：函数怎样沿着系统运动变化？', term: 'Lie Derivative · Lie 导数',
    intro: '它把多元函数的梯度与系统运动方向相乘，回答 h 沿这条动力学轨迹的变化速度。',
    tags: ['Lie导数', '李导数', 'Lie derivative', '梯度', '链式法则', 'Lf', 'Lg'], related: ['cbf', 'clf', 'relative-degree', 'model'],
    refs: [ref('R01', 11, '§3.2 / Eq. (12)'), ref('R01', 12, 'Eq. (13b) / Gradient form')],
    sections: [
      { title: '先从链式法则开始', kind: '教学推导', html: String.raw`<p>若状态沿 <span class="math-inline" data-math="\dot x=\bar f(x)+\bar g(x)u"></span> 运动，则：</p><div class="math" data-math="\dot h=\nabla h^\top\dot x=\underbrace{\nabla h^\top\bar f}_{L_{\bar f}h}+\underbrace{\nabla h^\top\bar g}_{L_{\bar g}h}u"></div><p>R01 在 Eq. (12)–(13) 直接使用梯度写法。本区块把相同的两个乘积改写成常见 Lie 导数记号，便于对照其他论文。这里的 L 是求沿向量场方向变化的算子，不是预测时域。</p>` },
      { title: '每一项分别做什么', kind: '符号解释', html: '<p>L<sub>f̄</sub>h 描述系统漂移方向对 h 的影响；L<sub>ḡ</sub>h 描述输入通道对 h 变化率的影响。标量输入时后者是一个系数；多个输入时它是一行系数，乘上输入向量。</p><p>它并不意味着 h 已经是 CBF 或 CLF，只是在计算一个函数的变化率。</p>' },
      { title: '一个二维例子', kind: '教学示例', optional: true, html: String.raw`<p>设 <span class="math-inline" data-math="x=(p,v),\ \dot p=v,\ \dot v=u"></span>。那么：</p><div class="math" data-math="\bar f=\begin{bmatrix}v\\0\end{bmatrix},\quad\bar g=\begin{bmatrix}0\\1\end{bmatrix}"></div><p>对 h(p,v)=p，有 L<sub>f̄</sub>h=v、L<sub>ḡ</sub>h=0。输入没有出现在第一次求导中；再看 v 的导数才会看到 u。这就连接到“相对阶”。</p>` },
    ],
  },
  {
    id: 'class-k', group: 'terms', title: 'Class K 函数：CBF 里的 α 是什么？', term: 'Class K · Extended Class K · K 类函数',
    intro: 'α 不是某个固定算法的名字。它是一类满足单调性条件的函数，用来规定允许的变化率。',
    tags: ['Class K', 'K类函数', '扩展K类', 'alpha', 'α', 'CBF参数', '增益'], related: ['cbf', 'clf', 'lie-derivative'],
    refs: [ref('R01', 11, 'Class K function sidebar / Eq. (12)')],
    sections: [
      { title: '普通 K 类与扩展 K 类', kind: '定义解释', html: '<p>通常的 K 类函数定义在从零开始的非负区间上，连续、严格递增，并满足 α(0)=0。扩展 K 类允许定义域包含零两侧；R01 的边栏采用 α: ℝ→ℝ、连续且严格递增、α(0)=0 的写法。</p><p>“严格递增”表示输入更大时输出也严格更大，不要求只能取某一种多项式。</p>' },
      { title: '线性例子就能看懂它的角色', kind: '教学示例', html: String.raw`<div class="math" data-math="\alpha(r)=\kappa r,\qquad\kappa>0"></div><p>放进 CBF 条件得到 <span class="math-inline" data-math="\dot h\ge-\kappa h"></span>。在安全域内 h&gt;0，较大 κ 在这条不等式中允许更负的下降率；在 h=0，仍要求 ḣ≥0。因此较大 κ 不能直接读成“更安全”。</p>` },
      { title: '别把增益和保证混在一起', kind: '适用边界', html: '<p>κ 的单位应与时间及 h 的定义相容；其取值也会影响控制约束是否可行。这里解释的是连续时间条件的角色，不承诺某个参数在采样系统、噪声或执行器滞后下有效。</p>' },
    ],
  },
  {
    id: 'relative-degree', group: 'terms', title: '相对阶：为什么安全距离求一次导，还看不到加速度？', term: 'Relative Degree · 相对阶',
    intro: '某个输出要沿动力学求导多少次，控制输入才显式出现，会影响约束怎样转成可执行的控制条件。',
    tags: ['相对阶', 'relative degree', '高阶CBF', 'HOCBF', '加速度', '距离约束'], related: ['control-affine', 'lie-derivative', 'cbf', 'model', 'safe-set'],
    refs: [ref('R01', 11, 'Eq. (12) / Starting point for the teaching derivation')],
    sections: [
      { title: '先说明来源与讲解范围', kind: '教学补充', html: '<p>R01 Eq. (12) 给出 h 的一阶沿系统导数条件。下面从这个形式出发，用基础动力学解释“输入何时出现”；相对阶的术语定义与双积分器例子是教学补充，不是声称该页给出了高阶 CBF 设计或定理。</p>' },
      { title: '同一个小车，不同函数有不同相对阶', kind: '教学推导', html: String.raw`<p>在光滑、单输入的局部设置下，考虑距固定墙的距离 d、朝墙的速度 v，以及加速度输入 u：</p><div class="math" data-math="\dot d=-v,\qquad\dot v=u"></div><p>选 h=d−d<sub>min</sub>，则：</p><div class="math" data-math="\dot h=-v,\qquad\ddot h=-u"></div><p>输入在第二次求导才显式出现，所以这个输出在该模型下相对阶为 2。如果改为速度输出 v，求一次导就得到 u，相对阶为 1。</p>` },
      { title: '相对阶的一种局部表述', kind: '基础补充', optional: true, html: String.raw`<p>对光滑控制仿射、单输入系统，若某邻域内：</p><div class="math" data-math="L_{\bar g}L_{\bar f}^{j}h=0\ (j=0,\ldots,r-2),\qquad L_{\bar g}L_{\bar f}^{r-1}h\ne0"></div><p>则输出 h 在该邻域满足这种相对阶 r 的结构。相对阶可能随状态改变；多输入问题还需要检查输入输出耦合，不能机械套用这一标量表述。</p>` },
      { title: '它为什么影响 CBF 使用', kind: '适用边界', html: '<p>若 L<sub>ḡ</sub>h=0，一阶条件里就没有能直接选择的 u，不能照搬相对阶 1 的输入约束。可能需要高阶 CBF、加入速度信息的不同安全函数或其他预测/备份构造，并重新检查可行性与假设。</p><p>本版只介绍这个障碍，不把二次求导当作完整高阶 CBF，也不提供未经核验的车辆安全控制器。</p>' },
    ],
  },
  ...additionalBlocks,
  ...beginnerBlocks,
];
