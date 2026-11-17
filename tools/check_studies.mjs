// Validate citation coverage and independently check the three authored numerical examples.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {paperProfiles} from '../docs/paper-profiles.js';
import {deepReadings} from '../docs/deep-readings.js';
import {studiesHTML,studyMatches} from '../docs/paper-studies.js';
import {blocks} from '../docs/content.js';
const require=createRequire(import.meta.url),katex=require('../docs/vendor/katex/dist/katex.min.js');
const sources=JSON.parse(readFileSync(new URL('../docs/study-sources.json',import.meta.url),'utf8'));
const originals=JSON.parse(readFileSync(new URL('../docs/papers.json',import.meta.url),'utf8'));
const ids=new Set(sources.map(p=>p.id)),concepts=new Set(blocks.map(p=>p.id));
assert.equal(ids.size,20);assert.equal(paperProfiles.length,20);assert.equal(deepReadings.length,3);
assert.deepEqual(new Set(paperProfiles.map(p=>p.id)),ids);
let terms=0,formulaCount=0;
for(const profile of paperProfiles){
  assert(profile.terms.length>=4);assert(profile.contributions.length>=2);assert(profile.boundaries.length>=2);terms+=profile.terms.length;
  const html=studiesHTML({study:profile.id,sources,readers:originals,isPublic:true});
  for(const [,id] of html.matchAll(/data-block="([^"]+)"/g))assert(concepts.has(id),`Broken concept ${profile.id}/${id}`);
  assert(!html.includes('undefined'),profile.id);
  assert(html.includes('实际阅读'));
}
for(const reading of deepReadings){
  assert(reading.sections.length>=8);
  const metadata=sources.find(p=>p.id===reading.id);
  for(const section of reading.sections){
    assert(metadata.read_pages.includes(section.page),`${reading.id}: unread page ${section.page}`);
    for(const [,math] of section.html.matchAll(/data-math="([^"]+)"/g)){katex.renderToString(math,{throwOnError:true,strict:'error'});formulaCount++;}
    for(const [,id] of section.html.matchAll(/data-block="([^"]+)"/g))assert(concepts.has(id));
  }
}
assert(studyMatches('CAV').some(p=>p.id==='V01'));
assert(studyMatches('持续激励').some(p=>p.id==='H09'&&p.deep));
const mv=(a,x)=>a.map(row=>row.reduce((s,v,j)=>s+v*x[j],0));
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
// Conserved weighted value and one synchronous step, checked from the stated matrices.
const L=[[1,-1,0],[-1,2,-1],[0,-1,1]],x=[0,3,6],d=mv(L,x).map(v=>-v);
d.forEach((v,i)=>near(v,[3,0,-3][i]));assert.deepEqual(x.map((v,i)=>v+.25*d[i]),[.75,3,5.25]);
const directed=[[1,-1],[-2,2]],w=[2/3,1/3];for(let j=0;j<2;j++)near(w.reduce((s,v,i)=>s+v*directed[i][j],0),0);near(w[1]*9,3);
// Closest scalar CBF input, and the distinct held-input counterexample.
const lower=Math.max(-1,-2*.2),nominal=-1,chosen=Math.min(1,Math.max(lower,nominal));near(chosen,-.4);near(.2+chosen*1,-.2);
// PE determinant and a new trajectory represented by the recorded Hankel columns.
const H3=[[1,0,0],[0,0,1],[0,1,0]];
const det=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
assert.equal(det(H3),-1);const g=[.5,2.5,-.5,0];
assert.deepEqual(mv([[1,0,0,1],[0,0,1,0]],g),[.5,-.5]);assert.deepEqual(mv([[0,1,1,1],[1,1,1,2]],g),[2,2.5]);
console.log(JSON.stringify({paperProfiles:20,deepReadings:3,termEntries:terms,deepSections:deepReadings.reduce((n,p)=>n+p.sections.length,0),formulas:formulaCount,coverage:'All 20 source IDs and concept links; three authored math examples independently checked'}));
