// Authored teaching data for the control-structure map (#view=map).
// The map is a navigation structure for this study desk, not a claim that this is the only
// decomposition of control. Every link target is checked by tools/check_map.mjs.

export const mapIntro = {
  kicker: '控制结构 · 先定位再比较',
  title: '控制由哪些部分组成，多智能体加了什么，局限在哪里',
  lead: '不按方法名背目录：先用四层十部分定位一个方法，再看多智能体把哪一部分局部化，最后按同一部分检查它的局限。',
  note: '四层十部分是本站用于定位的教学分解，不是控制理论的唯一定义；评价贯穿所有层。',
  closing: '这样组织后，“传统 vs 前沿”不再是方法标签，而是同一部分上的不同解法；“多智能体”也不再是形容词，而是每层被局部化后新增的通信、组织与耦合安全约束。',
};

export const mapLayers = [
  {id: 'task', name: '任务层', en: 'Mission', ask: '要什么、什么算好', summary: '把任务变成可检查的目标与约束，再决定怎么做。'},
  {id: 'info', name: '信息层', en: 'Information', ask: '知道什么、准不准', summary: '把物理世界变成可用信息；多智能体在这里新增通信与组织。'},
  {id: 'control', name: '控制层', en: 'Control', ask: '怎样让动作发生', summary: '由误差或状态计算指令，并真正执行。'},
  {id: 'assure', name: '保障层', en: 'Assurance', ask: '失败时怎么办、凭什么可信', summary: '监督、验证、回退与适应，检查上面三层是否还成立。'},
];

export const mapCross = {
  id: 'evaluate', name: '评价', en: 'Evaluation', ask: '什么算做到',
  summary: '贯穿所有层：先定义指标、对照与失败判据，否则“更好”没有意义。',
};

