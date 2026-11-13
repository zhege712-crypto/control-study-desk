import {historyChapters,relations,relationTypes,conceptNames} from './history-content.js';
import {feedbackTrace,feedbackModes} from './history-models.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const historyRoutes=['overview','feedback','oscillation','network','map','sources'];
const labels={overview:'控制史长文',feedback:'反馈为什么有效',oscillation:'为什么也会振荡',network:'走向多智能体',map:'知识关系图',sources:'文献与阅读范围'};
const chapterButton=(id,label)=>`<button class="${id==='overview'?'secondary-button':'term-link'}" data-history-chapter="${id}">${label}</button>`;
function references(sources,ids){return `<section class="guide-section history-references"><h2>文献与本页使用范围</h2><p>正文中的编号可定位下面的条目。链接在外部打开；本网站不分发论文副本。元数据核对不等于读过正文，选段阅读也不等于完整证明审计。</p>${ids.map(id=>{
  const p=sources.find(p=>p.id===id);if(!p)return `<p>文献 ${esc(id)} 暂未载入，请刷新页面。</p>`;
  const pageLink=p.read_pages.length?`${p.access_url}#page=${p.read_pages[0]}`:p.access_url;
  return `<details id="history-source-${p.id}"><summary>${p.id} · ${p.year} · ${esc(p.title)}</summary><div><p>${esc(p.authors.join('; '))}<br>${esc(p.venue)} ${esc(p.volume)}${p.issue?`(${esc(p.issue)})`:''}: ${esc(p.pages)}</p><p><a href="https://doi.org/${encodeURI(p.doi)}" target="_blank" rel="noopener noreferrer">DOI: ${esc(p.doi)}</a> · <a href="${esc(pageLink)}" target="_blank" rel="noopener noreferrer">${p.read_pages.length?'外部公开版本／选读位置':'摘要与获取入口'}</a></p><p><strong>版本：</strong>${esc(p.version)}<br><strong>实际阅读：</strong>${esc(p.reading_depth)}<br><strong>用途：</strong>${esc(p.scope)}</p><p class="small-copy">书目核对：${esc(p.metadata_checked)}，<a href="${esc(p.metadata_url)}" target="_blank" rel="noopener noreferrer">Crossref 元数据</a>。外部副本的公开可访问性不等于授予再分发许可。</p></div></details>`;
}).join('')}</section>`;}
function timeline(sources){return `<section class="guide-section"><h2>按发表年查看代表文献</h2><p>这些年份标记所选文献，不表示方法在该年首次诞生，也不表示后来的路线替代了前面的路线。</p><ol class="history-timeline">${[...sources].sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id)).map(p=>`<li><span>${p.year}</span><button class="history-cite" data-history-ref="${p.id}">${esc(p.title)} [${p.id}]</button></li>`).join('')}</ol></section>`;}
function teachingLabHTML(delayed){return `<section class="guide-section history-lab"><h2>动手核对：同一增益，信息晚一拍会怎样？</h2><p>无量纲直接状态更新 e⁺=e+u，e₀=4；延迟模式还设 e₋₁=4。固定十二次更新，无噪声、输入限制或执行器动态。曲线来自下列递推，不是论文实验。</p><div class="lab-controls"><label for="history-gain">每步反馈增益 g<select id="history-gain"><option value="0.5">0.5</option><option value="1.2">1.2</option><option value="1.5">1.5</option><option value="2">2.0</option><option value="2.5">2.5</option></select></label><label for="history-delay"><input id="history-delay" type="checkbox" ${delayed?'checked':''}/>动作使用上一拍误差</label></div><div id="history-formula"></div><div id="history-trace"></div><p id="history-observation" class="lab-observation" role="status"></p><details class="thinking-question"><summary>先预测 g=1.2：无延迟与一拍延迟会分别怎样？</summary><p>无延迟的倍率 −0.2 在单位圆内；一拍延迟的共轭根模长 √1.2≈1.095，大于 1。稳定判断来自解析根，不是只观察十二步曲线。增益不变、信息日程改变，原条件就不再适用。</p></details><p><a href="./examples/history_feedback.py" download>下载相同递推的 Python 教学代码</a> · <button class="term-link" data-study-view="research">把本轮检查写进行动单</button></p></section>`;}
function mapHTML(){return `<h1>知识关系图：读懂连线为什么存在</h1><p class="guide-intro">选一个概念，只展开与它相连的局部关系。每条线都标明方向和含义；“关注区别”不表示两种方法互斥，也不表示可以互换保证。</p><label class="history-filter" for="history-relation">按关系查看<select id="history-relation"><option value="all">全部关系</option>${Object.entries(relationTypes).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><div class="history-nodes" aria-label="选择关系中心">${Object.entries(conceptNames).map(([id,name])=>`<button class="secondary-button" data-history-node="${id}" aria-pressed="${id==='feedback-basics'}">${name}</button>`).join('')}</div><div id="history-map-result" aria-live="polite"></div><section class="guide-section"><h2>沿着关系完成一次推理</h2><p>例如先选“反馈”，检查它为何引出稳定性；再选“稳定性与收敛”，检查为什么仍需要单独讨论安全。每到一个节点，试着补一句“因为……所以需要……”，再打开原知识区块核对。</p><p>这些连线是教学组织，条件线只描述对应理论构件的作用，不把某一种设计当作唯一可能。涉及具体定理时，应继续回到论文及其假设。</p></section>`;}
export function historyHTML(id='overview',sources=[]){
  if(!historyRoutes.includes(id))id='overview';
  const tabs=`<nav class="history-tabs" aria-label="发展历程章节">${historyRoutes.map(key=>`<button data-history-chapter="${key}" ${key===id?'aria-current="page"':''}>${labels[key]}</button>`).join('')}</nav>`;
  if(id==='map')return `<section class="history-page">${tabs}${mapHTML()}</section>`;
  if(id==='sources')return `<section class="history-page">${tabs}<h1>控制理论发展与研究方法：补充文献</h1><p class="guide-intro">${sources.length} 篇文献补充控制史与方法背景，另保留原阅读器五篇论文。${sources.filter(p=>p.reading_level==='selected-text').length} 篇进行了选段阅读，${sources.filter(p=>p.reading_level==='abstract').length} 篇读到摘要，${sources.filter(p=>p.reading_level==='metadata').length} 篇只核对书目；各自范围在条目中列明。</p><p><a href="./history-references.bib" download>下载 ${sources.length} 篇文献的 BibTeX</a></p>${timeline(sources)}${references(sources,sources.map(p=>p.id))}</section>`;
  const c=historyChapters.find(c=>c.id===id),next=historyChapters[historyChapters.indexOf(c)+1];
  return `<article class="history-page">${tabs}<header><h1>${c.title}</h1><p class="guide-intro">${c.subtitle}</p><p class="small-copy">中文讲解保留英文术语。历史出处、教学推导与研究练习分别标注。${id==='overview'?'长文按时代连续叙述，三篇手算样章可在正文后接续阅读。':''}</p></header>${id==='overview'?`<details class="history-contents" open><summary>本篇目录 · ${c.sections.length} 节</summary><ol>${c.sections.map((section,i)=>`<li><button class="term-link" data-history-section="${i}">${section.title}</button></li>`).join('')}</ol></details>`:''}${c.sections.map((s,i)=>`<section class="guide-section" id="history-section-${i}"><h2>${s.title}</h2>${s.html}</section>`).join('')}${['feedback','oscillation'].includes(id)?teachingLabHTML(id==='oscillation'):''}${id==='overview'?timeline(sources):''}<section class="guide-section"><h2>沿着联系继续</h2>${next?chapterButton(next.id,'下一篇：'+next.title):chapterButton('map','打开知识关系图')} · ${chapterButton('sources','查看全部补充文献')} · <button class="term-link" data-study-view="research">进入研究行动单</button></section>${references(sources,c.refs)}</article>`;
}
function renderMath(root){root.querySelectorAll('[data-math]').forEach(el=>window.katex?.render(el.dataset.math,el,{displayMode:true,throwOnError:false,trust:false}));}
function mountLab(root){
  const gain=root.querySelector('#history-gain'),delay=root.querySelector('#history-delay');
  function draw(){
    const g=Number(gain.value),d=delay.checked,trace=feedbackTrace({gain:g,delay:d}),modes=feedbackModes(g,d);
    const formula=d?String.raw`e_{k+1}=e_k-ge_{k-1},\quad\lambda^2-\lambda+g=0`:String.raw`e_{k+1}=(1-g)e_k`;
    const formulaEl=root.querySelector('#history-formula');formulaEl.innerHTML=`<div class="math" data-math="${formula}"></div>`;renderMath(formulaEl);
    const lo=Math.min(0,...trace.map(p=>p.e)),hi=Math.max(0,...trace.map(p=>p.e)),span=Math.max(1,hi-lo),y=e=>165-(e-lo)/span*130;
    root.querySelector('#history-trace').innerHTML=`<figure class="history-figure"><figcaption>误差 e（无量纲）与更新步 k；纵轴随数据范围调整</figcaption><svg viewBox="0 0 600 220" role="img" aria-label="十二次教学更新的误差曲线；精确值在后面的表格中"><path d="M70 25V165H560" class="plot-axis"/><text x="6" y="38">${hi.toFixed(1)}</text><text x="6" y="167">${lo.toFixed(1)}</text><text x="65" y="192">0</text><text x="530" y="192">12 步</text><polyline points="${trace.map(p=>`${70+p.k/12*490},${y(p.e)}`).join(' ')}" fill="none" stroke="#265b87" stroke-width="2.5"/></svg></figure><details class="thinking-question"><summary>展开逐步记录：旧误差、动作与下一状态</summary><div class="table-scroll"><table class="study-table"><thead><tr><th>更新步</th><th>当前 e</th><th>上步动作使用的误差</th><th>上步施加 u</th></tr></thead><tbody>${trace.map(p=>`<tr><th>${p.k}</th><td>${p.e.toFixed(4)}</td><td>${p.used===null?'—':p.used.toFixed(4)}</td><td>${p.u===null?'—':p.u.toFixed(4)}</td></tr>`).join('')}</tbody></table></div></details>`;
    root.querySelector('#history-observation').textContent=`${d?'一拍延迟':'无延迟'}，g=${g.toFixed(1)}。${modes.text}，最大根模长 ${modes.radius.toFixed(3)}；${modes.stable?'在此精确递推中误差渐近衰减。':Math.abs(modes.radius-1)<1e-9?'位于单位圆边界，不能得出渐近衰减。':'存在增长模态，不能保持渐近稳定。'} 该判断不替代物理系统、输入约束或安全分析。`;
  }
  gain.addEventListener('change',draw);delay.addEventListener('change',draw);draw();
}
export function mountHistory(root,id){
  renderMath(root);
  const listener=event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.historySection!==undefined){const target=root.querySelector('#history-section-'+button.dataset.historySection);if(target){target.scrollIntoView({behavior:'instant',block:'start'});const heading=target.querySelector('h2');heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});}}
    if(button.dataset.historyRef){const el=root.querySelector('#history-source-'+button.dataset.historyRef);if(el){el.open=true;el.scrollIntoView({behavior:'instant',block:'start'});el.querySelector('summary')?.focus({preventScroll:true});}}
  };
  root.addEventListener('click',listener);
  let mapListener;
  if(id==='map'){
    let selected='feedback-basics';const filter=root.querySelector('#history-relation');
    function draw(){const edges=relations.filter(r=>(r.from===selected||r.to===selected)&&(filter.value==='all'||r.type===filter.value));root.querySelectorAll('[data-history-node]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.historyNode===selected)));root.querySelector('#history-map-result').innerHTML=`<section class="guide-section"><h2>${conceptNames[selected]}的关系</h2><p><button class="term-link" data-block="${selected}">阅读这个概念的完整区块</button></p>${edges.length?`<ul class="history-edges">${edges.map(r=>`<li><div class="history-edge-line"><button data-history-node="${r.from}">${conceptNames[r.from]}</button><span>${relationTypes[r.type]}<svg viewBox="0 0 100 14" aria-hidden="true"><path d="M1 7h94m-7-5 7 5-7 5"/></svg></span><button data-history-node="${r.to}">${conceptNames[r.to]}</button></div><p>${r.why}</p></li>`).join('')}</ul>`:'<p>这个概念在当前关系筛选下没有连线。请选择“全部关系”，或换一个概念。</p>'}</section>`;}
    mapListener=event=>{const b=event.target.closest('[data-history-node]');if(b&&Object.hasOwn(conceptNames,b.dataset.historyNode)){selected=b.dataset.historyNode;draw();}};
    root.addEventListener('click',mapListener);filter.addEventListener('change',draw);draw();
  }
  if(root.querySelector('#history-gain'))mountLab(root);
  return ()=>{root.removeEventListener('click',listener);if(mapListener)root.removeEventListener('click',mapListener);};
}
