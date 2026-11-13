import {chronicle} from './history-chronicle.js';
// Original Chinese teaching narrative. Historical anchors are separate from analytic examples.
const cite=(...ids)=>ids.map(id=>`<button class="history-cite" data-history-ref="${id}" aria-label="查看文献 ${id}">[${id}]</button>`).join(' ');
const concept=(id,label)=>`<button class="term-link" data-block="${id}">${label}</button>`;
const chapter=(id,label)=>`<button class="term-link" data-history-chapter="${id}">${label}</button>`;
const math=s=>`<div class="math" data-math="${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}"></div>`;
const section=(title,html)=>({title,html});
export const relationTypes={prerequisite:'理解前提',raises:'引出问题',condition:'提供条件',distinction:'关注区别',tradeoff:'成本权衡'};
export const conceptNames={'motion-basics':'运动与状态','update-basics':'采样与更新','feedback-basics':'反馈','stability-language':'稳定性与收敛',model:'状态与模型',information:'测量与消息',mpc:'MPC','recursive':'递归可行性',invariance:'不变集',cbf:'CBF',graph:'通信图','consensus-starter':'一致性',trigger:'事件触发','control-learning':'数据与学习'};
export const relations=[
  {from:'motion-basics',to:'model',type:'prerequisite',why:'先分清位置、速度与实际输入，才能定义状态和动力学。'},
  {from:'update-basics',to:'feedback-basics',type:'prerequisite',why:'动作使用哪一刻的数据、何时生效，会改变闭环递推。'},
  {from:'feedback-basics',to:'stability-language',type:'raises',why:'把结果送回决策后，必须检查误差会衰减还是被放大。'},
  {from:'model',to:'information',type:'raises',why:'状态写在模型里，不代表控制器可以直接测到它。'},
  {from:'information',to:'feedback-basics',type:'condition',why:'反馈必须使用当前可获得的测量或估计，不能借用未来真值。'},
  {from:'stability-language',to:'cbf',type:'distinction',why:'趋近目标与全过程留在允许集合是两种要求，需要分别论证。'},
  {from:'model',to:'mpc',type:'prerequisite',why:'预测需要明确状态推进、输入接口、采样与误差假设。'},
  {from:'invariance',to:'recursive',type:'condition',why:'合适的不变终端集合与接续控制是部分递归可行性证明的构件，不是唯一途径。'},
  {from:'recursive',to:'mpc',type:'condition',why:'当前解在下一轮能否接续，是约束 MPC 设计中的独立问题。'},
  {from:'invariance',to:'cbf',type:'prerequisite',why:'CBF 的集合保持条件需要放在正向不变性的语境里理解。'},
  {from:'graph',to:'consensus-starter',type:'condition',why:'图的连通性和方向影响哪些个体能够形成共同结果。'},
  {from:'feedback-basics',to:'consensus-starter',type:'prerequisite',why:'邻居差反馈把局部误差修正扩展到相互影响的决策者。'},
  {from:'consensus-starter',to:'trigger',type:'raises',why:'控制需要邻居信息后，还要问消息是否必须每步发送。'},
  {from:'trigger',to:'information',type:'tradeoff',why:'减少发布可能使消息更旧，误差、计算与通信成本要同时观察。'},
  {from:'control-learning',to:'model',type:'distinction',why:'学习可以辨识模型或选择动作；使用数据不等于模型已不重要。'},
  {from:'control-learning',to:'cbf',type:'raises',why:'策略追求任务收益时，仍需单独处理硬约束与执行条件。'},
];

