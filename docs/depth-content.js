import {foundationDepth} from './depth-foundations.js';
import {methodDepth} from './depth-methods.js';

export const depthSections={...foundationDepth,...methodDepth};

export function deepenBlocks(blocks) {
  return blocks.map(block=>{
    const extra=depthSections[block.id];
    if(!extra)return block;
    // Keep the incumbent final self-check/limitation at the end of each lesson.
    const sections=[...block.sections.slice(0,-1),...extra,block.sections.at(-1)];
    return {...block,sections};
  });
}
