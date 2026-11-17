import {matrixScene,motionScene,feedbackScene,consensusScene,safetyScene,energyScene,growthScene} from './visual-models.js?v=20261117-visual2';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const blue='#265b87',green='#326a59',rust='#9c4c2d',purple='#73538c',gray='#687c8e';
const fmt=x=>Number(x).toFixed(2).replace(/\.00$/,'');
const text=(x,y,s,color='#526577',size=18)=>`<text x="${x}" y="${y}" fill="${color}" stroke="none" font-size="${size}" text-anchor="middle">${esc(s)}</text>`;
const line=(x1,y1,x2,y2,color=gray,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const dot=(x,y,color=blue,r=7)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="white" stroke-width="2"/>`;
function arrow(x1,y1,x2,y2,color=blue){const d=Math.hypot(x2-x1,y2-y1);if(d<1)return dot(x1,y1,color,4);const a=Math.atan2(y2-y1,x2-x1),w=10;return line(x1,y1,x2,y2,color)+`<path d="M${x2-w*Math.cos(a-.45)} ${y2-w*Math.sin(a-.45)}L${x2} ${y2}L${x2-w*Math.cos(a+.45)} ${y2-w*Math.sin(a+.45)}" fill="none" stroke="${color}" stroke-width="2"/>`;}
const svg=(label,body)=>`<svg viewBox="0 0 480 300" role="img" aria-label="${esc(label)}">${body}</svg>`;
const axis=(x0=55,y0=250,x1=435,y1=35)=>arrow(x0,y0,x1,y0,gray)+arrow(x0,y0,x0,y1,gray);
export const visualTopics={
 vector:{name:'向量：把几个数放在一起',intro:'先把两个数看成“横着多少、竖着多少”。同一个点与一列数，表达的是同一组信息。',legend:'蓝色箭头从原点指向 (2,1)。虚线把点投到两条轴，读出两个分量。',formula:String.raw`x=\begin{bmatrix}2\\1\end{bmatrix}`,concept:'math-bridge'},
 matrix:{name:'矩阵与秩：方向怎样被改变',intro:'不急着做乘法。先看一张小方形经过规则以后，是仍铺成一片，还是被压成一条线。',legend:'蓝色、绿色分别标记两个输入方向。它们变换后仍独立，平面就没有丢掉一个方向；压到同一直线上就只剩一维。',formula:String.raw`y=Ax,\qquad \operatorname{rank}(A)=\text{独立输出方向的数量}`,concept:'hankel'},
 derivative:{name:'导数：这一刻变化有多快',intro:'沿蓝色路程曲线选一个时刻。橙色短线表示这一刻的倾斜程度；越陡，位置变化越快。',legend:'横轴是时间 t（秒），纵轴是位置 s（米）。本例 s=t²；橙线为切线，蓝点为所选时刻。',formula:String.raw`s(t)=t^2,\qquad v(t)=\frac{ds}{dt}=2t`,concept:'motion-basics'},
 integral:{name:'积分：把小段变化累积起来',intro:'速度图下方的面积，对应这段时间走过的路程。先用几块小矩形拼一拼，再增加块数。',legend:'横轴时间（秒），纵轴速度（米/秒）；本例 v=2t。浅蓝三角形是准确面积，深蓝矩形用每小段起点速度作近似。',formula:String.raw`\Delta s=\int_0^t2\tau\,d\tau=t^2`,concept:'motion-basics'},
 feedback:{name:'反馈：看到偏差，再动一步',intro:'蓝点想靠近目标。每次只走当前差距的一部分，下一次再重新看差距。',legend:'横轴是无量纲状态，不是车辆位置。虚线是目标 10；箭头是下一步打算改变的方向和大小。',formula:String.raw`x_{k+1}=x_k+g(10-x_k)`,concept:'feedback-basics'},
 consensus:{name:'一致性：邻居怎样互相拉近',intro:'每个节点只看相连邻居。先看三个人各自的数，再按一次“看下一步”，观察谁变了、变了多少。',legend:'上面连线表示谁使用谁的信息；下面三条数轴分别显示 A、B、C 的无量纲状态，虚线标记整体均值。',formula:String.raw`x_i^+=x_i+0.25\sum_{j\in\mathcal N_i}(x_j-x_i)`,concept:'consensus-starter'},
 safety:{name:'不等式与 QP：在允许区间里选动作',intro:'先把允许的输入涂出来，再找离“想做的动作”最近的点。区间消失时，就没有满足这些条件的动作。',legend:'横轴是控制输入 u。绿色段满足本例全部输入条件；紫点是原动作，蓝点是过滤结果。红色只表示被排除的输入。',formula:String.raw`\dot h=u-b,\quad h\ge0,\quad u\in[-1,1],\quad u\ge b-2h`,concept:'cbf-qp'},
 energy:{name:'平方和与 Lyapunov：变小与绕圈',intro:'把两个误差画成平面上的一个点。离原点越远，误差平方和越大；再比较“持续缩小”和“只绕圈”。',legend:'横、纵轴是两个无量纲误差。圆圈表示相同的 V；轨迹缩进内圈才使 V 变小。这里的“能量”只是教学函数。',formula:String.raw`V=\frac12(e_1^2+e_2^2)`,concept:'clf'},
 hankel:{name:'Hankel 与 PE：滑动窗口留下了什么',intro:'将同一串记录每次向右滑一格，取出三个连续数，竖着放到矩阵的一列中。',legend:'上面是原始标量记录；蓝框是当前窗口，下面蓝列是它在 H₃ 中的位置。切成常数记录，看看各列还提供多少新信息。',formula:String.raw`\operatorname{rank}H_q(u)=mq\quad\text{表示 }q\text{ 阶持续激励}`,concept:'pe'},
 modes:{name:'特征值的起点：每一步乘一个数',intro:'先不学复杂的特征分解。只看一个误差每次乘同一个数，怎样变小、过零，或越摆越大。',legend:'横轴是更新步，纵轴是无量纲误差。各模式的纵轴按完整八步范围设置；看符号和幅值，不能只看曲线方向。',formula:String.raw`e_{k+1}=r e_k,\quad e_0=4,\quad |r|<1\Rightarrow e_k\to0`,concept:'stability-language'},
};
export const visualIds=Object.keys(visualTopics);
export const conceptVisuals={
 'motion-basics':'derivative','update-basics':'feedback','feedback-basics':'feedback','math-bridge':'matrix','model':'vector','control-affine':'vector','lie-derivative':'derivative','relative-degree':'derivative','graph':'consensus','laplacian':'consensus','consensus-starter':'consensus','formation-starter':'consensus','stability-language':'modes','clf':'energy','cbf':'safety','cbf-qp':'safety','slack':'safety','class-k':'safety','safe-set':'safety','invariance':'safety','filter':'safety','discrete-cbf':'feedback','hankel':'hankel','pe':'hankel','data-driven':'hankel','rl-state':'vector','reward':'safety','mpc':'integral',
};
export const paperVisuals={R01:'safety',R02:'hankel',V01:'integral',Z08:'consensus',Z11:'vector',H01:'feedback',H02:'feedback',H03:'feedback',H04:'vector',H05:'matrix',H06:'integral',H07:'consensus',H08:'safety',H09:'hankel',H10:'feedback',H11:'feedback',H12:'feedback',H13:'integral',H14:'consensus',H15:'vector'};
export const deepVisuals={H07:{1:'consensus',3:'energy',4:'consensus',6:'modes'},H08:{2:'safety',4:'safety',7:'derivative'},H09:{1:'hankel',2:'matrix',5:'hankel'}};
function diagram(id,p={}){
 const step=p.step??0;let body='',value='',observation='';
 if(id==='vector'){
  const x=p.x??2,y=p.y??1,X=65+x*75,Y=240-y*65;
  body=axis(65,240,425,35)+line(X,240,X,Y,gray,'5 5')+line(65,Y,X,Y,gray,'5 5')+arrow(65,240,X,Y,blue)+dot(X,Y)+text(X,270,'x₁='+fmt(x),blue)+text(33,Y+5,'x₂='+fmt(y),green)+text(80,267,'0')+text(400,225,'横向')+text(90,42,'竖向');
  value=`一列数是 (${fmt(x)}, ${fmt(y)})；点在横向 ${fmt(x)}、竖向 ${fmt(y)}。`;observation='向量是把多个分量组织在一起，并不自动指空间位置。论文里也可以用它放速度、车距或估计误差。';
 }else if(id==='matrix'){
  const mode=p.mode||'shear',s=matrixScene(mode);const ox=[35,275],base=[[0,0],[1,0],[1,1],[0,1]];
  for(let j=0;j<2;j++){const points=j?base.map(v=>[s.a[0][0]*v[0]+s.a[0][1]*v[1],s.a[1][0]*v[0]+s.a[1][1]*v[1]]):base;const X=v=>ox[j]+v*65,Y=v=>230-v*95;
   body+=axis(ox[j],230,ox[j]+165,95)+`<polygon points="${points.map(v=>`${X(v[0])},${Y(v[1])}`).join(' ')}" fill="${blue}" fill-opacity=".13" stroke="${blue}" stroke-width="2"/>`;
   const b=j?s.basis:[[1,0],[0,1]];body+=arrow(ox[j],230,X(b[0][0]),Y(b[0][1]),blue)+arrow(ox[j],230,X(b[1][0]),Y(b[1][1]),green)+text(ox[j]+80,55,j?'变换后':'变换前',blue,22);
  }
  value=`当前规则 A = [${s.a[0].join(', ')}; ${s.a[1].join(', ')}]，剩下 ${s.rank} 个独立方向。`;observation=s.rank===1?'整个方形被压到一条线上。许多数会映到同一位置，无法只凭输出恢复原来的两个分量。':'斜切会改变形状，但没有把两个方向压成一个；它与信息丢失是两种不同变化。';
 }else if(id==='derivative'||id==='integral'){
  const t=Number(p.t??2),s=motionScene(t),X=v=>55+v/3*365,Y=v=>250-v/(id==='integral'?6:9)*205;
  body=axis()+text(450,270,'t')+text(72,25,id==='integral'?'v / 米每秒':'s / 米');
  if(id==='derivative'){
   body+=`<polyline points="${Array.from({length:31},(_,i)=>{const q=i/10;return `${X(q)},${Y(q*q)}`;}).join(' ')}" fill="none" stroke="${blue}" stroke-width="3"/>`;
   const a=Math.max(0,t-.55),b=Math.min(3,t+.55);body+=line(X(a),Y(t*t+2*t*(a-t)),X(b),Y(t*t+2*t*(b-t)),rust)+dot(X(t),Y(t*t),blue)+line(X(t),250,X(t),Y(t*t),gray,'5 5')+text(X(t),279,fmt(t))+text(200,70,'越陡，变化越快',rust);
   value=`t=${fmt(t)} 秒：位置 ${fmt(s.position)} 米，瞬时速度 ${fmt(s.velocity)} 米/秒。`;observation='位置是曲线的高度，速度是曲线此刻的斜率。高度大与斜率大，是不同的量。';
  }else{
   const n=Number(p.bins??4),dt=t/n,approx=t*t*(1-1/n);
   body+=`<polygon points="55,250 ${X(t)},${Y(2*t)} ${X(t)},250" fill="${blue}" fill-opacity=".1" stroke="none"/>`;
   for(let k=0;k<n;k++)body+=`<rect x="${X(k*dt)}" y="${Y(2*k*dt)}" width="${365/3*dt}" height="${250-Y(2*k*dt)}" fill="${blue}" fill-opacity=".3" stroke="${blue}"/>`;
   body+=line(55,250,X(3),Y(6),blue)+text(X(t),279,fmt(t));
   value=`${n} 块矩形合计 ${fmt(approx)} 米；曲线下准确面积 ${fmt(s.distance)} 米。`;observation='每块面积是“这一小段速度 × 时间”。本例速度一直上升，取每段起点速度会低估；块数增加后更接近准确值。';
  }
 }else if(id==='feedback'){
  const s=feedbackScene(Number(p.gain??.5),step),X=v=>55+v/15*370;
  body=line(55,210,425,210)+line(X(10),55,X(10),235,gray,'6 6')+text(X(10),38,'目标 10',green)+text(55,242,'0')+text(425,242,'15')+arrow(X(s.x),145,X(s.x+s.input),145,blue)+dot(X(s.x),210,blue,10)+text(X(s.x),278,'当前 '+fmt(s.x),blue)+text(200,95,'下一步改动 '+fmt(s.input),blue,22);
  value=`第 ${step} 步：当前 ${fmt(s.x)}，距离目标还差 ${fmt(s.error)}；下一步加 ${fmt(s.input)}。`;observation='误差要用现在的状态重新计算。跨过目标后，差的符号会改变，后续动作方向也会改变。';
 }else if(id==='consensus'){
  const s=consensusScene(p.split==='yes',step),gx=[90,240,390],X=v=>80+v/6*330;
  for(const[i,j]of s.edges)body+=line(gx[i]+22,65,gx[j]-22,65,gray);
  for(let i=0;i<3;i++)body+=dot(gx[i],65,[blue,green,purple][i],25)+text(gx[i],72,fmt(s.x[i]),'white',22)+text(gx[i],25,'ABC'[i],blue)+line(80,150+i*48,410,150+i*48)+dot(X(s.x[i]),150+i*48,[blue,green,purple][i])+text(38,156+i*48,'ABC'[i]);
  body+=line(X(3),120,X(3),265,gray,'5 5')+text(80,285,'0')+text(X(3),285,'均值 3')+text(410,285,'6');
  value=`第 ${step} 步：A=${fmt(s.x[0])}，B=${fmt(s.x[1])}，C=${fmt(s.x[2])}。整体均值 ${fmt(s.mean)}。`;observation=p.split==='yes'?'C 没有与其他节点相连。均值仍保持，但各自小组可以停在不同的值。':'一次更新由全部旧值同时算出。A 向 B 靠近，C 向 B 靠近；B 的两侧作用可以抵消。';
 }else if(id==='safety'){
  const s=safetyScene(Number(p.h??.2),Number(p.nominal??-1),Number(p.drift??0)),X=v=>55+(v+1.5)/3.5*370;
  body=line(55,170,425,170)+`<rect x="${X(-1)}" y="153" width="${X(1)-X(-1)}" height="34" fill="${rust}" fill-opacity=".17" stroke="none"/>`;
  if(s.feasible)body+=`<rect x="${X(s.lower)}" y="153" width="${X(1)-X(s.lower)}" height="34" fill="${green}" fill-opacity=".5" stroke="none"/>`+dot(X(s.u),170,blue,10)+text(X(s.u),135,'选择 '+fmt(s.u),blue);
  body+=line(X(s.lower),70,X(s.lower),195,gray,'5 5')+text(240,45,'条件下界 '+fmt(s.lower),blue,22)+dot(X(s.nominal),225,purple,9)+text(X(s.nominal),265,'原动作 '+fmt(s.nominal),purple)+text(X(-1),205,'−1')+text(X(1),205,'1');
  value=s.feasible?`下界 max(−1, ${fmt(s.drift)} − 2 × ${fmt(s.h)}) = ${fmt(s.lower)}。允许区间 [${fmt(s.lower)}, 1]；最近的允许动作是 ${fmt(s.u)}。`:`下界 max(−1, ${fmt(s.drift)} − 2 × ${fmt(s.h)}) = ${fmt(s.lower)}，超过上限 1。允许区间为空；没有可执行的过滤结果。`;observation=s.feasible?'先求条件与执行器范围的交集，再在交集内选动作。横轴是输入值，蓝点移动不表示车辆在空间中移动。':'初态有正余量，也可能无法抵消所设外界变化。本图报告无解，不把裁剪后的数当作安全动作。';
 }else if(id==='energy'){
  const s=energyScene(p.mode==='rotate',step),X=v=>240+v*27,Y=v=>145-v*27,V=(s.e[0]**2+s.e[1]**2)/2;
  body=line(85,145,400,145)+line(240,30,240,260)+[40,75,105].map(r=>`<circle cx="240" cy="145" r="${r}" fill="none" stroke="#b5c5d1" stroke-width="1"/>`).join('')+`<polyline points="${s.history.map(e=>`${X(e[0])},${Y(e[1])}`).join(' ')}" stroke="${blue}" fill="none" stroke-width="3"/>`+dot(X(s.e[0]),Y(s.e[1]))+text(420,153,'e₁')+text(255,25,'e₂')+text(100,284,'V = '+fmt(V),blue,22)+`<rect x="190" y="269" width="${200*V/6.5}" height="17" fill="${blue}" stroke="none"/>`;
  value=`第 ${step} 步：误差 (${fmt(s.e[0])}, ${fmt(s.e[1])})，V=${fmt(V)}；初始 V=6.5。`;observation=p.mode==='rotate'?'点一直在同一个圆上，V 没有增大，但也没有趋近零。只证明“不增加”，尚不足以推出误差消失。':'两个误差每步都乘 0.75，V 每步乘 0.75²，所以点持续走向原点。';
 }else if(id==='hankel'){
  const data=p.mode==='constant'?[1,1,1,1,1]:[1,0,0,1,0],col=step%3;
  for(let i=0;i<5;i++)body+=`<rect x="${28+i*85}" y="30" width="58" height="43" rx="4" fill="white" stroke="#b5c5d1"/>`+text(57+i*85,60,data[i],blue,24);
  body+=`<rect x="${23+col*85}" y="23" width="238" height="57" rx="5" fill="none" stroke="${blue}" stroke-width="3"/>`;
  for(let r=0;r<3;r++){body+=text(67,156+r*48,'移位 '+r);for(let c=0;c<3;c++)body+=`<rect x="${157+c*78}" y="${126+r*48}" width="60" height="40" fill="${c===col?'#dbe8f3':'white'}" stroke="#b5c5d1"/>`+text(187+c*78,155+r*48,data[c+r],blue,24);}
  body+=arrow(142+col*85,88,187+col*78,117,blue)+text(280,289,'当前：第 '+(col+1)+' 列',blue);
  value=`记录 (${data.join(', ')})；当前窗口 (${data.slice(col,col+3).join(', ')})；H₃ 的秩为 ${p.mode==='constant'?1:3}。`;observation=p.mode==='constant'?'三个窗口完全相同，增加重复列没有增加独立方向。此标量记录不是 3 阶 PE。':'三个窗口分别提供三个独立方向，这个 H₃ 满行秩。这里只检查这份无噪标量教学记录，不泛化到任意数据。';
 }else{
  const r=Number(p.r??-.5),s=growthScene(r,step),full=growthScene(r,8).values,lo=Math.min(0,...full),hi=Math.max(...full),X=k=>55+k/8*360,Y=v=>250-(v-lo)/(hi-lo||1)*205;
  body=axis()+line(55,Y(0),415,Y(0),gray,'5 5')+`<polyline points="${s.values.map((v,i)=>`${X(i)},${Y(v)}`).join(' ')}" stroke="${blue}" stroke-width="3" fill="none"/>`+s.values.map((v,i)=>dot(X(i),Y(v),blue,4)).join('')+text(35,52,fmt(hi))+text(30,252,fmt(lo))+text(60,283,'0')+text(410,283,'8 步');
  value=`第 ${step} 步：误差 ${fmt(s.error)}，幅值 ${fmt(s.magnitude)}；每步倍率 ${r}。`;observation=Math.abs(r)<1?'倍率的绝对值小于 1，幅值逐步减小；负号只意味着每次跨到零的另一侧。':Math.abs(r)===1?'误差只换符号，幅值不缩小；来回振荡不等于收敛。':'负号让误差来回换边，而绝对值大于 1 让幅值增长。方向反复改变并不能保证稳定。';
 }
 return {svg:svg(visualTopics[id].legend,body),value,observation};
}
export function inlineVisual(id,{caption}={}){if(!visualTopics[id])return '';const topic=visualTopics[id],scene=diagram(id,{step:['feedback','modes'].includes(id)?3:0});return `<figure class="math-visual vm-inline"><div class="vm-picture">${scene.svg}</div><figcaption><strong>${esc(caption||topic.name)}</strong><p>${esc(topic.legend)}</p><p class="vm-reading">${esc(scene.value)}</p><button class="term-link" data-visual="${id}">动一动这张图，逐步看变化</button></figcaption><p class="vm-origin">网页自编预备图；不是论文图表或实验。${id==='matrix'?'二维方向是理解秩的类比，不能代替任意维矩阵的秩检查。':''}</p></figure>`;}
const select=(id,label,options)=>`<label for="vm-${id}">${label}<select id="vm-${id}" data-vm-param="${id}">${options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>`;
const range=(id,label,min,max,step,value)=>`<label for="vm-${id}"><span>${label} <output for="vm-${id}" data-vm-output="${id}">${fmt(value)}</output></span><input id="vm-${id}" data-vm-param="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"/></label>`;
const stepped=new Set(['feedback','consensus','energy','hankel','modes']);
export function visualsHTML(id='feedback'){
 if(!visualTopics[id])id='feedback';const topic=visualTopics[id];let controls='';
 if(id==='vector')controls=range('x','横向分量 x₁',0,4,.5,2)+range('y','竖向分量 x₂',0,3,.5,1);
 if(id==='matrix')controls=select('mode','变换规则',[['shear','斜切：形状改变，保留两个方向'],['identity','保持原样'],['collapse','压扁：只剩一条线']]);
 if(id==='derivative'||id==='integral')controls=range('t','选择时刻 t（秒）',.5,3,.5,2)+(id==='integral'?select('bins','用多少块矩形',[['4','4 块'],['2','2 块'],['8','8 块'],['16','16 块']]):'');
 if(id==='feedback')controls=select('gain','每次走差距的多少',[['.5','一半：0.5'],['.25','四分之一：0.25'],['1.2','超过一步：1.2'],['1.5','更多跨越：1.5']]);
 if(id==='consensus')controls=select('split','连接关系',[['no','A—B—C 全部连通'],['yes','A—B；C 单独一组']]);
 if(id==='safety')controls=range('h','当前安全余量 h',0,1,.1,.2)+range('nominal','想做的输入 u',-1,1,.1,-1)+range('drift','外界使余量下降的速率 b',0,2,.2,0);
 if(id==='energy')controls=select('mode','误差如何更新',[['shrink','每步乘 0.75：持续缩小'],['rotate','每步转 45°：只绕圈']]);
 if(id==='hankel')controls=select('mode','原始记录',[['rich','变化记录：1,0,0,1,0'],['constant','重复记录：1,1,1,1,1']]);
 if(id==='modes')controls=select('r','每步倍率 r',[['-.5','−0.5：过零但幅值缩小'],['.5','0.5：同方向缩小'],['-1','−1：只来回换边'],['-1.3','−1.3：越摆越大']]);
 return `<section class="history-page visual-page"><h1>先看图，再认识数学</h1><p class="guide-intro">不用一口气补完高等数学。选一个眼前的问题，先看图、改一个量，再对照数字；公式可以最后展开。</p><details class="vm-topic-picker"><summary>选择其他图解 · 共 10 个主题</summary><nav class="vm-topics" aria-label="数学图解主题">${visualIds.map(key=>`<button data-visual="${key}" ${key===id?'aria-current="page"':''}>${visualTopics[key].name.split('：')[0]}</button>`).join('')}</nav></details><section class="guide-section"><h2>${topic.name}</h2><p>${topic.intro}</p><div class="vm-controls">${controls}</div>${stepped.has(id)?`<div class="vm-player"><button class="secondary-button" data-vm-action="step">${id==='hankel'?'窗口向右一格':'看下一步'}</button><button class="term-link" data-vm-action="play">自动演示</button><button class="term-link" data-vm-action="reset">回到初始</button><span id="vm-step-label">第 0 步</span></div>`:''}<figure class="math-visual"><div id="vm-scene" class="vm-picture"></div><figcaption>${topic.legend}</figcaption></figure><p id="vm-values" class="vm-values" role="status" aria-live="polite"></p><p id="vm-observation"></p><details class="vm-formula"><summary>图看明白后，再展开对应公式</summary><div class="math" data-math="${topic.formula}"></div><p>这张图只解释上面声明的模型。回到论文时，仍要核对状态、输入、单位与适用条件。</p><button class="term-link" data-block="${topic.concept}">接着读相关知识区块</button></details><p class="vm-origin">自编解析教学：图形与数字使用同一规则，不是研究仿真或论文结果。可离线操作；自动演示随页面离开停止，也可以逐步点击。</p></section></section>`;
}
export function mountVisuals(root,id='feedback'){
 if(!visualTopics[id])id='feedback';let step=0,timer=null;const limit=id==='hankel'?2:8;
 const params=()=>Object.fromEntries([...root.querySelectorAll('[data-vm-param]')].map(el=>[el.dataset.vmParam,el.value]));
 const stop=()=>{if(timer)clearInterval(timer);timer=null;const b=root.querySelector('[data-vm-action="play"]');if(b)b.textContent='自动演示';};
 function draw(){const current=params();root.querySelectorAll('[data-vm-output]').forEach(el=>{el.textContent=fmt(Number(current[el.dataset.vmOutput]));});const scene=diagram(id,{...current,step});root.querySelector('#vm-scene').innerHTML=scene.svg;root.querySelector('#vm-values').textContent=scene.value;root.querySelector('#vm-observation').textContent=scene.observation;const label=root.querySelector('#vm-step-label');if(label)label.textContent=id==='hankel'?`第 ${step%3+1} 个窗口`:`第 ${step} 步 / 共 8 步`;const next=root.querySelector('[data-vm-action="step"]');if(next)next.disabled=id!=='hankel'&&step>=limit;}
 const click=event=>{const action=event.target.closest('[data-vm-action]')?.dataset.vmAction;if(!action)return;if(action==='reset'){stop();step=0;}if(action==='step'){stop();step=id==='hankel'?(step+1)%3:Math.min(limit,step+1);}if(action==='play'){if(timer){stop();return;}if(step>=limit)step=0;event.target.textContent='暂停演示';timer=setInterval(()=>{step=id==='hankel'?(step+1)%3:step+1;draw();if(id!=='hankel'&&step>=limit)stop();},850);}draw();};
 const change=()=>{stop();step=0;draw();};root.addEventListener('click',click);root.addEventListener('input',change);root.querySelectorAll('[data-math]').forEach(el=>window.katex?.render(el.dataset.math,el,{displayMode:true,throwOnError:false,trust:false}));draw();return()=>{stop();root.removeEventListener('click',click);root.removeEventListener('input',change);};
}
