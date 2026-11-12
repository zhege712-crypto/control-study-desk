import { groups, blocks } from './content.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
  arrow:'M5 12h14m-6-6 6 6-6 6', back:'M19 12H5m6-6-6 6 6 6', prev:'m14 6-6 6 6 6', next:'m10 6 6 6-6 6',
  minus:'M5 12h14', plus:'M5 12h14M12 5v14', external:'M14 4h6v6m0-6L10 14M10 5H5v14h14v-5',
  expand:'M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4', link:'m10 13 4-4m-5 6-2 2a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0m2 1 2-2a4 4 0 0 1 5 5l-4 4a4 4 0 0 1-5 0', book:'M3 5h6a3 3 0 0 1 3 3v13a4 4 0 0 0-4-2H3zm18 0h-6a3 3 0 0 0-3 3v13a4 4 0 0 1 4-2h5z',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
const blockById = new Map(blocks.map(b => [b.id,b]));
const groupById = new Map(groups.map(g => [g.id,g]));
const STORE = 'paper-study-desk-v1';
const IS_PUBLIC = document.documentElement.dataset.edition === 'public';
const asset = path => new URL(path, import.meta.url).href;
const localFiles = new Map();
const localUrls = new Map();
const defaultState = {view:'overview',group:'all',block:null,q:'',paper:'V01',page:5,context:'recursive'};
let state = {...defaultState};
let papers = [], paperById;
let pdfModulePromise, renderTask, textTask, generation = 0, resizeTimer, toastTimer;
let zoom = 1, readerHidden = false, readerWide = false;
let lastRenderedWidth = 0;
const documents = new Map();

