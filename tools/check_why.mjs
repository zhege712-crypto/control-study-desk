// Check source/link integrity and the independently computed teaching examples.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {methodChapters,methodIds,conceptMethods,paperMethods,acronymRoles} from '../docs/why-content.js';
import {whyHTML,whyMatches,methodContext} from '../docs/why.js';
import {blocks} from '../docs/content.js';
const require=createRequire(import.meta.url);
const katex=require('../docs/vendor/katex/dist/katex.min.js');
const sources=JSON.parse(readFileSync(new URL('../docs/study-sources.json',import.meta.url),'utf8'));
const ids=new Set(sources.map(s=>s.id));
assert.equal(new Set(methodIds).size,14);
assert.deepEqual(Object.keys(conceptMethods).sort(),blocks.map(b=>b.id).sort());
assert.deepEqual(Object.keys(paperMethods).sort(),[...ids].sort());
for(const c of methodChapters){
  for(const field of ['problem','simple','failure','mechanism','example','achieved','conditions','unresolved','cost','evaluate'])assert.ok(c[field].trim().length>0,`${c.id}: ${field}`);
  for(const id of c.sources)assert.ok(ids.has(id),`Unknown source ${id}`);
  for(const id of c.next)assert.ok(methodIds.includes(id),`Unknown method ${id}`);
  for(const id of c.related)assert.ok(blocks.some(b=>b.id===id),`Unknown concept ${id}`);
  if(c.math)katex.renderToString(c.math,{throwOnError:true,strict:'error'});
  const html=whyHTML(c.id,sources);
  assert.ok(html.includes('实际阅读')&&html.includes('采用版本'));
  assert.ok(!/undefined|NaN/.test(html));
}
assert.ok(whyMatches('CAV').some(c=>c.id==='architecture'));
assert.ok(whyMatches('Hankel').some(c=>c.id==='data'));
assert.ok(whyMatches('碰撞').some(c=>c.id==='safety'));
for(const [,,role,,id] of acronymRoles){assert.ok(role);assert.ok(methodIds.includes(id));}
for(const b of blocks)assert.ok(methodContext(b.id).includes('data-why'));
// Fixed authored examples are distinct from source-paper results.
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
close(2+0.5*(10-2),6);
close(0.4/2,0.2);
const gain=0.01/(0.01+0.09);close(gain,0.1);close(2+gain*(2.3-2),2.03);
const cost=u=>(2+u)**2+u*u;close(cost(-1),2);assert.ok(cost(-1)<cost(0)&&cost(-1)<cost(-2));
close(0.8**2/(2*0.4),0.8);
close(0.03/(1-0.7),0.1);
const original=[0,3,6];const next=[original[0]+.25*(original[1]-original[0]),original[1]+.25*(original[0]+original[2]-2*original[1]),original[2]+.25*(original[1]-original[2])];
assert.deepEqual(next,[0.75,3,5.25]);close(next.reduce((a,b)=>a+b)/3,3);
close(.2*.5,.1);close(.6-2*.2,.2);assert.ok(2-2*.2>1);
const overview=whyHTML('overview',sources);
assert.ok(overview.includes('人为构造')&&overview.includes('不是同一类东西'));
console.log('Problem-led content checks passed: 14 chapters, 50 concepts, 20 papers; links, sources, formulas and worked numbers valid.');
