// Self-authored mechanics and programming lessons; citations are conceptual bridges.
const m=s=>`<div class="math" data-math="${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}"></div>`;
const s=(title,html,optional=false)=>({title,kind:'基础教学',html,optional});
const ref=(paper,page,label)=>({paper,page,label});
export const foundationsBlocks=[
  {id:'motion-basics',group:'foundations',title:'位置、速度、加速度，怎样连成一次运动？',term:'Position · Velocity · Acceleration · Sampling',intro:'先把单位和时间说清：位置回答在哪里，速度回答位置变多快，加速度回答速度变多快。',tags:['零基础','运动','位置','速度','加速度','单位','采样'],related:['update-basics','feedback-basics','model','safe-set'],refs:[ref('R02',3,'State-space background only; mechanics example is self-authored')],sections:[
    s('先看一辆沿直线运动的小车',`<p>选定向右为正方向，位置 p=10 m 表示小车在参考点右侧 10 米。速度 v=2 m/s 表示此刻位置向正方向每秒增加约 2 米；加速度 a=−1 m/s² 表示速度每秒减少 1 m/s。加速度为负不表示已经向左运动：在速度降到零之前，它仍向右走。</p><p>若从静止继续施加负加速度，速度会变负，之后才向左运动。若模型要求小车停住就不倒车，应明确加入停车后 a=0 等规则。先定正方向、单位和停车规则，才能解释符号。</p>`),
    s('一秒后在哪里：不能只更新速度',String.raw`<p>只在这一秒内假设加速度恒定，时间间隔记 T。对变化率积分得到：</p>${m(String.raw`v^+=v+aT,qquad p^+=p+vT+	frac12aT^2`)}<p>从 p=10、v=2、a=−1、T=1 出发，下一秒 v⁺=1 m/s，p⁺=11.5 m。速度从 2 均匀变到 1，平均速度是 1.5，所以前进 1.5 m。再保持一秒，得到 v=0、p=12；第一秒与第二秒走过的距离不同。</p><p>位置式中每项单位都必须是米：vT 是 (m/s)×s，aT² 是 (m/s²)×s²。若把 100 ms 直接当作 100 s 代入，结果会完全失真。</p>`),
    s('连续变化与采样记录怎样对应',String.raw`<p>连续时间的点号表示瞬时变化率；程序记录的是每隔 T 秒的一份状态：</p>${m(String.raw`dot p(t)=v(t),quaddot v(t)=a(t),qquad t_k=kT,quad x_k=[p(t_k),v(t_k)]^	op`)}<p>采样并不表示小车只在采样点才运动。上式的精确离散更新要求每段内实际加速度恒定；显式 Euler 近似 p⁺=p+Tv 会把第一秒位置估成 12 m。它可以是一种明示的近似，却不能与精确积分结果混用。</p><p>加速度命令也可能经过执行器才变成实际加速度；此时要补上执行器模型。这里的数字是基础力学教学，不是论文实验。</p>`),
    s('动手产出：填写两步状态表',`<p>用列“时间／旧位置／旧速度／本段加速度／新位置／新速度”手算上面的两秒。完成标准：得到 (11.5,1) 与 (12,0)，解释为什么两个时间段距离不同，给每一列标单位。再把 T 改为 0.5，核对相同恒定加速度下两次半秒是否等于一次一秒。</p><p>下一步把这张表写成程序，去看<button class="term-link" data-block="update-basics">变量更新顺序</button>。不需要先读完控制教材。</p>`),
    s('自测：速度为零时，加速度必须为零吗？',`<p>不必。例如抛起物体的最高点速度为零，但重力加速度仍在。要维持静止，需要合力及相应模型允许它保持静止；只看到一帧速度为零不能推出以后不动。</p>`,true),
  ]},
  {id:'update-basics',group:'foundations',title:'程序怎样一步步更新变量，才与公式一致？',term:'Time Step · State Snapshot · Synchronous Update · Log',intro:'赋值会改变变量。先保留本轮旧状态，再算动作和下一状态，最后统一提交。',tags:['零基础','程序','Python','更新顺序','同步','旧状态','日志'],related:['motion-basics','feedback-basics','consensus-starter','first-reproduction'],refs:[ref('R02',4,'Algorithmic feedback-cycle background; code is a teaching example'),ref('Z08',2,'Networked-state background; not a discrete reproduction')],sections:[
    s('k 是第几步，x 是这一刻的状态',`<p>令 x=(p,v)，k=0 表示初始记录。循环一次不是“时间自动过了一秒”，而是按你规定的 T 把状态推进到 (k+1)T。应分开保存时间、状态、提出的动作、经过限制的实际输入与失败标志。没有时间刻度，就无法解释速度或比较计算量。</p>`),
    s('把一次推进拆成四个动作',`<p>下面是恒加速度模型的单步代码。p_old、v_old 代表同一时刻的数据；算完两个新值后才一起替换。</p><pre><code>p_old, v_old = p, v
a_applied = -1.0
p_next = p_old + T*v_old + 0.5*T*T*a_applied
v_next = v_old + T*a_applied
p, v = p_next, v_next
k += 1</code></pre><p>从 p=10、v=2、T=1 运行一次得到 p=11.5、v=1。若先覆盖 v，再把新 v 代入上面的精确位置式，会得到 10.5；这与声明的恒加速度模型不一致。某些数值积分方法确实使用新速度，但那需要另一套明示的离散规则。</p>`),
    s('多个 agent 也要保存同一轮快照',`<p>对链式一致性 [10,30,70,90]，ε=0.2，先令 old=x.copy()，每个 agent 都从 old 读取邻居，统一得到 [14,34,66,86]。如果边遍历边覆盖，后面的 agent 会用到前面的新值；对应的是另一种更新日程。</p><pre><code>old = x.copy()
next_x = [old[i] + gain*sum(old[j]-old[i]
          for j in neighbors[i]) for i in range(len(old))]
x = next_x</code></pre><p>同步与异步都可以是研究对象，但实现必须与假设一致。发现顺序错误时先修正并保留旧记录，不能把修正前后的差异解释成算法改进。</p>`),
    s('动手产出：一条能核对的执行记录',`<p>下载<button class="term-link" data-study-view="research">研究起步页</button>中的教学脚本，先跑内置核对，再输出两步运动表。完成标准：初始行 k=0 被保存，每步能找到旧状态、动作、新状态；停止并重新启动能得到相同的确定性结果。多 agent 部分再核对第一步四个值。</p><p>完整日志用于检查因果顺序；汇总均值不能替代原始过程。后面增加噪声时，还要保存随机种子与生成方式。</p>`),
    s('自测：仿真器知道下一步状态，策略能提前读吗？',`<p>只有在问题明确允许该预测信息时才可以。真实未来值通常只能用于离线评价。把模拟器的未来真值交给当前策略会改变信息条件，即使代码能运行也不能支撑原来的分布式或因果性主张。</p>`,true),
  ]},
  {id:'feedback-basics',group:'foundations',title:'“根据当前状态调整动作”，反馈到底怎样发生？',term:'Feedback · Reference · Error · Gain · Saturation',intro:'测量状态，与目标比较，计算动作，再观察动作造成的新状态；这一圈反复连接起来就是反馈。',tags:['零基础','反馈','开环','闭环','误差','增益','饱和'],related:['motion-basics','update-basics','model','consensus-starter','method-choice'],refs:[ref('R02',4,'Receding feedback-cycle background; scalar example is self-authored'),ref('R01',7,'Task-policy and constraint-filtering background')],sections:[
    s('用调节水温的想法认识闭环',`<p>目标温度是 reference，当前测量与目标的差是 error，调阀门是 input。Open-loop（开环）按事先计划操作；Closed-loop（闭环）用后续测量继续修正。Feedback 不是“知道未来”，而是把已经观察到的结果带回下一次决策。</p><p>对多智能体，每个控制器还可能读取邻居消息；消息过时、测量噪声与动作延迟都会进入这一圈。闭环结构本身不保证稳定或安全。</p>`),
    s('手算一个最小反馈，而不直接套到小车',String.raw`<p>先采用无量纲单积分器 x⁺=x+Tu，目标 r=0。误差 e=x−r，比例反馈 u=−Ke。负号使动作反向抵消当前误差：</p>${m(String.raw`e^+=(1-TK)e`)}<p>x₀=4、T=1、K=0.5 时，u₀=−2，下一状态 2；再测量得到 u₁=−1，下一状态 1。若 K=2.5，误差倍率 −1.5，状态变成 4、−6、9，来回越过目标而放大。</p><p>在这个精确、无延迟、无饱和的模型里，|1−TK|&lt;1，即 0&lt;TK&lt;2 才使误差衰减。这个条件属于此模型；实际小车的加速度到位置是另一种动力学，不能直接沿用。</p>`),
    s('动作受限以后，先分清想做与做到',`<p>若执行器限制 u∈[−1,1]，从 x=4、K=0.5 出发，任务控制器提出 −2，执行的是 −1，下一状态是 3。日志应同时保存 nominal input 与 applied input。继续把 −2 写进模型预测，就会误判真实过程。</p><p>受到扰动时也要重新测量：若第一步理想到 2 后额外偏移 +1，下一轮闭环用 x=3 算 u=−1.5；预先写死的开环第二动作仍是 −1。反馈提供修正机会，是否足够取决于模型、增益、限制与扰动。</p>`),
    s('从一个反馈到邻居反馈',`<p>单 agent 的误差可以是“我减目标”；一致性中则使用“我与邻居的差”。把每条信息箭头写清，才能知道每个动作如何产生。研究中再问：现有反馈在哪种状态下受信息或约束限制？你提出的新机制究竟改变了哪一步？</p><p>动手产出：手算 K=0.5 的两步，再算 K=2.5 的两步，解释符号、幅值和稳定性差别。脚本可输出对应记录；完成后进入<button class="term-link" data-block="research-loop">从现象提出可检验问题</button>。</p>`),
    s('自测：误差小，就说明动作安全了吗？',`<p>误差接近零只说明某个目标量接近参考。动作可能超限、其他 agent 可能碰撞，观测也可能有误差。应另列硬约束与全过程检查量。</p>`,true),
  ]},
];