export const mapParts = [
  {
    id: 'goal', layer: 'task', name: '目标与约束', en: 'Objective & Constraints',
    duty: '定义“要什么、不许什么、什么算好”，把任务变成可测量的目标与约束集合。',
    output: '参考值、指标、约束集合',
    failure: '目标冲突、不可测、不可达',
    question: '这些目标与约束能被测量、被满足吗？',
    multi: '目标从单一变成“个体目标 + 群体目标”（一致、编队、覆盖、分工），需要目标分解，并处理个体与全局的冲突。',
    links: [['block', 'reward'], ['zero', 'L01']],
  },
  {
    id: 'plan', layer: 'task', name: '规划与决策', en: 'Planning & Decision',
    duty: '选路径、行为、任务分配与时序，把目标变成可执行的计划。',
    output: '轨迹、模式、任务分配方案',
    failure: '不可行、短视、组合爆炸',
    question: '最坏情况下有没有可行解？求解要多久？无解时退回什么？',
    multi: '决策从“一个控制器”变成集中 / 分散 / 分布式之间的权衡；任务分配与队形重构进入问题，计算与通信成本成为设计变量。',
    links: [['why', 'mpc'], ['why', 'optimal'], ['block', 'mpc']],
  },
  {
    id: 'sense', layer: 'info', name: '感知', en: 'Sensing',
    duty: '把物理量变成可用信号，并记录噪声、延迟与时间戳。',
    output: '观测、特征、时间戳',
    failure: '漏检、误检、标定漂移、时间不同步',
    question: '观测够不够？准到多少？延迟多大？',
    multi: '从全局可测变成局部可测；观测异步到达，还要处理其他智能体造成的遮挡与误检。',
    links: [['why', 'estimate'], ['zero', 'L03']],
  },
  {
    id: 'estimate', layer: 'info', name: '估计', en: 'Estimation',
    duty: '由观测和模型推断状态、参数与扰动，并给出误差范围。',
    output: '状态估计、参数估计、误差界',
    failure: '不可观测、偏差、模型不符',
    question: '估计误差界进入稳定性或安全保证了吗？可观测性够吗？',
    multi: '估计与邻居通信进入同一个回路；局部估计误差会沿网络传播，估计不再只是控制之外的“前置模块”。',
    links: [['why', 'estimate'], ['block', 'model']],
  },
  {
    id: 'comm', layer: 'info', name: '通信与协调', en: 'Communication & Coordination', added: true,
    duty: '交换状态、意图与时间基准，让局部信息形成群体行为。',
    output: '邻居信息、共识量、同步时钟',
    failure: '时延、丢包、拓扑变化、异步',
    question: '拓扑变化、丢包与时延测过吗？通信断了还能退回什么？',
    multi: '多智能体才需要的部分：拓扑、时延、丢包、时钟与事件触发本身都进入稳定性与安全分析，触发策略成为控制对象。',
    links: [['why', 'consensus'], ['why', 'event'], ['zero', 'L10'], ['block', 'graph'], ['block', 'trigger']],
  },
  {
    id: 'law', layer: 'control', name: '控制律', en: 'Control Law',
    duty: '由误差或状态计算指令，反馈与前馈都在这里汇合。',
    output: '控制输入',
    failure: '增益不当、饱和、振荡、稳态误差',
    question: '增益与延迟裕度多少？换到邻居的扰动上还稳定吗？',
    multi: '除了单闭环稳定，还要保证一致、编队、串稳定与图稳定；时延与拓扑变化会放大不稳定性。',
    links: [['why', 'feedback'], ['why', 'pid'], ['why', 'robust'], ['why', 'clf'], ['why', 'optimal'], ['zero', 'L04'], ['zero', 'L06'], ['zero', 'L08'], ['zero', 'L09']],
  },
  {
    id: 'actuate', layer: 'control', name: '执行', en: 'Actuation',
    duty: '把指令变成力、力矩、油门或轮速，是控制与物理世界真正接触的地方。',
    output: '力、力矩、油门、轮速',
    failure: '限幅、死区、迟滞、故障、执行延迟',
    question: '执行器还有余量吗？失效时怎么保证不失控？',
    multi: '每台仍有自己的饱和、死区与故障；耦合后，一台的延迟会沿编队或网络传播。',
    links: [['zero', 'L02'], ['zero', 'L06']],
  },
  {
    id: 'guard', layer: 'assure', name: '监督与验证', en: 'Supervision & Verification',
    duty: '监控运行状态、过滤不允许的动作、准备回退，并检查保证是否仍成立。',
    output: '允许动作、兜底策略、证书',
    failure: '约束没写清、过滤不可行、没有回退',
    question: '假设被实测过吗？过滤无解或有故障时退回什么？',
    multi: '安全从“个体不越界”变成“个体安全 + 耦合安全”（避碰、死锁、可行域交互）；个体安全不保证群体安全。',
    links: [['why', 'safety'], ['why', 'architecture'], ['zero', 'L11'], ['block', 'filter'], ['block', 'recursive'], ['block', 'safe-set'], ['block', 'invariance']],
  },
  {
    id: 'learn', layer: 'assure', name: '学习与适应', en: 'Learning & Adaptation',
    duty: '用数据更新模型、参数或策略，让系统在不确定环境中保持可用。',
    output: '新参数、新模型、新策略',
    failure: '分布外、没有保证、样本偏差',
    question: '数据覆盖够吗？评估与训练独立吗？学坏时谁兜底？',
    multi: '学习对象从单机策略扩展到交互数据、群体策略和对其他智能体的预测；分布外与样本偏差更难界定。',
    links: [['why', 'learning'], ['why', 'data'], ['block', 'rl-state'], ['block', 'data-driven']],
  },
  {
    id: 'evaluate', layer: 'cross', name: '评价', en: 'Evaluation',
    duty: '定义怎样算“做到了”，组织指标、对照与失败判据。',
    output: '指标、对照、失败判据',
    failure: '用指标替代任务、训练与评估不独立',
    question: '指标覆盖任务了吗？基线是否同信息、同调优？',
    multi: '评价从单条轨迹指标变成群体指标：一致误差、队形误差、吞吐、公平、通信量、最坏个体都要先定义。',
    links: [['why', 'research'], ['zero', 'L12']],
  },
];

export const mapDeltas = [
  {dim: '系统边界', single: '一个对象、一个闭环', added: 'N 个对象 + 网络耦合', effect: '稳定与性能要按网络分析，不能逐台看'},
  {dim: '信息', single: '全局可测', added: '局部可测 + 邻居通信，异步到达', effect: '估计与通信进入控制回路，成为保证的一部分'},
  {dim: '目标', single: '单一目标', added: '个体目标 + 群体目标（一致、编队、覆盖、分工）', effect: '需要目标分解，存在个体与全局的冲突'},
  {dim: '决策', single: '一个控制器', added: '集中 / 分散 / 分布式的权衡', effect: '计算与通信成本成为设计变量'},
  {dim: '稳定性', single: '单闭环稳定', added: '一致性、编队、串稳定、图稳定', effect: '时延与拓扑变化会放大不稳定性'},
  {dim: '安全', single: '个体不越界', added: '个体安全 + 耦合安全（避碰、死锁、可行域交互）', effect: '安全必须联合定义，个体安全不保证群体安全'},
  {dim: '资源', single: '计算与能量', added: '带宽、时钟、唤醒、事件触发', effect: '触发与通信策略本身成为控制对象'},
  {dim: '组织', single: '结构固定', added: '拓扑、角色、队形重构、任务分配', effect: '可扩展性与组织成本成为问题'},
  {dim: '对抗与不确定', single: '扰动、模型误差', added: '其他智能体的策略不确定（博弈、人机混合）', effect: '需要预测、鲁棒或协议约束'},
  {dim: '评价', single: '单条轨迹指标', added: '群体指标（一致误差、队形误差、吞吐、公平、通信量、最坏个体）', effect: '指标要先定义，否则“更好”没有意义'},
];

