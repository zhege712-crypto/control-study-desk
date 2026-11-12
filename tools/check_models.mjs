// Verify the actual teaching recurrences and their explanatory boundaries.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {consensusHistory,consensusStep,TOPOLOGIES,INITIAL,mean,spread,formationHistory,communicationHistory,safetyProjection} from '../docs/lab-models.js';
import {beginnerHTML,guideFormulas} from '../docs/beginner.js';
import {blocks} from '../docs/content.js';
import {beginnerBlocks} from '../docs/beginner-content.js';
const katex=createRequire(import.meta.url)('../docs/vendor/katex/dist/katex.min.js');
assert.deepEqual(consensusStep(INITIAL,TOPOLOGIES.path),[14,34,66,86]);
for(const topology of ['path','ring','split'])for(const x of consensusHistory({topology}))assert(Math.abs(mean(x)-50)<1e-10);
assert(spread(consensusHistory().at(-1))<.05);
const split=consensusHistory({topology:'split'}).at(-1);
assert(Math.abs(split[0]-20)<1e-8&&Math.abs(split[3]-80)<1e-8);
assert(spread(consensusHistory({topology:'ring',gain:.6}).at(-1))>1e6);
const formed=formationHistory().at(-1),collapsed=formationHistory({formation:false}).at(-1);
for(let i=0;i<4;i++) {
  assert(Math.abs(formed[i][0]-[-1,1,1,-1][i])<1e-7);
  assert(Math.abs(formed[i][1]-[-.5,-.5,1.5,1.5][i])<1e-7);
  assert(Math.abs(collapsed[i][0])<1e-7&&Math.abs(collapsed[i][1]-.5)<1e-7);
}
assert.deepEqual(communicationHistory({threshold:0}),communicationHistory({periodic:true}));
const frequent=communicationHistory({periodic:true}).at(-1),sparse=communicationHistory({threshold:5}).at(-1);
assert.equal(frequent.broadcasts,244);
assert(sparse.broadcasts<frequent.broadcasts&&sparse.error>frequent.error);
assert.equal(safetyProjection().action,-.2);
assert(Math.abs(safetyProjection({distance:0,nominal:-1,kappa:1}).action)<1e-12);
assert.equal(safetyProjection({conflict:true}).action,null);
assert.equal(safetyProjection({distance:1,conflict:true}).feasible,true);
const ids=new Set(blocks.map(b=>b.id));
let guideLinks=0,mathCount=0;
for(const view of ['start','research','lab'])for(const lab of view==='lab'?['consensus','formation','communication','safety']:['consensus']) {
  const html=beginnerHTML(view,lab);
  for(const [,id]of html.matchAll(/data-block="([^"]+)"/g)){assert(ids.has(id));guideLinks++;}
  for(const [,math]of html.matchAll(/data-math="([^"]+)"/g)){katex.renderToString(math,{throwOnError:true,strict:'error'});mathCount++;}
}
for(const formula of guideFormulas)katex.renderToString(formula,{throwOnError:true});
let blockMathCount=0;
const sourceMetadata=JSON.parse(readFileSync(new URL('../docs/papers.json',import.meta.url),'utf8'));
for(const block of blocks) {
  for(const ref of block.refs)assert(sourceMetadata.find(p=>p.id===ref.paper)?.read_pages.includes(ref.page));
  for(const item of block.sections)for(const [,encoded]of item.html.matchAll(/data-math="([^"]+)"/g)) {
    katex.renderToString(encoded.replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&'),{throwOnError:true,strict:'error'});
    blockMathCount++;
  }
}
assert.equal(beginnerBlocks.length,12);
console.log('Teaching-model, formula and guide-link checks passed');