function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'),3500);
}
function persist() {
  try { localStorage.setItem(STORE,JSON.stringify({...state,q:undefined})); } catch { /* Reading remains usable if storage is blocked. */ }
}
function locationForState() {
  const p = new URLSearchParams();
  if (state.view === 'detail' && state.block) p.set('block',state.block);
  if (state.view === 'library') p.set('view','papers');
  if (state.group !== 'all') p.set('group',state.group);
  p.set('paper',state.paper); p.set('page',state.page);
  return '#'+p.toString();
}
function updateLocation(push=false) {
  history[push?'pushState':'replaceState'](null,'',locationForState());
  persist();
}
function applyLocation() {
  const p = new URLSearchParams(location.hash.slice(1));
  state = {...defaultState};
  if (blockById.has(p.get('block'))) {state.block=p.get('block');state.view='detail';state.context=state.block;}
  if (p.get('view')==='papers') state.view='library';
  if (groupById.has(p.get('group'))) state.group=p.get('group');
  if (paperById.has(p.get('paper'))) state.paper=p.get('paper');
  const page = Number(p.get('page'));
  if (Number.isFinite(page) && page>0) state.page=Math.max(1,Math.min(Math.trunc(page),paperById.get(state.paper).pages));
}
function formatMath(root) {
  if (!window.katex) return;
  root.querySelectorAll('[data-math]').forEach(el => {
    try { window.katex.render(el.dataset.math,el,{displayMode:el.classList.contains('math'),throwOnError:false,strict:'ignore',trust:false}); }
    catch { el.textContent=el.dataset.math; }
  });
}
function sourcePill(reference) {
  return `<button class="source-pill" data-source="${reference.paper}" data-page="${reference.page}" title="打开 ${reference.paper}，PDF 第 ${reference.page} 页">${icon('book')}<span>${reference.paper} · 第 ${reference.page} 页</span></button>`;
}
function renderNavigation() {
  $('#block-count').textContent=`学习内容 · ${blocks.length} 个区块`;
  $('#group-nav').innerHTML=groups.map(g => `<button class="group-button ${state.view!=='library'&&state.group===g.id?'active':''}" data-group="${g.id}" ${state.view!=='library'&&state.group===g.id?'aria-current="page"':''}><span>${g.name}</span><small>${g.id==='all'?blocks.length:blocks.filter(b=>b.group===g.id).length}</small></button>`).join('');
  $('#library-button').setAttribute('aria-pressed',String(state.view==='library'));
}
function renderOverview() {
  const query=state.q.trim().toLocaleLowerCase();
  const filtered=blocks.filter(b => (state.group==='all'||b.group===state.group) && (!query||[b.title,b.term,b.intro,...b.tags,...b.refs.map(r=>r.paper),...b.sections.map(s=>s.html.replace(/<[^>]*>/g,' '))].join(' ').toLocaleLowerCase().includes(query)));
  const group=groupById.get(state.group);
  const title=query?'找到相关的知识区块':state.group==='all'?'从一个问题开始':group.name;
  const description=query?`搜索“${esc(state.q)}”，共找到 ${filtered.length} 个区块。`:state.group==='all'?'把论文里的知识拆开，再把相关的内容连起来。<br>挑一个想弄懂的问题，<strong>随时打开原文对照。</strong>':group.description;
  $('#main-content').innerHTML=`<section aria-label="知识区块"><h1>${title}</h1><p class="overview-description">${description}</p><div class="section-rule"><span>${query?'搜索结果':'可独立阅读的知识区块'}</span><span>${filtered.length} 个区块 · 按需探索</span></div>${filtered.length?`<div class="block-grid">${filtered.map((b,i)=>`<article class="block-card ${i===0&&!query?'featured':''}"><h2>${b.title}</h2><div class="english-term">${esc(b.term)}</div><p>${b.intro}</p><div class="card-footer"><span class="source-ids">${groupById.get(b.group).name} · ${[...new Set(b.refs.map(r=>r.paper))].join(' / ')}</span><span>${icon('arrow')}</span></div><button class="card-open" data-block="${b.id}" aria-label="阅读：${esc(b.title)}"></button></article>`).join('')}</div>`:`<div class="empty-state"><h2>暂时没有匹配的区块</h2><p>可以试试“安全”“MPC”“状态”或英文术语。<br>搜索范围是首批学习内容。</p><button class="secondary-button" data-action="clear-search">清除搜索，查看全部</button></div>`}<p class="scope-note">首批内容关联 5 篇文献，论文副本不在公开站提供，是可继续扩充的学习样本。<br>区块里的教学重组与示例会单独标明，来源保留具体版本和页码。</p></section>`;
}
function brakingHTML() {
  return `<div class="braking-demo"><label for="demo-speed">当前速度 <output id="speed-value">14 m/s</output></label><input id="demo-speed" type="range" min="4" max="26" step="1" value="14"><label for="demo-distance">到墙的距离 <output id="distance-value">30 m</output></label><input id="demo-distance" type="range" min="5" max="90" step="1" value="30"><svg id="braking-diagram" viewBox="0 0 360 92" role="img" aria-label="示意停车点与墙的位置"></svg><p class="demo-result" id="demo-result" aria-live="polite"></p><p class="demo-caption">解析示意 · 理想质点 · b = 4 m/s² · 非论文实验数据</p></div>`;
}
function setupBraking() {
  if (!$('#demo-speed')) return;
  const update=()=>{
    const v=Number($('#demo-speed').value), d=Number($('#demo-distance').value), stop=v*v/8;
    $('#speed-value').textContent=`${v} m/s`;
    $('#distance-value').textContent=`${d} m`;
    const wall=22+d/100*300, stopped=22+stop/100*300;
    $('#braking-diagram').innerHTML=`<line x1="14" y1="58" x2="347" y2="58" stroke="#8b9eae"/><rect x="15" y="39" width="21" height="13" rx="2" fill="#265b87" stroke="none"/><line x1="${wall}" y1="19" x2="${wall}" y2="62" stroke="#596e7d" stroke-width="3"/><path d="M${stopped} 29v23" stroke="${stop<d?'#326a59':'#a35536'}" stroke-width="2" stroke-dasharray="3 3"/><text x="17" y="79" font-size="10" fill="#526577" stroke="none">当前位置</text><text x="${Math.max(20,Math.min(wall-8,320))}" y="14" font-size="10" fill="#526577" stroke="none">墙</text><text x="${Math.max(15,Math.min(stopped-18,300))}" y="25" font-size="10" fill="${stop<d?'#326a59':'#a35536'}" stroke="none">停车点</text>`;
    const result=$('#demo-result');
    result.classList.toggle('risk',stop>=d);
    result.textContent=`停车距离 ${stop.toFixed(1)} m。${stop<d?`在示例假设下，可在墙前 ${ (d-stop).toFixed(1)} m 停下。`:stop===d?'停车点恰在边界，未留接触与误差余量。':`此刻仍未碰撞，但停车点会越过墙 ${ (stop-d).toFixed(1)} m。`}`;
  };
  $('#demo-speed').addEventListener('input',update);$('#demo-distance').addEventListener('input',update);update();
}
function renderDetail() {
  const b=blockById.get(state.block);
  if (!b) {state.view='overview';renderOverview();return;}
  const refs=b.refs.map(r=>{
    const p=paperById.get(r.paper);
    return `<div class="full-reference"><b>${p.id} · ${esc(p.title)}</b><br>${p.year} · ${p.kind==='conferencePaper'?'会议论文':'期刊文献'} · DOI <a href="https://doi.org/${encodeURI(p.doi)}" target="_blank" rel="noopener">${esc(p.doi)}</a><span class="ref-pages"><button class="ref-link" data-source="${r.paper}" data-page="${r.page}">PDF 第 ${r.page} 页 · ${esc(r.label)}</button></span></div>`;
  }).join('');
  $('#main-content').innerHTML=`<article class="block-detail"><div class="detail-nav"><button class="back-button" data-action="back">${icon('back')} 返回区块</button><button class="copy-link" data-action="copy-link">${icon('link')}复制链接</button></div><header class="detail-header"><h1>${b.title}</h1><p class="english-term">${esc(b.term)}</p><p class="detail-intro">${b.intro}</p><div class="detail-source-bar">${b.refs.map(sourcePill).join('')}</div></header><div class="detail-body">${b.sections.map(s=>`<section class="learning-section">${s.optional?`<details><summary>${s.title}<small>${s.kind}</small></summary><div class="section-copy">${s.html}</div></details>`:`<div class="section-heading"><h2>${s.title}</h2><span class="kind">${s.kind}</span></div><div class="section-copy">${s.html}${s.demo==='braking'?brakingHTML():''}</div>`}</section>`).join('')}</div><h2 class="related-heading">沿着联系，继续理解</h2><div class="related-list">${b.related.map(id=>`<button class="related-link" data-block="${id}"><span>${blockById.get(id).title}</span>${icon('arrow')}</button>`).join('')}</div><section class="source-reference-list"><h2>回到出处</h2>${refs}<p class="scope-note">这里的关联是为了学习而组织，并不表示不同论文共享模型、符号或保证。所列页码为 PDF 文件页序；版本与本次选读范围见原文面板。</p></section></article>`;
  formatMath($('#main-content'));setupBraking();
}
const versionLabel=p=>({'R01':'出版社版综述','R02':'出版社版综述 · 2024 首次在线','V01':'作者期刊稿 · 页眉刊期占位','Z08':'IEEE 期刊版 · 2022 首次在线','Z11':'IEEE 会议版'}[p.id]);
function renderLibrary() {
  $('#main-content').innerHTML=`<h1>关联论文</h1><p class="overview-description">从知识区块回到出处，也可以选择自己的 PDF 在浏览器中整篇阅读。<br>这 5 篇是首批内容的来源。</p><div class="paper-list">${papers.map(p=>`<article class="paper-item"><div class="paper-id">${p.id} · ${p.year} · ${p.kind==='conferencePaper'?'会议论文':'期刊文献'}</div><h2>${esc(p.title)}</h2><p>${versionLabel(p)} · ${p.pages} 页<br>本版选读 PDF 页：${p.read_pages.join('、')}；未作完整证明审计。</p><div class="paper-actions"><button class="secondary-button" data-source="${p.id}" data-page="1">${icon('book')} 查看出处 / 选择 PDF</button><button class="ref-link" data-paper-blocks="${p.id}">查看关联知识区块</button><a href="https://doi.org/${encodeURI(p.doi)}" target="_blank" rel="noopener">DOI 出版入口</a></div></article>`).join('')}</div>`;
}
function updatePublicSourceAccess() {
  if (!IS_PUBLIC) return;
  const p = paperById.get(state.paper), file = localFiles.get(p.id);
  $('#public-source-access').hidden = false;
  $('#source-doi').href = `https://doi.org/${encodeURI(p.doi)}`;
  $('#local-pdf-status').textContent = file ? `已在浏览器中打开：${file.name}。刷新页面即清除文件选择。` : '公开站不提供论文副本。可打开出版社入口，或选择你有权阅读的 PDF；文件仅在本浏览器处理，不会上传。';
  $('#forget-local-pdf').hidden = !file;
  for (const id of ['page-input','zoom-reset','reader-expand']) $('#'+id).disabled = !file;
  for (const id of ['prev-page','next-page','page-input','zoom-out','zoom-in','zoom-reset','reader-expand']) {
    if (!file) $('#'+id).disabled = true;
  }
}
function renderMain(reset=true,moveFocus=false) {
  renderNavigation();
  if (state.view==='detail') renderDetail();else if(state.view==='library')renderLibrary();else renderOverview();
  if (reset) $('#main').scrollTop=0;
  document.title=(state.view==='detail'?blockById.get(state.block)?.title:state.view==='library'?'关联论文':'从一个问题开始')+' · 论文学习台';
  if (moveFocus) $('#main').focus({preventScroll:true});
}
function selectBlock(id,{keepSource=false}={}) {
  const b=blockById.get(id); if (!b)return;
  state.view='detail';state.block=id;state.q='';$('#search').value='';state.context=id;
  if (!keepSource){state.paper=b.refs[0].paper;state.page=b.refs[0].page;}
  renderMain(true,true);updateLocation(true);showSource();
}
function revealReader() {
  readerHidden=false;$('#workspace').classList.remove('reader-hidden');
  if (matchMedia('(max-width:930px)').matches) $('#workspace').classList.add('reader-mobile-open');
  updateReaderToggle();
}
function updateReaderToggle() {
  const mobile=matchMedia('(max-width:930px)').matches;
  const open=mobile?$('#workspace').classList.contains('reader-mobile-open'):!readerHidden;
  $('#reader-toggle').textContent=open?(mobile?'返回区块':'收起原文'):'查看原文';
  $('#reader-toggle').setAttribute('aria-pressed',String(open));
}
function readerMetadata() {
  const p=paperById.get(state.paper);
  $('#paper-select').value=p.id;
  $('#paper-title').textContent=p.title;
  $('#paper-meta').textContent=`${p.year} · ${p.kind==='conferencePaper'?'会议论文':'期刊文献'} · ${versionLabel(p)}`;
  $('#page-input').value=state.page;$('#page-input').max=p.pages;
  $('#page-total').textContent=`/ ${p.pages}`;
  $('#prev-page').disabled=state.page<=1;$('#next-page').disabled=state.page>=p.pages;
  $('#zoom-out').disabled=zoom<=.6;$('#zoom-in').disabled=zoom>=2;
  $('#zoom-reset').textContent=zoom===1?'适宽':Math.round(zoom*100)+'%';
  $('#original-link').href=IS_PUBLIC ? (localUrls.has(p.id)?`${localUrls.get(p.id)}#page=${state.page}`:`https://doi.org/${encodeURI(p.doi)}`) : asset(`papers/${p.id}.pdf#page=${state.page}`);
  $('#original-link').setAttribute('aria-label',IS_PUBLIC&&!localUrls.has(p.id)?'打开 DOI 出版入口':'在新标签页打开 PDF');
  $('#printed-page').textContent=`PDF 第 ${state.page} 页 · 印刷页 ${p.printed_start+state.page-1}`;
  if (IS_PUBLIC) $('#printed-page').nextElementSibling.textContent=localFiles.has(p.id)?'所选本地 PDF · 可选择文字':'选读位置 · 公开站未托管全文';
  const b=blockById.get(state.context);
  const match=b?.refs.find(r=>r.paper===p.id&&r.page===state.page);
  $('#source-context').innerHTML=b?`关联区块：<button data-context-block="${b.id}">${b.title}</button>${match?`<br>${esc(match.label)}`:''}`:'整篇阅读 · 可以用上方页码直接跳转';
  $('#source-details-body').innerHTML=`<p>${esc(p.version)}</p><p>正式出版年：${p.year}。PDF 身份已按首页标题、作者或 DOI 核对；V01 为作者期刊稿，未宣称与出版社文件逐字一致。</p><p>本版正文选读 PDF 页：${p.read_pages.join('、')}。这是概念讲解与局部选读，未独立审计完整证明，也未复现实验。</p><a href="https://doi.org/${encodeURI(p.doi)}" target="_blank" rel="noopener">${esc(p.doi)}</a>`;
  if (p.authors) $('#source-details-body').insertAdjacentHTML('afterbegin',`<p>${esc(p.authors.join('; '))}<br>${esc(p.venue)}</p><p>版本与页码说明来自编写时选读的来源；你选择的 PDF 版本可能不同，请核对标题、作者与页码。</p>`);
  updatePublicSourceAccess();
}
async function pdfModule() {
  if (!pdfModulePromise) pdfModulePromise=import('./vendor/pdfjs-dist/build/pdf.mjs?v=4.10.38').then(mod=>{
    mod.GlobalWorkerOptions.workerSrc=asset('vendor/pdfjs-dist/build/pdf.worker.mjs');return mod;
  }).catch(error=>{pdfModulePromise=null;throw error;});
  return pdfModulePromise;
}
async function showSource({resetScroll=true}={}) {
  readerMetadata();persist();
  if (readerHidden || (matchMedia('(max-width:930px)').matches&&!$('#workspace').classList.contains('reader-mobile-open'))) return;
  const current=++generation;
  renderTask?.cancel();textTask?.cancel();
  if (IS_PUBLIC && !localFiles.has(state.paper)) {
    $('#pdf-message').style.display='block';
    $('#pdf-message').textContent=`${paperById.get(state.paper).id} · 选读位置：PDF 第 ${state.page} 页。原文请通过上方 DOI 获取，或选择本地 PDF 后在此对照阅读。`;
    $('#pdf-page').style.display='none';
    return;
  }
  $('#pdf-message').style.display='block';$('#pdf-message').textContent='正在打开本地论文…';
  $('#pdf-page').style.display='none';
  const paper=state.paper, pageNumber=state.page;
  try {
    const mod=await pdfModule();
    if(!documents.has(paper)) {
      const input = IS_PUBLIC ? {data:new Uint8Array(await localFiles.get(paper).arrayBuffer())} : {url:asset(`papers/${paper}.pdf`)};
      if(current!==generation)return;
      const task=mod.getDocument({...input,cMapUrl:asset('vendor/pdfjs-dist/cmaps/'),cMapPacked:true,standardFontDataUrl:asset('vendor/pdfjs-dist/standard_fonts/'),isEvalSupported:false});
      documents.set(paper,task.promise.catch(error=>{documents.delete(paper);throw error;}));
    }
    const doc=await documents.get(paper);
    if (IS_PUBLIC && pageNumber>doc.numPages) throw new Error('Selected PDF has fewer pages than the referenced edition');
    const page=await doc.getPage(pageNumber);
    if(current!==generation)return;
    const available=$('#pdf-scroll').clientWidth-(matchMedia('(max-width:620px)').matches?20:28);
    lastRenderedWidth=$('#pdf-scroll').clientWidth;
    const base=page.getViewport({scale:1});
    const viewport=page.getViewport({scale:Math.max(.2,available/base.width)*zoom});
    const canvas=$('#pdf-canvas'), outputScale=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.floor(viewport.width*outputScale);canvas.height=Math.floor(viewport.height*outputScale);
    canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
    $('#pdf-page').style.width=viewport.width+'px';$('#pdf-page').style.height=viewport.height+'px';
    const layer=$('#text-layer');layer.replaceChildren();
    layer.style.setProperty('--scale-factor',viewport.scale);
    renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:outputScale===1?null:[outputScale,0,0,outputScale,0,0]});
    await renderTask.promise;
    if(current!==generation)return;
    $('#pdf-message').style.display='none';$('#pdf-page').style.display='block';
    if(resetScroll){$('#pdf-scroll').scrollTop=0;$('#pdf-scroll').scrollLeft=0;}
    try {
      const text=await page.getTextContent();
      if(current!==generation)return;
      textTask=new mod.TextLayer({textContentSource:text,container:layer,viewport});await textTask.render();
    }catch(error){if(error.name!=='AbortException')console.warn('PDF text layer unavailable',error.message);}
  } catch(error) {
    if(current!==generation||error.name==='RenderingCancelledException')return;
    console.error('PDF reading failed',error);
    $('#pdf-message').style.display='block';
    $('#pdf-message').innerHTML=IS_PUBLIC ? '<p>所选 PDF 未能显示此页。请核对论文与版本、页数，并选择未加密、可正常打开的 PDF。可用上方“清除所选文件”重新选择。</p>' : `<p>这篇论文暂时没有打开。</p><p>请确认原始 PDF 仍在原目录，<br>并通过本地启动器访问此网页。</p><button class="secondary-button" data-action="retry-pdf">重试</button> <a href="${asset(`papers/${paper}.pdf#page=${pageNumber}`)}" target="_blank" rel="noopener">直接打开 PDF</a>`;
  }
}
function changePage(page) {
  const p=paperById.get(state.paper);const raw=Number(page);
  if(!Number.isFinite(raw)||!Number.isInteger(raw)||raw<1||raw>p.pages){$('#page-input').value=state.page;notify(`请输入 1 到 ${p.pages} 之间的整数页码`);return;}
  state.page=raw;updateLocation();showSource();
}
function navigateOverview() {state.view='overview';state.block=null;state.q='';$('#search').value='';renderMain(true,true);updateLocation(true);}

