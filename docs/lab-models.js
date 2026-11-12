// Deterministic teaching recurrences, unrelated to the research workspace plants.
export const INITIAL = [10, 30, 70, 90];
export const TOPOLOGIES = {
  path: [[0,1],[1,2],[2,3]],
  ring: [[0,1],[1,2],[2,3],[3,0]],
  split: [[0,1],[2,3]],
};
export const mean = x => x.reduce((a,b)=>a+b,0)/x.length;
export const spread = x => Math.max(...x)-Math.min(...x);
export const disagreement = x => Math.sqrt(x.reduce((s,a)=>s+(a-mean(x))**2,0)/x.length);

export function consensusStep(x, edges, gain=.2, messages=x) {
  const delta = x.map(()=>0);
  for (const [i,j] of edges) {
    const flow=gain*(messages[j]-messages[i]);
    delta[i]+=flow;delta[j]-=flow;
  }
  return x.map((value,i)=>value+delta[i]);
}
export function consensusHistory({topology='path',gain=.2,steps=60,initial=INITIAL}={}) {
  const history=[initial.slice()];
  for(let k=0;k<steps;k++)history.push(consensusStep(history.at(-1),TOPOLOGIES[topology],gain));
  return history;
}

export const FORMATION_INITIAL = [[-3,-1],[3,-2],[2,3],[-2,2]];
export const FORMATION_OFFSETS = [[-1,-1],[1,-1],[1,1],[-1,1]];
export function formationHistory({formation=true,steps=40}={}) {
  const offsets=formation?FORMATION_OFFSETS:FORMATION_OFFSETS.map(()=>[0,0]);
  let z=FORMATION_INITIAL.map((p,i)=>p.map((a,d)=>a-offsets[i][d]));
  const history=[FORMATION_INITIAL.map(p=>p.slice())];
  for(let k=0;k<steps;k++) {
    const dimensions=[0,1].map(d=>consensusStep(z.map(p=>p[d]),TOPOLOGIES.ring,.2));
    z=z.map((_,i)=>dimensions.map(values=>values[i]));
    history.push(z.map((p,i)=>p.map((a,d)=>a+offsets[i][d])));
  }
  return history;
}

export function communicationHistory({threshold=2,steps=60,periodic=false}={}) {
  let x=INITIAL.slice(), held=x.slice(), broadcasts=4;
  const history=[{x:x.slice(),held:held.slice(),broadcasts,error:disagreement(x),fired:[0,1,2,3]}];
  for(let k=0;k<steps;k++) {
    x=consensusStep(x,TOPOLOGIES.path,.15,held);
    const fired=[];
    for(let i=0;i<x.length;i++)if(periodic||Math.abs(x[i]-held[i])>=threshold) {
      held[i]=x[i];broadcasts++;fired.push(i);
    }
    history.push({x:x.slice(),held:held.slice(),broadcasts,error:disagreement(x),fired});
  }
  return history;
}

export function safetyProjection({distance=.2,nominal=-1,kappa=1,conflict=false}={}) {
  const lower=Math.max(-1,-kappa*distance),upper=conflict?-.4:1;
  const feasible=lower<=upper;
  return {lower,upper,feasible,action:feasible?Math.max(lower,Math.min(upper,nominal)):null};
}
