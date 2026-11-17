import {methodChapters,methodById,methodIds,conceptMethods,paperMethods,acronymRoles,evidenceRows} from './why-content.js?v=20261117-why1';
import {inlineVisual} from './visual-math.js?v=20261117-visual2';
import {blocks} from './content.js';
const conceptNames=new Map(blocks.map(b=>[b.id,b.title]));
export {methodIds};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const go=(id,label)=>`<button class="term-link" data-why="${esc(id)}">${esc(label)}</button>`;
const section=(title,html,id='')=>`<section class="guide-section"${id?` id="${id}"`:''}><h2>${title}</h2>${html}</section>`;
const para=s=>`<p>${esc(s)}</p>`;
export function methodContext(key,paper=false){
  const c=methodById.get((paper?paperMethods:conceptMethods)[key]);
  return c?`<aside class="why-context" aria-label="这个知识解决什么问题"><p><strong>先问它解决什么：</strong>${esc(c.title)}</p><p>${esc(c.achieved)}</p>${go(c.id,'看具体困难、成立条件与未解决的问题')}</aside>`:'';
}
export function whyMatches(query){
  const q=query.trim().toLocaleLowerCase();if(!q)return [];
  return methodChapters.filter(c=>[...Object.values(c).flat(),...acronymRoles.filter(a=>a[4]===c.id).flat()].join(' ').toLocaleLowerCase().includes(q));
}
export const whyResultsHTML=results=>results.map(c=>`<article class="why-index-row"><h2>${go(c.id,c.title)}</h2><p class="small-copy">${esc(c.abbr)} · ${esc(c.role)}</p><p>${esc(c.problem)}</p></article>`).join('');

