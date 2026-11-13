// Check citations, directed concept links and the delay counterexample.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {blocks} from '../docs/content.js';
import {historyChapters,relations,relationTypes,conceptNames} from '../docs/history-content.js';
import {historyHTML,historyRoutes} from '../docs/history.js';
import {feedbackTrace,feedbackModes} from '../docs/history-models.js';
const sources=JSON.parse(readFileSync(new URL('../docs/history-sources.json',import.meta.url),'utf8'));
const katex=createRequire(import.meta.url)('../docs/vendor/katex/dist/katex.min.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-10);
assert.equal(sources.length,15);assert.equal(new Set(sources.map(s=>s.doi.toLowerCase())).size,15);
assert.equal(sources.find(s=>s.id==='H02').doi.toLowerCase(),'10.1098/rspl.1867.0055');
assert.equal(sources.find(s=>s.id==='H08').year,2017);
for(const s of sources){assert(s.authors.length&&s.venue&&s.reading_depth&&s.version);assert(new URL(s.access_url).protocol==='https:');}
for(const r of relations){assert(Object.hasOwn(conceptNames,r.from)&&Object.hasOwn(conceptNames,r.to));assert(Object.hasOwn(relationTypes,r.type));assert(blocks.some(b=>b.id===r.from)&&blocks.some(b=>b.id===r.to));}
let formulas=0,citations=0;
for(const id of historyRoutes){
  const html=historyHTML(id,sources);
  for(const [,block] of html.matchAll(/data-block="([^"]+)"/g))assert(blocks.some(b=>b.id===block));
  for(const [,ref] of html.matchAll(/data-history-ref="([^"]+)"/g)){assert(sources.some(s=>s.id===ref));citations++;}
  for(const [,math] of html.matchAll(/data-math="([^"]+)"/g)){katex.renderToString(math.replaceAll('&lt;','<').replaceAll('&amp;','&'),{throwOnError:true});formulas++;}
}
assert.deepEqual(feedbackTrace({gain:.5,steps:2}).map(p=>p.e),[4,2,1]);
assert.deepEqual(feedbackTrace({gain:1.5,steps:3}).map(p=>p.e),[4,-2,1,-.5]);
feedbackTrace({gain:1.2,delay:true,steps:3}).forEach((p,i)=>near(p.e,[4,-.8,-5.6,-4.64][i]));
near(feedbackModes(1.2).radius,.2);near(feedbackModes(1.2,true).radius,Math.sqrt(1.2));
assert(feedbackModes(1.2).stable&&!feedbackModes(1.2,true).stable);
assert(!feedbackModes(0).stable&&!feedbackModes(2).stable&&!feedbackModes(1,true).stable);
for(const delay of [false,true])for(const gain of [.5,1.2,1.5,2,2.5]){
  const browser=feedbackTrace({gain,delay});
  const python=process.env.HISTORY_PYTHON||'python';
  const args=[fileURLToPath(new URL('../docs/examples/history_feedback.py',import.meta.url)),'--gain',String(gain),...(delay?['--delay']:[])];
  const run=spawnSync(python,args,{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const records=run.stdout.trim().split(/\r?\n/).slice(1).map(line=>JSON.parse(line));
  records.forEach((p,i)=>near(p.error,browser[i].e));
}
console.log('History, citation and teaching-model checks passed');
