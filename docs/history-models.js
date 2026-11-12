// Dimensionless analytic teaching fixtures; no physical controller or solver is used.
export function feedbackTrace({gain=.5,delay=false,steps=12}={}){
  if(!Number.isFinite(gain)||gain<0||gain>3||!Number.isInteger(steps)||steps<0||steps>60)throw new RangeError('Invalid teaching parameters');
  let current=4,previous=4;
  const trace=[{k:0,e:current,used:null,u:null}];
  for(let k=0;k<steps;k++){
    const used=delay?previous:current,u=-gain*used,next=current+u;
    previous=current;current=next;trace.push({k:k+1,e:current,used,u});
  }
  return trace;
}
export function feedbackModes(gain,delay=false){
  if(!delay)return {radius:Math.abs(1-gain),text:`λ = ${(1-gain).toFixed(3)}`,stable:gain>0&&gain<2};
  const d=1-4*gain;
  const radius=d>=0?Math.max(Math.abs((1+Math.sqrt(d))/2),Math.abs((1-Math.sqrt(d))/2)):Math.sqrt(gain);
  const text=d>=0?`λ = ${((1+Math.sqrt(d))/2).toFixed(3)}, ${((1-Math.sqrt(d))/2).toFixed(3)}`:`λ = 0.500 ± ${(Math.sqrt(-d)/2).toFixed(3)}i`;
  return {radius,text,stable:gain>0&&gain<1};
}