function architectureFigure(){
  const labels=[['任务','谁先过门？'],['估计','现在在哪？'],['决策','下一步做什么？'],['过滤','动作是否允许？'],['执行','实际做到了什么？']];
  return `<figure class="why-chain"><svg viewBox="0 0 520 390" role="img" aria-labelledby="why-chain-title why-chain-desc"><title id="why-chain-title">从任务到实际运动，再从测量回到决策</title><desc id="why-chain-desc">五个模块沿箭头传递信息与动作。右侧回路线代表测量反馈。每个模块的输入假设必须与上游实际输出一致。</desc><defs><marker id="why-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="#526577"/></marker></defs>${labels.map(([a,b],i)=>`<rect x="18" y="${14+i*70}" width="354" height="48" fill="#fff" stroke="#526577"/><text x="36" y="${45+i*70}" fill="#234f75">${a}</text><text x="110" y="${45+i*70}" fill="#526577">${b}</text>${i<4?`<path d="M195 ${62+i*70}v22" stroke="#526577" fill="none" marker-end="url(#why-arrow)"/>`:''}`).join('')}<path d="M372 318H450V108H375" stroke="#526577" stroke-width="2" fill="none" marker-end="url(#why-arrow)"/><text x="390" y="220" fill="#526577">测量</text></svg><figcaption>自编结构图。箭头表示信息或动作传递，不表示模块拼接后已获得整体保证。最终评价的是实际执行后的运动。</figcaption></figure>`;
}
function overviewHTML(){
  return `<article class="history-page why-page"><header><h1>为什么需要这些控制方法？</h1><p class="guide-intro">先看机器人遇到了什么困难，再问哪种机制有用。缩写的价值，取决于它改变了什么，以及有什么证据说明改变有效。</p></header><nav class="history-tabs" aria-label="主线页目录"><button data-why-jump="why-problems">按困难选读</button><button data-why-jump="why-roles">辨认缩写的角色</button><button data-why-jump="why-evidence">检查有效的证据</button></nav>
  ${section('它们确实解决了一些问题，但“解决”需要说完整',`<p>反馈让动作能够根据实际结果修正；估计器让不完整、带噪的观测成为可用状态；预测控制把未来影响和约束放进决策；一致性理论解释局部交互怎样形成群体行为；安全证书把“不能越过边界”变成可检查条件。这些都是实质进展。它们各自回答的却是不同问题，因此不能只用“更先进”来排序。</p><p>一个完整结论应该说：<strong>对什么对象，在什么信息与控制能力下，针对哪种困难，比什么方法改善了哪种性质，新增了多少成本，仍会在哪里失败。</strong>离开这些内容，只说“采用 MPC、CBF 或 DRL”，还不能判断问题是否被解决。</p>`)}
  ${section('从三台机器人过一道窄门开始',`<p>三台移动机器人要把物品运到门的另一侧。每台都能走，并不意味着队伍能完成任务。地面变化会使速度不准；定位噪声使距离判断出错；各自追目标可能在门口相互堵住；无线消息会过期；急刹能力有限；不碰撞也可能一直等待。</p><p>这些失败没有一个统一的“算法按钮”。先把它们拆开，才能判断是需要改控制律、补状态估计、增加协调规则，还是任务本身已超出物理能力。部分章节用 3–5 车跟驰／协作作对照，但车辆的转向、制动与串稳定问题需要单独建模。</p>${architectureFigure()}<p>${go('architecture','沿模块接口追查一次失败')}，或直接从下面的一种困难进入。</p>`)}
  ${section('按困难选入口，不按缩写背目录',`<div class="why-index">${whyResultsHTML(methodChapters)}</div>`,'why-problems')}
  ${section('这些字母并不是同一类东西',`<p>把 CAV、CBF、QP、PE 当成四个互相竞争的控制器，会从一开始就比较错对象。先识别它是研究对象、功能、控制律、估计器、条件还是求解问题，再讨论是否有用。</p><dl class="why-roles">${acronymRoles.map(([a,en,role,explanation,id])=>`<div><dt>${go(id,a)}<span>${esc(en)}</span></dt><dd><strong>${esc(role)}</strong>。${esc(explanation)}</dd></div>`).join('')}</dl>`,'why-roles')}
  ${section('控制理论的发展，是困难不断暴露的历史',`<p>蒸汽机械、过程工业和电气放大使人们认识到：有反馈不等于稳定，调得更强还可能引起振荡。频域与稳定性分析使“什么时候会振荡”成为可分析的问题。后来，航空航天、估计和多变量系统推动状态空间方法，研究者不仅要调一条误差曲线，还要描述内部状态、观测与多指标取舍。</p><p>数字计算与工业约束推动滚动优化进入控制回路，MPC 把“现在动这一步，后面还能不能做”带进在线决策。网络化、多机器人和无线资源又引出了局部协调、时延与触发通信。自主系统的风险边界、数据可得性与复杂决策进一步推动安全过滤、数据驱动和学习方法。</p><p>这些路径相互交叉，也长期并存。PID 没有因为 MPC 出现而失去价值，学习也没有消除反馈、模型与验证的需求。技术史更接近“每增加一种约束，就要补一种解释和工具”，而不是旧方法不断被新名字取代。</p><p>本段为依据现有选读资料的历史综合，详细出处和阅读层级见 ${go('feedback','反馈的工程问题')} 与 <button class="term-link" data-history-chapter="overview">控制史长文及十五篇来源</button>。</p>`)}
  ${section('论文说“有效”，究竟是哪一种证据？',`<p>理论与实验承担不同任务。证明可以覆盖一类满足假设的对象；硬件实验可以暴露证明没有建模的行为；有限实验不能代替一般证明，定理也不能代替检查实机是否满足假设。</p><div class="why-table-scroll" role="region" aria-label="证据与结论范围" tabindex="0"><table><thead><tr><th>证据</th><th>能够支持</th><th>不能直接推出</th></tr></thead><tbody>${evidenceRows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>本站每章把“已经解决的部分”与“仍未解决的部分”放在一起。论文出处沿用现有版本和实际阅读记录；新写的算例与图是教学构造，没有把未读证明或未做实验记为已完成。</p>`,'why-evidence')}
  ${section('先练习一次：谁真的解决了任务？',`<p>下面是人为构造的评价记录，用来识别指标之间的区别，不来自仿真或论文实验。任务约定：三台机器人都要在 30 秒内过门，全程无接触；任一项失败即为任务失败。</p><div class="why-table-scroll" role="region" aria-label="教学比较记录" tabindex="0"><table><thead><tr><th>教学方案</th><th>平均跟踪误差</th><th>接触次数</th><th>全部过门时间</th></tr></thead><tbody><tr><td>A</td><td>0.10 m</td><td>1</td><td>18 s</td></tr><tr><td>B</td><td>0.25 m</td><td>0</td><td>24 s</td></tr><tr><td>C</td><td>0.05 m</td><td>0</td><td>未全部通过</td></tr></tbody></table></div><details><summary>查看判断及仍缺少的证据</summary><p>A 跟踪误差较小，但发生接触，未满足任务；C 也没有完成过门。B 在这条教学记录上同时满足时限与无接触。没有输入、能耗、最坏计算时间和独立重复试验，不能进一步说 B 在所有方面最好，或已经证明一般安全。</p><p>该例说明评价标准要先于结果确定。用一个方便优化的平均误差代替完整任务，会把碰撞或停滞藏起来。</p></details>`)}
  ${section('把读懂一个方法，变成一份能检查的产出',`<p>读完任意一章，试着写出：<strong>原方案在什么条件下发生哪种失败；新机制如何改变它；什么观察会推翻我的解释。</strong>然后补上比较器、信息与动作权限、主指标、成本和停止条件。暂时写不出来，就回到困难本身，不急着增加另一个缩写。</p><p>${go('research','查看完整研究问题示例')} · <button class="term-link" data-study-view="research">填写研究行动单</button> · <button class="term-link" data-study-view="visuals">用图补数学基础</button></p>`)}
  </article>`;
}
function sourceHTML(ids,sources){
  return `<div class="why-sources">${ids.map(id=>{const p=sources.find(p=>p.id===id);if(!p)return '';return `<details><summary>${esc(id)} · ${esc(p.title)} · ${p.year}</summary><p>${esc(p.authors?.join('; '))}<br>${esc(p.venue)}<br><a href="https://doi.org/${encodeURI(p.doi)}" target="_blank" rel="noopener noreferrer">DOI ${esc(p.doi)}</a></p><p><strong>采用版本：</strong>${esc(p.version)}<br><strong>实际阅读：</strong>${esc(p.reading_depth||p.reading_level||'见论文记录')}<br><strong>已记录文件页序：</strong>${p.read_pages?.length?p.read_pages.join('、'):'未记录正文选读页'}</p><p>此条是本章相关背景或机制来源。章节中的概括与手算为教学综合；只读摘要或局部正文的来源不作为完整定理审计。</p><button class="term-link" data-study-paper="${id}">查看本篇词汇、贡献与来源说明</button></details>`;}).join('')}</div>`;
}
export function whyHTML(id,sources){
  if(!id||id==='overview')return overviewHTML();
  const c=methodById.get(id);if(!c)return overviewHTML();
  return `<article class="history-page why-page"><nav class="history-tabs" aria-label="问题主线导航">${go('overview','返回全部问题')}<button data-study-view="research">研究行动单</button></nav><header><h1>${esc(c.title)}</h1><p class="guide-intro">${esc(c.abbr)}</p><p>${esc(c.role)}</p></header>
    ${section('先看原来的困难',para(c.problem)+para(c.simple))}
    ${section('简单方案缺了哪一环',para(c.failure)+para(c.mechanism))}
    ${section('用一个可以核对的例子理解',para(c.example)+inlineVisual(c.visual,{caption:'数学预备图：展示本章涉及的基础关系，不代表完整机器人模型'}))}
    ${c.math?`<details class="why-formula"><summary>再把例子连接到数学语言</summary><div class="math" data-math="${esc(c.math)}"></div>${para(c.symbols)}</details>`:''}
    ${section('它确实解决了哪一部分',para(c.achieved))}
    ${section('结论依赖什么条件',para(c.conditions))}
    ${section('哪些困难仍然存在',para(c.unresolved))}
    ${section('为这种改善付出什么',para(c.cost))}
    ${section('怎样判断在自己的问题里是否有效',para(c.evaluate)+`<p><button class="term-link" data-study-view="research">把判断写成研究行动单</button></p>`)}
    ${section('回到概念与下一种困难',`<p>下面是相邻问题，不是方法先进程度的排序。</p><div class="why-related">${c.related.map(b=>`<button class="secondary-button" data-block="${b}">${esc(conceptNames.get(b))}</button>`).join('')}</div><ul>${c.next.map(id=>`<li>${go(id,methodById.get(id).title)}</li>`).join('')}</ul>`)}
    ${section('论文依据、版本与实际阅读',sourceHTML(c.sources,sources))}
  </article>`;
}
export function mountWhy(root){
  root.querySelectorAll('[data-math]').forEach(el=>window.katex?.render(el.dataset.math,el,{displayMode:true,throwOnError:false,trust:false,strict:'ignore'}));
  const jump=event=>{
    const button=event.target.closest('[data-why-jump]');if(!button)return;
    const target=root.querySelector('#'+button.dataset.whyJump),main=root.closest('main');
    if(!target||!main)return;
    main.scrollTo({top:main.scrollTop+target.getBoundingClientRect().top-main.getBoundingClientRect().top-20,behavior:'instant'});
    const heading=target.querySelector('h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});
  };
  root.addEventListener('click',jump);
  return()=>root.removeEventListener('click',jump);
}