export const mapAdditions = [
  {name: '通信', text: '信息层新增的部分：拓扑、时延、丢包、时钟与触发策略。'},
  {name: '组织', text: '接在规划与评价之上：拓扑、角色、队形重构、任务分配与可扩展性。'},
  {name: '耦合安全', text: '保障层新增：个体安全 + 避碰、死锁、可行域交互等联合约束。'},
];

export const mapLimits = [
  {
    id: 'model', layer: 'task', title: '目标与建模',
    limitation: '目标冲突、模型简化、场景覆盖不足',
    symptom: '结论只在设定的场景与模型内成立',
    question: '目标与约束可测吗？模型误差多大？',
    parts: ['goal', 'plan'],
  },
  {
    id: 'info', layer: 'info', title: '信息与估计',
    limitation: '状态不可测、噪声与延迟、估计常被忽略',
    symptom: '写“状态反馈”，实际用的是估计值',
    question: '估计误差界进入保证了吗？可观测性够吗？',
    parts: ['sense', 'estimate'],
  },
  {
    id: 'comm', layer: 'info', title: '通信与协调',
    limitation: '理想链路、同步时钟、固定拓扑',
    symptom: '断链、异步、时延下保证失效',
    question: '拓扑变化、丢包与时延测过吗？',
    parts: ['comm'],
  },
  {
    id: 'compute', layer: 'task', title: '决策与计算',
    limitation: '组合爆炸、求解时限、一致性开销',
    symptom: '无解、超时、局部最优',
    question: '最坏求解时间多少？无解时退回什么？',
    parts: ['plan', 'law'],
  },
  {
    id: 'execute', layer: 'control', title: '控制与执行',
    limitation: '饱和、延迟、耦合放大（串稳定）',
    symptom: '过冲、振荡、沿编队传播',
    question: '增益与延迟裕度多少？执行器还有余量吗？',
    parts: ['law', 'actuate'],
  },
  {
    id: 'safety', layer: 'assure', title: '安全与验证',
    limitation: '连续证明 vs 离散执行、单场景仿真、弱基线',
    symptom: '“保证”只在假设成立时成立',
    question: '假设实测了吗？基线是否同等调优、同信息？',
    parts: ['guard'],
  },
  {
    id: 'learning', layer: 'assure', title: '数据与学习',
    limitation: '激励不足、分布外、训练评估不独立',
    symptom: '不可复现、过拟合、离线好上线差',
    question: '数据覆盖够吗？评估独立吗？',
    parts: ['learn'],
  },
  {
    id: 'evidence', layer: 'cross', title: '工程与证据',
    limitation: '仿真到实车差距、跨论文不可比',
    symptom: '结论难外推，无法横向比较',
    question: '有现场或多场景验证吗？信息与权限匹配吗？',
    parts: ['evaluate'],
  },
];

export const mapPackaging = [
  '把条件结论写成无条件保证。',
  '与弱基线比较，或只给自己调参。',
  '只报单场景仿真，没有重复与失效记录。',
  '缺少同一问题、同信息、同权限下的跨方法对比。',
];