export const historyChapters=[
  chronicle,
  {id:'feedback',title:'反馈为什么有效：从一次纠偏到闭环误差',subtitle:'先手算一个动作，再看为什么要把下一次测量送回来。',refs:['H02','H01','H04'],sections:[
    section('历史问题：让动作取决于机器当下的结果',`<p>Maxwell 论文描述转速变化通过调速装置影响阻力或阀门，并讨论连接之后的运动。机械构造让测量、比较和动作发生在同一条物理链中；我们今天写程序实现反馈，也必须补齐这条链。${cite('H02')}</p><p>先不研究真实蒸汽机或车辆。取一个无量纲状态 x，目标 r=0，输入 u 能在一步内直接改变状态。这个教学假设有意简化：位置与加速度不是这样的直接关系。模型一变，后面的结论就需要重算。</p>`),
    section('把口头动作写成一个可以检查的递推',String.raw`<p>模型为 x<sub>k+1</sub>=x<sub>k</sub>+u<sub>k</sub>。定义误差 e=x−r，选比例反馈 u=−g e。g 表示每一步纠正多少，已经吸收采样及模型比例：</p>${math(String.raw`e_{k+1}=(1-g)e_k`)}<p>从 e₀=4、g=0.5 开始，第一步 u₀=−2，e₁=2；第二步用新误差得到 u₁=−1，e₂=1。若仍照第一步动作一直执行，状态会继续穿过目标；反馈的意义在于每次重新依据结果决定动作。</p><p>因此“加一个负号”只是设计开头。要有效，还要有正确的测量符号、输入作用方向、更新日程与幅值条件。</p>`),
    section('为什么这个例子会靠近零',String.raw`<p>把上式反复代入：</p>${math(String.raw`e_k=(1-g)^k e_0,\qquad |1-g|<1\iff 0<g<2`)}<p>若 0&lt;g&lt;1，每次保留同号且缩小；若 1&lt;g&lt;2，会跨过零但幅值仍缩小；g=2 时误差在正负间等幅往返；g&gt;2 时幅值增长。g=1 在这个精确直接更新模型里一步归零，实际系统若有时延或输入限制，不能沿用“一步到位”。</p><p>这里是解析递推结论，不是只看十二个点得出的经验判断。下方图和数值用于核对推导。</p>`),
    section('扰动与受限动作怎样改变这条链',`<p>若第一步理想到 2 后额外偏移 +1，下一轮测得 3，再计算 −1.5；开环预定的第二动作仍可能是 −1。反馈提供纠正机会，但并不表示任何扰动都能消除。</p><p>若输入被限制在 [−1,1]，从 4 出发提出 −2，执行的却是 −1，下一状态为 3。此时原先的线性倍率推导不再直接描述整条轨迹。应同时记录提出动作与实际输入，重新分析约束下的行为。去 ${concept('feedback-basics','基础反馈区块')} 和 ${concept('safe-set','安全集合')} 查看已有例子。</p>`),
    section('状态、测量和估计不是同一个东西',`<p>如果 x 是仿真器真值，控制器却只能得到带噪测量 y，就应写成 u=−g y 或 u=−g x̂，并说明 x̂ 怎样得到。状态反馈的表达式不会自动提供状态测量能力。</p><p>Kalman 的论文给出从状态转移观点组织滤波与预测的一条经典路线；这里用其引言提示“怎样获得反馈所需信息”这个问题，不在本章推导完整滤波器。${cite('H04')} 在 ${concept('information','信息区块')} 中，可继续区分真实状态、估计与上次收到的消息。</p>`),
    section('本轮交付：一张闭环表，而不只是一条曲线',`<p>先预测 g=0.5 与 g=1.5 的符号变化，再用下方例子核对。抄下 k、e<sub>k</sub>、被使用的误差与 u<sub>k</sub>，手算前两步；把结论写成“在精确无延迟直接更新模型中，0&lt;g&lt;2 使误差衰减”。</p><p>下一问是：如果执行的动作依据上一拍误差，这个范围还成立吗？${chapter('oscillation','继续：一拍延迟如何改变稳定范围')}。把该疑问放进研究行动单的“最小机制”，用推导与反例完成一次小检查。</p>`),
  ]},
  {id:'oscillation',title:'为什么反馈也会振荡：时延怎样改变稳定条件',subtitle:'保持纠偏方向不变，只让信息晚一拍，观察原结论何时失效。',refs:['H02','H03','H05'],sections:[
    section('从调节机构的抖动，到闭环动态问题',`<p>Maxwell 的正文明确区分扰动衰减、增长及振幅变化的振荡，并讨论调节加快可能变成抖动。${cite('H02')} Nyquist 的论文则从反馈放大装置的稳定性出发。${cite('H03')} 两个历史背景提示同一个研究习惯：不能只根据控制器“想纠正偏差”的意图判断闭环。</p><p>下例使用与上一章相同的直接状态更新，只增加一拍旧信息；不是对历史装置的模型复现，也不代表任意物理系统的时延界。</p>`),
    section('先区分振荡与失稳',`<p>g=1.5 且无延迟时，倍率为 −0.5。从 4 出发得到 4、−2、1、−0.5。它反复过零，但幅值变小；这是振荡收敛。g=2.5 的倍率为 −1.5，则得到 4、−6、9，幅值增长。</p><p>所以“有振荡”不是完整的失败定义。应同时看幅值、衰减、约束和任务容差。即使渐近收敛，途中越过障碍也可能不可接受。${concept('stability-language','稳定、收敛与安全的区别')} 解释这些性质为什么要分别判断。</p>`),
    section('只晚一拍，状态维数就增加了',String.raw`<p>令动作使用旧误差 u<sub>k</sub>=−g e<sub>k−1</sub>，并设启动历史 e₋₁=e₀=4。递推成为：</p>${math(String.raw`e_{k+1}=e_k-ge_{k-1},\qquad\begin{bmatrix}e_{k+1}\\e_k\end{bmatrix}=\begin{bmatrix}1&-g\\1&0\end{bmatrix}\begin{bmatrix}e_k\\e_{k-1}\end{bmatrix}`)}<p>只知道 e<sub>k</sub> 已不够计算下一步，还要知道 e<sub>k−1</sub>。延迟把历史变成扩充状态。启动历史也是问题定义的一部分，不能换成更有利的值却不披露。</p>`),
    section('把稳定范围推出来，再找一个反例',String.raw`${math(String.raw`\lambda^2-\lambda+g=0`)}<p>当 0&lt;g≤1/4，两个根为 (1±√(1−4g))/2，均在单位圆内。当 1/4&lt;g，两个根为共轭复数，乘积为 g，故各自模长为 √g。两段合起来，正增益下渐近稳定的范围是 0&lt;g&lt;1。</p><p>取 g=1.2：无延迟倍率为 −0.2，误差衰减；一拍延迟时模长 √1.2≈1.095，存在增长模态。在本例启动历史下，误差依次是 4、−0.8、−5.6、−4.64……，并非每一步绝对值都变大，有限片段看起来较小也不能代替根的位置。</p><p>这已经是一个明确反例：无延迟模型允许的增益，未必适用于延迟闭环。</p>`),
    section('为什么接到频率分析与鲁棒性',`<p>延迟改变动作与状态的相对时间关系。频率分析提供描述相位变化的语言，鲁棒分析则要求说明允许哪些不确定性与怎样衡量扰动影响。Doyle 等论文在标准 LTI 设置中讨论 H₂/H∞ 指标；不能把下方一拍例子的稳定条件当成该论文的一般结论。${cite('H05')}</p><p>研究时要先分开三件事：采样造成的时间间隔、通信造成的数据变旧、执行器造成的命令到实际输入滞后。它们可能同时存在，但不必有相同数学模型。</p>`),
    section('本轮交付：推导、反例与可撤回的解释',`<p>固定模型、启动历史与 g=1.2，只切换信息是否晚一拍。保存两种递推、特征根、前十二步记录和有限结论。再写什么会使解释失效，例如实现其实用了不同启动历史或输入饱和。</p><p>这练习的是：指出一个原结论的适用条件，再用最小反例定位欠账。下一步可以分析补偿、降低增益或改变消息机制，各方向平行讨论；先到 ${concept('minimal-study','最小研究单元')} 或 ${concept('failure-diagnosis','失败诊断')} 决定需要哪一种证据。</p>`),
  ]},
  {id:'network',title:'从一个系统，到多个相互影响的决策者',subtitle:'把单个误差变成邻居差，再追问图、信息和整体目标。',refs:['H07','H01','H08'],sections:[
    section('先辨认多出来的关系，而不只增加数量',`<p>四台各自调温、互不影响的设备，可以是四个独立闭环。若共享总用电限制、互相传热或需要共同跟踪一个参考，问题中才出现需要建模的关系。多智能体的难点不仅是“更多状态”，还包括谁知道什么、局部动作怎样改变别人，以及谁承担成本。</p><p>网络化控制的发展把通信放进闭环本身；回顾文章明确区分通过网络实施控制与控制网络运行。${cite('H01')} 这也提醒我们，通信图不一定就是物理耦合图。</p>`),
    section('用邻居差代替一个外部目标',String.raw`<p>先用四个无量纲标量状态，链 A—B—C—D，所有人基于同一轮旧值更新：</p>${math(String.raw`x_i^+=x_i+\varepsilon\sum_{j\in\mathcal N_i}(x_j-x_i)`)}<p>从 [10,30,70,90]、ε=0.2 出发，B 得到 30+0.2[(10−30)+(70−30)]=34，整组得到 [14,34,66,86]。每条无向边两端的增减相抵，因此平均保留在 50。但平均不变本身不说明每个人接近了共同值。</p><p>这个同步离散例子由本站构造。2007 年综述用于连接一致性、图与信息流的研究主题；并不是这段代码的复现依据。${cite('H07')}</p>`),
    section('为什么矩阵、连通性和稳定性会在这里相遇',String.raw`${math(String.raw`x^+=(I-\varepsilon L)x,\qquad e^+=(I-\varepsilon L)e`)}<p>L 把每个节点的邻居差排成矩阵。固定连通无向图中，零特征值对应共同平移方向；其余特征值为正。分歧方向的倍率为 1−ελ，所以 0&lt;ε&lt;2/λ<sub>max</sub>(L) 使这些方向衰减。</p><p>这与上一章的“倍率绝对值小于 1”是同一分析思路，换成了多个模态。断开 B—C 后，存在组间不能消除的分歧，两组分别趋向 20 和 80。${concept('laplacian','Laplacian')}、${concept('graph','通信图')} 和 ${concept('consensus-starter','一致性')} 由此成为一条推理链。</p>`),
    section('把通信时间放进去，信息就成为状态的一部分',`<p>若不是每步发送，控制器读到的可能是上次广播值 x̂，触发检测却使用当前 x。此时实际状态、旧消息、时间戳与检测日程都必须记下来。消息保持造成的误差也不能自动等同于上一章的固定一拍延迟。</p><p>本站 ${concept('trigger','事件触发区块')} 与通信交互例子使用固定采样检测。若讨论连续时间触发、MIET 或 Zeno，必须回到相应论文条件；少发几次消息不能替代理论证明。</p>`),
    section('从标量一致性回到车辆，哪些东西必须补上',`<p>若把 x 解释成位置，“都相同”可能意味着车体重合；若解释成速度，则共同车速并不确定车间距。实际小车还包括位置、速度、加速度、执行器限制和几何占用。不能只把图中圆点换成汽车图标就声称完成编队或避碰。</p><p>CBF-QP 文献把安全条件与性能目标放到同一优化框架，提供了一种相关工具；有工具仍需解决联合约束可行性、信息可得性与执行条件。${cite('H08')} 继续看 ${concept('formation-starter','编队与一致性的区别')} 和 ${concept('cbf','安全边界')}。</p>`),
    section('本轮交付：固定一个机制，追踪收益去了哪里',`<p>在现有通信交互例子中，固定四节点链、初值、增益 0.15 和 60 步，比较每步发布与 θ=5 的阈值发布。记录双方节点发布数、每一步分歧和旧消息。已知教学核对值是 244 与 34 次发布，但还要报告末端误差代价；次数不等于能耗。</p><p>若想把练习发展为研究，下一步先核对最近邻方法已经解决了什么，再明确准备改变的信息、机制或条件。交付一张 ${concept('experiment-design','比较协议')} 和一段有限结论；<button class="term-link" data-study-view="research">在行动单中选择“设计并核对比较”</button>。</p>`),
  ]},
];
