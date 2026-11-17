// Check the mathematics behind the diagrams and every current insertion point.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {matrixScene,motionScene,feedbackScene,consensusScene,safetyScene,energyScene,hankelScene,growthScene} from '../docs/visual-models.js';
import {visualIds,visualTopics,visualsHTML,inlineVisual,conceptVisuals,paperVisuals,deepVisuals} from '../docs/visual-math.js';
import {blocks} from '../docs/content.js';
import {paperProfiles} from '../docs/paper-profiles.js';
import {deepReadings} from '../docs/deep-readings.js';
import {studiesHTML} from '../docs/paper-studies.js';
const require=createRequire(import.meta.url),katex=require('../docs/vendor/katex/dist/katex.min.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const determinant=a=>a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
assert.equal(visualIds.length,10);
for(const name of ['h','nominal','drift'])assert(visualsHTML('safety').includes(`data-vm-output="${name}"`),`Missing safety readout ${name}`);
for(const id of visualIds){const html=inlineVisual(id);assert(!html.match(/NaN|undefined|Infinity/),id);for(const[,name,value]of html.matchAll(/\b(x|y|x1|y1|x2|y2|width|height|cx|cy|r)="([^"]+)"/g))assert(Number.isFinite(Number(value)),`${id}: invalid ${name}=${value}`);assert(visualsHTML(id).includes('vm-scene'));katex.renderToString(visualTopics[id].formula,{throwOnError:true,strict:'error'});assert(blocks.some(b=>b.id===visualTopics[id].concept));}
assert.deepEqual(matrixScene('shear').y,[3,1]);assert.deepEqual(matrixScene('collapse').basis,[[1,0],[0,0]]);
for(const t of [.5,1,2,3]){const s=motionScene(t),dt=1e-4;near((motionScene(t+dt).position-motionScene(t-dt).position)/(2*dt),s.velocity);near(s.distance,t*t);let previous=0;for(const n of [2,4,8,16]){const width=t/n;let sum=0;for(let i=0;i<n;i++)sum+=2*i*width*width;assert(sum>previous&&sum<s.distance);previous=sum;}}
near(feedbackScene(.5,1).x,6);near(feedbackScene(.5,8).error,8/256);assert(feedbackScene(1.5,1).error<0);
assert.deepEqual(consensusScene(false,1).x,[.75,3,5.25]);near(consensusScene(false,8).mean,3);near(consensusScene(true,8).x[2],6);assert(consensusScene(true,8).x[0]<2);
const projected=safetyScene(.2,-1,0);near(projected.u,-.4);assert(projected.u>=projected.lower);assert.equal(safetyScene(.2,-1,2).u,null);
near(energyScene(true,8).value,6.5);near(energyScene(false,8).value,6.5*.75**16);near(growthScene(-1,8).magnitude,4);assert(growthScene(-1.3,8).magnitude>4);
const rich=hankelScene(false,1);assert.deepEqual(rich.window,[0,0,1]);assert.equal(determinant(rich.matrix),-1);assert(hankelScene(true).matrix.every(row=>row.every(v=>v===1)));
for(const [id,visual]of Object.entries(conceptVisuals)){assert(blocks.some(b=>b.id===id),id);assert(visualTopics[visual]);}
const sources=JSON.parse(readFileSync(new URL('../docs/study-sources.json',import.meta.url),'utf8'));
for(const p of paperProfiles){assert(paperVisuals[p.id]);assert(studiesHTML({study:p.id,sources,readers:[],isPublic:true}).includes('class="math-visual vm-inline"'));}
let figures=0;for(const p of deepReadings){const html=studiesHTML({deep:p.id,sources,readers:[],isPublic:true});const expected=Object.keys(deepVisuals[p.id]).length;assert.equal([...html.matchAll(/class="math-visual vm-inline"/g)].length,expected);figures+=expected;}
console.log(JSON.stringify({visualTopics:10,illustratedConcepts:Object.keys(conceptVisuals).length,illustratedPapers:20,inlineDeepFigures:figures,checks:'Arithmetic, rank, derivative/integral correspondence, mean conservation, infeasibility, energy counterexample, mode growth and diagram placement'}));