export const mapMethods = [
  {id: 'feedback', name: '反馈 / PID', part: 'law', why: 'pid', change: '用当前误差修正动作，不必先知道完整模型。', checks: ['execute', 'model']},
  {id: 'optimal', name: 'LQR / 最优控制', part: 'law', why: 'optimal', change: '在给定模型和代价函数下，按目标权衡计算控制。', checks: ['execute', 'model']},
  {id: 'mpc', name: 'MPC', part: 'plan', why: 'mpc', change: '把预测、约束和未来可行性放进在线决策。', checks: ['compute', 'model']},
  {id: 'robust', name: '鲁棒 / H∞', part: 'law', why: 'robust', change: '把明示的不确定性与扰动放进设计和分析。', checks: ['model', 'execute']},
  {id: 'estimate', name: '卡尔曼 / 观测器', part: 'estimate', why: 'estimate', change: '由带噪观测和模型推断可用状态。', checks: ['info']},
  {id: 'safety', name: 'CBF / 安全过滤', part: 'guard', why: 'safety', change: '把“不能越过边界”变成可在线检查的约束。', checks: ['safety', 'execute']},
  {id: 'clf', name: 'CLF', part: 'law', why: 'clf', change: '把“正在靠近目标”变成可检查的下降条件。', checks: ['execute', 'model']},
  {id: 'consensus', name: '一致性 / 编队', part: 'comm', why: 'consensus', change: '用局部邻居信息形成群体行为。', checks: ['comm', 'info']},
  {id: 'event', name: '事件触发', part: 'comm', why: 'event', change: '决定何时测量、更新或发送，而不是一直通信。', checks: ['comm', 'safety']},
  {id: 'learning', name: '强化学习', part: 'learn', why: 'learning', change: '用交互数据优化策略或高层决策。', checks: ['learning', 'safety']},
  {id: 'data', name: '数据驱动 / Hankel', part: 'learn', why: 'data', change: '用测过的数据表述系统行为，减少显式模型。', checks: ['learning', 'info']},
];

export const mapSteps = [
  {title: '定位', text: '先判断方法接在哪一层、哪个部分，解决的是哪个部分的失败。'},
  {title: '看增量', text: '它改变了该部分的能力，还是只换了名字、把条件写成了无条件？'},
  {title: '查假设', text: '按该层对应的局限逐项过：信息、通信、计算、执行、验证。'},
  {title: '做比较', text: '只在同层、同信息、同执行权限的基线下比较；否则“先进”只是标签。'},
];

// Typical named examples for each part: controllers, algorithms and mechanisms a reader will
// meet in papers. Notes say what the example does inside this part, not that it is certified.
export const mapPartExamples = {
  goal: [
    {name: '代价函数（LQR 的 Q/R）', note: '用权重说明多快、多省、谁更重要', why: 'optimal'},
    {name: '约束集合（MPC 的 X、U）', note: '说明哪些状态和输入不许出现', why: 'mpc'},
    {name: '编队 / 覆盖目标', note: '说明群体要形成什么形状或覆盖什么区域'},
    {name: '任务指标（时间、能耗、成功率）', note: '说明什么算完成'},
  ],
  plan: [
    {name: 'MPC（滚动优化）', note: '每一步重新规划并只执行第一步', why: 'mpc'},
    {name: 'A* / RRT', note: '在离散或连续空间里搜一条可行路径'},
    {name: 'MILP / MIQP', note: '把任务分配写成整数优化'},
    {name: '行为树 / 状态机', note: '组织任务模式与切换顺序'},
    {name: '调度器', note: '安排谁在什么时候做什么'},
  ],
  sense: [
    {name: 'LiDAR / 相机 / IMU', note: '测距离、图像与姿态'},
    {name: '目标检测与跟踪', note: '把像素变成带编号的目标'},
    {name: '时间同步与标定', note: '让不同传感器的数据对得上'},
    {name: '数据关联', note: '判断这一帧的目标是不是上一帧那个'},
  ],
  estimate: [
    {name: 'Luenberger 观测器', note: '用模型补出测不到的状态'},
    {name: 'Kalman / EKF / UKF', note: '在噪声中融合模型与测量', why: 'estimate'},
    {name: '粒子滤波', note: '处理非高斯、多峰的不确定'},
    {name: '参数辨识 / 扰动观测器', note: '估计模型参数或外部扰动'},
  ],
  comm: [
    {name: '一致性协议', note: '每个个体只和邻居平均，最后趋于一致', why: 'consensus'},
    {name: '编队控制', note: '维持相对位置或队形偏移'},
    {name: '领导者–跟随者', note: '一个给参考，其余跟随'},
    {name: '事件触发通信', note: '只在需要时发送，而不是一直发', why: 'event'},
    {name: '图拉普拉斯 / 邻接矩阵', note: '描述谁能把信息传给谁'},
  ],
  law: [
    {name: 'P / PI / PID', note: '按误差（及其积分、微分）算输入', why: 'pid'},
    {name: 'LQR', note: '在给定模型和代价下算最优反馈', why: 'optimal'},
    {name: 'H∞ / 鲁棒控制', note: '把不确定性和扰动放进设计', why: 'robust'},
    {name: 'MPC', note: '在线求解带约束的有限时域优化', why: 'mpc'},
    {name: '滑模控制', note: '把状态强行拉到一条滑模面上'},
    {name: '反馈线性化', note: '用非线性变换把系统化成线性'},
    {name: 'CLF-QP', note: '把接近目标写成下降条件再求输入', why: 'clf'},
  ],
  actuate: [
    {name: '电机驱动 / 舵机', note: '把电压或指令变成力矩与角度'},
    {name: '油门 / 刹车 / 轮速', note: '把加速度指令变成车辆动作'},
    {name: 'PWM / 电流环', note: '在底层跟踪期望电流或占空比'},
    {name: '饱和 / 死区 / 抗饱和', note: '处理执行器做不到的部分'},
    {name: '故障与余度', note: '失效时降级或切换执行器'},
  ],
  guard: [
    {name: 'CBF-QP 安全过滤', note: '在允许动作集合里找最接近原动作的输入', why: 'safety'},
    {name: '运行时监控', note: '在线检查假设、状态与性能是否仍成立'},
    {name: '故障检测与诊断（FDI）', note: '发现故障并判断是哪一类'},
    {name: '可达集 / 控制不变集', note: '离线算出一定不会越界的范围'},
    {name: '回退 / 最小风险状态', note: '过滤无解或故障时退到哪'},
  ],
  learn: [
    {name: '系统辨识', note: '从输入输出数据估模型参数'},
    {name: 'MRAC 自适应控制', note: '在线调参数以跟踪参考模型'},
    {name: '强化学习（PPO / SAC）', note: '用交互数据优化策略', why: 'learning'},
    {name: '模仿学习', note: '从示范中学习策略'},
    {name: '数据驱动控制（Hankel / PE）', note: '直接用数据表述系统行为', why: 'data'},
  ],
  evaluate: [
    {name: '跟踪误差 / 超调 / 稳态误差', note: '看跟得准不准、冲不冲过头'},
    {name: '任务成功率 / 完成时间', note: '看任务有没有真的完成'},
    {name: '能耗 / 通信量 / 计算时间', note: '看代价花在哪里'},
    {name: '基线对照 / 消融', note: '看改善是否来自新机制', why: 'research'},
    {name: '最坏情况 / 失败判据', note: '看它在什么条件下会失败'},
  ],
};

