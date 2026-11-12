// Drafts live in this page's module memory and never enter persistence or requests.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const actionStages=[
  {id:'question',name:'说清问题',block:'problem-contract',task:'把兴趣缩成一个有条件、有对象、有成功标准的问题。',output:'一页模型／信息／动作／目标／约束定义，加两种可能解释。',done:'别人能据此推进一步，并说出什么结果会否定你的解释。',example:['少广播后的误差增大，是消息保持造成，还是更新顺序错误？','先手算并核对同步第一步，再固定图、初值、增益和 60 步，写清通信比较条件。','一页问题定义；同步第一步 [14,34,66,86] 的核对记录。','只核对模型和一步执行；若顺序不符，停止性能解释并保留错误记录。','待执行。写下结果后再决定比较通信机制，或先修复更新顺序。']},
  {id:'literature',name:'核对已有方法',block:'literature-gap',task:'带着一个条件差距核对最近邻方法，并记录阅读深度。',output:'同任务假设表，DOI／版本／页码，已解决与未核对项。',done:'能说出谁已经解决什么，以及当前问题还剩哪项欠账。',example:['最近邻事件触发方法是否已经处理我关心的时延和输入限制？','围绕这两个条件查引用链；对照最接近方法的模型、信息、保证和证明假设。','一张带来源页码的比较表；读不到或没读到的列标未核对。','先限定本轮检索范围；若近邻已经解决同问题，撤回空白主张，不用换名称包装。','待核对。填写继续查哪条依据，或如何修改问题定义。']},
  {id:'model',name:'建立最小机制',block:'minimal-study',task:'选一个手算、引理或反例，先查机制在最小条件下是否成立。',output:'逐步推导／可核对反例／与手算对齐的单步程序。',done:'知道证据排除了哪个解释，哪些假设仍然必要。',example:['同一个反馈能否在扰动界扩大后仍保持区间？','手算 x⁺=x+u+w，|x|≤1、|u|≤0.2；对比 |w|≤0.1 和 0.3 的边界。','小扰动下候选 u=−0.2x 的区间推导；x=1,w=0.3 的反例。','仅检查这两个解析条件，不扩展搜索；不把候选失败直接写成所有方法失败。','待手算。若最大负输入仍无法保持边界，写清该条件下的不可行性。']},
  {id:'compare',name:'设计并核对比较',block:'experiment-design',task:'固定一组同条件基线与候选，运行前写判据。',output:'运行前协议、全程记录、好处／成本／失败对照。',done:'指标能从原始记录重算，结论只覆盖预设范围。',example:['在固定教学模型中，θ=5 的广播减少伴随多少末端分歧？','网页通信例子中分别查看每步发布和阈值发布，保持图、初值、增益与 60 步一致。','双方的节点广播总数、末端分歧与完整时间线；初始 4 次发布都计入。','只做这组教学对照；任务容差若未事先定义，只报告权衡，不宣布更优。','待记录。教学核对值为每步 244 次、θ=5 为 34 次；再从记录解释误差代价。']},
  {id:'diagnose',name:'定位一次失败',block:'failure-diagnosis',task:'找到第一处分歧，用一个检查区分两个原因。',output:'失败条件、预期与实际、候选原因、诊断结果。',done:'能分清实现错误、假设缺口或方法局限；不清楚就标原因未定。',example:['第一步均值为什么从 50 变成 50.288？','比较保存旧状态的同步实现与原地覆盖实现，只检查这一轮。','预期 [14,34,66,86]；原地覆盖 [14,34.8,66.96,85.392]；逐项读写记录。','仅诊断更新顺序；保留旧记录，不同时改增益或拓扑。','待检查。若确认实现不同，修复后重新开始同条件比较，不能当作算法收益。']},
  {id:'decide',name:'写结论并决定下一步',block:'research-decision',task:'把证据写成有限结论，决定继续、修改、修复或停止。',output:'一段结论、适用边界、证据位置和下一件事。',done:'下一动作由当前证据触发，负结果与代价没有被删掉。',example:['本轮证据支持优势、权衡，还是暂时无法解释？','对照运行前判据；检查各个体成本、失败与信息条件是否一致。','在条件 C 与范围 S 下，相对基线 B 得到 R；代价 K，尚不能推出 U。','若协议或信息不匹配，停止优势解释；若没有新可检验问题，不继续扩网格。','待整理。选择继续验证／修改假设／修复实现／暂时停止，并写理由和一个下一动作。']},
];
export const actionFields=[['question','本轮要消除的一个疑问'],['action','只做的一件事'],['artifact','要留下的材料与完成标准'],['limit','范围、预算与停止条件'],['decision','实际结果、解释与下一步']];
let selectedStage='question';
const drafts={};
export function actionsHTML(){return `<section class="guide-section research-actions" aria-labelledby="action-heading"><h2 id="action-heading">本轮行动单：把一个疑问变成一次检查</h2><p>先选眼前卡住的环节，再写一件可以完成的事。可以走理论推导、反例或数值验证，阶段可往返。填写内容仅在当前页面内存中保留；切换本站视图可回来，刷新或关闭会清空，请主动下载。</p><label for="action-stage">我现在卡在哪里<select id="action-stage">${actionStages.map(x=>`<option value="${x.id}">${x.name}</option>`).join('')}</select></label><div id="action-guidance"></div><div class="workbook-actions"><button class="secondary-button" id="action-example">填入本阶段示例</button><button class="ref-link" id="action-clear">清空本阶段草稿</button></div><form id="action-form" class="workbook-fields">${actionFields.map(([id,label])=>`<label for="action-${id}">${label}<textarea id="action-${id}" rows="3" maxlength="2000"></textarea></label>`).join('')}</form><p id="action-status" role="status"></p><details class="draft-preview"><summary>预览本轮行动单</summary><pre id="action-preview"></pre></details><div class="workbook-actions"><button class="primary-button" id="action-download">下载本轮行动单 .md</button><button class="secondary-button" id="action-copy">复制行动单</button></div><p class="small-copy">示例展示研究写法，数值来自自编教学模型。填满表格不代表已经完成验证或发现创新。此工具不执行实验，也不启动研究任务。</p></section>`;}
export function actionMarkdown(stage,values){return `# 本轮研究行动单\n\n阶段：${stage.name}\n状态：自填草稿；示例需独立核对，未认证研究完成或新颖性。\n\n${actionFields.map(([id,label])=>`## ${label}\n\n${values[id]?.trim()||'待填写'}\n`).join('\n')}\n日期：${new Date().toLocaleDateString('sv-SE')}\n`;}
export function mountActions(root){
  const select=root.querySelector('#action-stage');
  const fields=Object.fromEntries(actionFields.map(([id])=>[id,root.querySelector('#action-'+id)]));
  const status=root.querySelector('#action-status');
  const stage=()=>actionStages.find(x=>x.id===selectedStage);
  const values=()=>Object.fromEntries(Object.entries(fields).map(([id,el])=>[id,el.value]));
  function update(){drafts[selectedStage]=values();root.querySelector('#action-preview').textContent=actionMarkdown(stage(),drafts[selectedStage]);status.textContent='当前阶段草稿仅在页面内存中；填写后请核对依据并下载保管。';}
  function show(){const item=stage();select.value=selectedStage;root.querySelector('#action-guidance').innerHTML=`<dl class="action-guidance"><dt>现在做什么</dt><dd>${esc(item.task)}</dd><dt>留下什么</dt><dd>${esc(item.output)}</dd><dt>怎样算完成</dt><dd>${esc(item.done)}</dd></dl><button class="term-link" data-block="${item.block}">阅读这一步的做法与例子</button>`;for(const id in fields)fields[id].value=drafts[selectedStage]?.[id]||'';update();}
  select.addEventListener('change',()=>{update();selectedStage=select.value;show();});
  root.querySelector('#action-form').addEventListener('submit',e=>e.preventDefault());
  for(const field of Object.values(fields))field.addEventListener('input',update);
  root.querySelector('#action-example').addEventListener('click',()=>{for(const [i,[id]]of actionFields.entries())fields[id].value=stage().example[i];update();status.textContent='已填入教学示例。请修改为自己的问题；示例不是已执行的研究记录。';});
  root.querySelector('#action-clear').addEventListener('click',()=>{for(const field of Object.values(fields))field.value='';update();});
  root.querySelector('#action-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(actionMarkdown(stage(),values()));status.textContent='行动单已复制。';}catch{status.textContent='浏览器不允许复制，请下载或从预览手动复制。';}});
  root.querySelector('#action-download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([actionMarkdown(stage(),values())],{type:'text/markdown;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='research-action-'+selectedStage+'.md';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='已生成本阶段行动单下载，请按浏览器提示保存。其他阶段草稿仍只在页面内存中。';});
  show();return ()=>{};
}
