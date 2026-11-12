// Verify displayed worked examples independently of the lesson prose and UI rendering.
import assert from 'node:assert/strict';
import {blocks} from '../docs/content.js';
import {depthSections} from '../docs/depth-content.js';
import {consensusHistory,formationHistory,communicationHistory,mean} from '../docs/lab-models.js';
const near=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
const vector=(a,b)=>{assert.equal(a.length,b.length);a.forEach((x,i)=>near(x,b[i]));};
vector(consensusHistory({steps:2})[2],[18,36.4,63.6,82]);
near(.5*(6-8)+.8*(10-12),-2.6);
near(20+.1*12+.5*.1**2*(-2),21.19);near(12+.1*(-2),11.8);
near(30+(10-30)*Math.exp(-.05),10.9754,1e-4);
vector(formationHistory({steps:1})[1][0],[-2,-1]);
const comm=communicationHistory({threshold:5,steps:2});
vector(comm[1].x,[13,33,67,87]);vector(comm[1].held,[10,30,70,90]);
vector(comm[2].x,[16,36,64,84]);assert.equal(comm[1].broadcasts,4);assert.equal(comm[2].broadcasts,8);
const wrong=[10,30,70,90];
for(let i=0;i<4;i++) {let correction=0;for(const j of [i-1,i+1])if(j>=0&&j<4)correction+=wrong[j]-wrong[i];wrong[i]+=.2*correction;}
vector(wrong,[14,34.8,66.96,85.392]);near(mean(wrong),50.288);
assert.equal(Math.floor(Math.log(.01)/Math.log(.8))+1,21);
assert(10*.8**20>.1&&10*.8**21<.1);
assert(.6>2/(2+Math.sqrt(2)));near(1-.6*4,-1.4);
const cost=(u0,u1)=>(2+u0)**2+(2+u0+u1)**2+.1*(u0*u0+u1*u1);
near(cost(-1,-1),1.2);near(cost(-.5,-.5),3.3);near(cost(-1,-.9),1.191);
near(cost(-1,-10/11),1.1909090909090909);
near(.8+.1,.9);assert(1-.2+.5>1);
assert(1.1-.5>.5);near(1.1-1-.1,0);
near(30-1-14**2/8,4.5);near(10-1-14**2/8,-15.5);
near(5-4*.5-.5*.5**2,2.875);near(4+.5,4.5);
assert(2.875<1+4.5**2/8);near(5-4*.5+.5*4*.5**2,3.5);
near(4-4*.5,2);near(2**2/8,.5);
near(5-1-4**2/8,2);near((-4+2)/(4/4),-2);
assert(2*(-1)>-(2**2)); // x=2 cannot meet the requested CLF rate with |u|<=1.
const Hu=[[1,0,0,1],[0,0,1,0]],Hy=[[0,1,1,1],[1,1,1,2]],g=[1,0,-1,2];
const multiply=(A,v)=>A.map(row=>row.reduce((s,x,i)=>s+x*v[i],0));
vector(multiply(Hu,g),[3,-1]);vector(multiply(Hy,g),[1,4]);
const H3=[[1,0,0],[0,0,1],[0,1,0]];
const det=A=>A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])-A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])+A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
near(det(H3),-1);
const expanded=Object.entries(depthSections).map(([id,sections])=>{
  const b=blocks.find(x=>x.id===id);assert(b);
  for(const section of sections)assert(b.sections.includes(section));
  return {id,added_sections:sections.length,text_characters:b.sections.map(s=>s.html.replace(/<[^>]*>/g,'')).join('').length};
});
assert.equal(expanded.length,26);
console.log('Worked example checks passed');