async function init() {
  try {
    const response=await fetch(asset('papers.json'));if(!response.ok)throw new Error('Missing papers.json');papers=await response.json();
    paperById=new Map(papers.map(p=>[p.id,p]));
    if(location.hash)applyLocation();else{
      try {
        const saved=JSON.parse(localStorage.getItem(STORE));
        if(saved&&paperById.has(saved.paper)){
          state.paper=saved.paper;state.page=Math.min(paperById.get(saved.paper).pages,Math.max(1,Math.trunc(Number(saved.page))||1));
          state.context=blockById.has(saved.context)?saved.context:null;
          if(blockById.has(saved.block)&&saved.view==='detail'){state.block=saved.block;state.context=saved.block;state.view='detail';}
          if(groupById.has(saved.group))state.group=saved.group;
        }
      }catch{/* A malformed saved position should not prevent startup. */}
    }
    $('#paper-select').innerHTML=papers.map(p=>`<option value="${p.id}">${p.id} · ${p.year} · ${p.kind==='conferencePaper'?'会议':'期刊'}</option>`).join('');
    if (IS_PUBLIC) {
      $('#local-pdf-input').addEventListener('change', async event=>{
        const file=event.target.files?.[0], paper=state.paper;
        event.target.value='';
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pdf')) {notify('请选择 PDF 文件');return;}
        const previous=documents.get(paper);documents.delete(paper);
        previous?.then(doc=>doc.destroy()).catch(()=>{});
        if (localUrls.has(paper)) URL.revokeObjectURL(localUrls.get(paper));
        localFiles.set(paper,file);localUrls.set(paper,URL.createObjectURL(file));
        $('#zoom-reset').disabled=false;$('#reader-expand').disabled=false;$('#page-input').disabled=false;
        showSource();
      });
      $('#forget-local-pdf').addEventListener('click',()=>{
        const paper=state.paper,previous=documents.get(paper);documents.delete(paper);
        previous?.then(doc=>doc.destroy()).catch(()=>{});
        localFiles.delete(paper);URL.revokeObjectURL(localUrls.get(paper));localUrls.delete(paper);
        showSource();notify('已清除本页中的文件选择');
      });
      window.addEventListener('pagehide',()=>{for(const url of localUrls.values())URL.revokeObjectURL(url);});
    }
    for (const [id,name] of [['prev-page','prev'],['next-page','next'],['zoom-out','minus'],['zoom-in','plus'],['original-link','external'],['reader-expand','expand']]) $('#'+id).innerHTML=icon(name);
    renderMain();updateReaderToggle();showSource();
    document.addEventListener('click',async event=>{
      const el=event.target.closest('button,a');if(!el)return;
      if(el.dataset.block){selectBlock(el.dataset.block);return;}
      if(el.dataset.group){state.group=el.dataset.group;navigateOverview();return;}
      if(el.dataset.source){state.paper=el.dataset.source;state.page=Number(el.dataset.page)||1;state.context=state.view==='detail'?state.block:null;zoom=1;revealReader();updateLocation();showSource();return;}
      if(el.dataset.contextBlock){$('#workspace').classList.remove('reader-mobile-open');updateReaderToggle();selectBlock(el.dataset.contextBlock,{keepSource:true});return;}
      if(el.dataset.paperBlocks){state.q=el.dataset.paperBlocks;state.view='overview';state.group='all';$('#search').value=state.q;renderMain(true,true);updateLocation(true);return;}
      if(el.dataset.action==='back')navigateOverview();
      if(el.dataset.action==='clear-search'){state.group='all';navigateOverview();}
      if(el.dataset.action==='retry-pdf')showSource();
      if(el.dataset.action==='copy-link'){
        updateLocation();try{await navigator.clipboard.writeText(location.href);notify('区块与原文页码链接已复制');}catch{notify('复制不可用，可直接复制浏览器地址栏');}
      }
    });
    $('#home-link').addEventListener('click',event=>{event.preventDefault();state.group='all';navigateOverview();});
    $('#search').addEventListener('input',event=>{state.q=event.target.value;state.view='overview';state.block=null;renderMain();updateLocation();});
    $('#library-button').addEventListener('click',()=>{state.view='library';state.block=null;state.q='';$('#search').value='';renderMain(true,true);updateLocation(true);});
    $('#reader-toggle').addEventListener('click',()=>{
      if(matchMedia('(max-width:930px)').matches){$('#workspace').classList.toggle('reader-mobile-open');readerHidden=false;$('#workspace').classList.remove('reader-hidden');}
      else{readerHidden=!readerHidden;$('#workspace').classList.toggle('reader-hidden',readerHidden);}
      updateReaderToggle();if(!readerHidden)showSource();
    });
    $('#reader-expand').addEventListener('click',()=>{readerWide=!readerWide;$('#workspace').classList.toggle('reader-wide',readerWide);$('#reader-expand').setAttribute('aria-pressed',String(readerWide));showSource({resetScroll:false});});
    $('#paper-select').addEventListener('change',event=>{state.paper=event.target.value;state.page=1;state.context=null;zoom=1;updateLocation();showSource();});
    $('#prev-page').addEventListener('click',()=>changePage(state.page-1));
    $('#next-page').addEventListener('click',()=>changePage(state.page+1));
    $('#page-input').addEventListener('change',event=>changePage(event.target.value));
    $('#page-input').addEventListener('keydown',event=>{if(event.key==='Enter'){changePage(event.target.value);event.target.blur();}});
    $('#zoom-in').addEventListener('click',()=>{zoom=Math.min(2,Math.round((zoom+.2)*10)/10);showSource({resetScroll:false});});
    $('#zoom-out').addEventListener('click',()=>{zoom=Math.max(.6,Math.round((zoom-.2)*10)/10);showSource({resetScroll:false});});
    $('#zoom-reset').addEventListener('click',()=>{zoom=1;showSource({resetScroll:false});});
    document.addEventListener('keydown',event=>{
      const editing=event.target.closest('input,textarea,select,[contenteditable]');
      if(event.key==='/'&&!editing){event.preventDefault();$('#search').focus();}
      if(event.key==='Escape'){
        if($('#workspace').classList.contains('reader-mobile-open')){$('#workspace').classList.remove('reader-mobile-open');updateReaderToggle();}
        else if(event.target===$('#search'))$('#search').blur();
      }
    });
    window.addEventListener('popstate',()=>{applyLocation();$('#search').value='';renderMain(true,true);showSource();});
    new ResizeObserver(()=>{
      clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{updateReaderToggle();if(Math.abs($('#pdf-scroll').clientWidth-lastRenderedWidth)>3)showSource({resetScroll:false});},180);
    }).observe($('#pdf-scroll'));
  } catch(error) {
    $('#main-content').innerHTML=IS_PUBLIC ? '<div class="empty-state"><h1>学习内容暂未载入</h1><p>请检查网络连接并刷新页面。</p></div>' : '<div class="empty-state"><h1>学习台尚未启动完整</h1><p>请使用 Start-Study.cmd 启动，再访问终端显示的本地地址。<br>不要直接双击 index.html。</p></div>';
    console.error(error);
  }
}
init();
