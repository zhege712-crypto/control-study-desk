// Exact, bounded teaching calculations; these are not research-controller executions.
export const matrixModes={identity:[[1,0],[0,1]],shear:[[1,1],[0,1]],collapse:[[1,0],[0,0]]};
export const matvec=(a,x)=>a.map(row=>row.reduce((s,v,j)=>s+v*x[j],0));
export function matrixScene(mode='shear',x=[2,1]){const a=matrixModes[mode];return {a,x,y:matvec(a,x),basis:[matvec(a,[1,0]),matvec(a,[0,1])],rank:mode==='collapse'?1:2};}
export function motionScene(t=2){return {t,position:t*t,velocity:2*t,distance:t*t};}
export function feedbackScene(gain=.5,steps=0){const target=10,values=[2];for(let k=0;k<steps;k++)values.push(values.at(-1)+gain*(target-values.at(-1)));const x=values.at(-1);return {values,x,target,error:target-x,input:gain*(target-x)};}
export function consensusScene(split=false,steps=0){const edges=split?[[0,1]]:[[0,1],[1,2]];let x=[0,3,6];const history=[x];for(let k=0;k<steps;k++){const delta=[0,0,0];for(const [i,j]of edges){const d=.25*(x[j]-x[i]);delta[i]+=d;delta[j]-=d;}x=x.map((v,i)=>v+delta[i]);history.push(x);}return {x,edges,history,mean:x.reduce((s,v)=>s+v,0)/3};}
export function safetyScene(h=.2,nominal=-1,drift=0){const lower=Math.max(-1,drift-2*h),upper=1,feasible=lower<=upper;return {h,nominal,drift,lower,upper,feasible,u:feasible?Math.max(lower,Math.min(upper,nominal)):null};}
export function energyScene(rotate=false,steps=0){let e=[-3,2];const history=[e];for(let k=0;k<steps;k++){e=rotate?[(e[0]-e[1])/Math.sqrt(2),(e[0]+e[1])/Math.sqrt(2)]:e.map(v=>.75*v);history.push(e);}return {e,history,value:(e[0]**2+e[1]**2)/2};}
export function hankelScene(constant=false,column=0){const u=constant?[1,1,1,1,1]:[1,0,0,1,0];const matrix=[0,1,2].map(i=>[0,1,2].map(j=>u[i+j]));return {u,matrix,column,window:u.slice(column,column+3),rank:constant?1:3};}
export function growthScene(factor=.5,steps=0){const values=Array.from({length:steps+1},(_,i)=>4*factor**i);return {values,factor,error:values.at(-1),magnitude:Math.abs(values.at(-1))};}