// Side examples: pure teaching models with one or more sliders. Only the three parts that
// illustrate a concrete mechanism get a demo, so the panel stays an example, not a second course.
export const mapDemos = [
  {
    part: 'law', kind: 'gain',
    title: '试一个：只调比例增益',
    lead: '简化二阶对象，阻尼固定；增益越大越快，但越容易冲过头。',
    ranges: [{key: 'gain', label: '比例增益 k', min: 0.4, max: 4, step: 0.1, value: 1.2, digits: 1}],
    note: '教学模型：x″ = u，u = k(1 − x) − 0.9ẋ，执行器限幅 ±10；不是论文实验或车辆模型。',
  },
  {
    part: 'comm', kind: 'consensus',
    title: '试一个：调一致增益',
    lead: '三台机器人只和邻居交换位置；增益决定差距缩得多快，接近稳定上限时会来回摆。',
    ranges: [{key: 'gain', label: '一致增益 g', min: 0.05, max: 0.65, step: 0.05, value: 0.2, digits: 2}],
    note: '教学模型：线性一致协议，初始位置 0 / 4 / 14 m，同步更新 40 步，平均位置不变；这条三节点链路的增益超过约 0.66 会发散。',
  },
  {
    part: 'guard', kind: 'barrier',
    title: '试一个：CBF 输入过滤',
    lead: '先算当前状态下允许的输入区间，再把想做的动作压回区间内；区间为空时没有安全动作。',
    ranges: [
      {key: 'margin', label: '安全余量 h', min: 0, max: 1, step: 0.05, value: 0.2, digits: 2},
      {key: 'drift', label: '外界使余量下降的速率 b', min: 0, max: 2, step: 0.1, value: 0, digits: 1},
      {key: 'nominal', label: '想做的输入 u', min: -1, max: 1, step: 0.1, value: -1, digits: 1},
    ],
    note: '教学模型：ḣ = −b + u，要求 ḣ + 2h ≥ 0，即 u ≥ b − 2h，且执行器 −1 ≤ u ≤ 1。不是车辆安全验证。',
  },
];
