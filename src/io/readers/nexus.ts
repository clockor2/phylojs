import { Tree } from '../../tree';
import { SkipTreeException } from '../../utils/Error';
import { readNewick } from './newick';

export function readNexus(nexus: string): Tree[] {
  const trees: Tree[] = [];
  const lines = nexus.split('\n');

  let inTrees = false;
  let fullLine = '';
  const tmap: { [key: string]: string } = {};

  for (let i = 1; i < lines.length; i++) {
    fullLine += lines[i].trim();

    if (fullLine[fullLine.length - 1] !== ';') continue;

    // Remove comments
    fullLine = fullLine.replace(/\[[^&][^\]]*\]/g, '').trim();

    if (!inTrees) {
      if (fullLine.toLowerCase() === 'begin trees;') inTrees = true;
      fullLine = '';
      continue;
    }

    if (fullLine.toLowerCase() === 'end;') break;

    // Parse translate line
    if (fullLine.toLowerCase().startsWith('translate')) {
      const tStringArray = fullLine.slice(9, fullLine.length - 1).split(',');
      for (let j = 0; j < tStringArray.length; j++) {
        const tvec = tStringArray[j].trim().split(/\s+/);
        const tkey = tvec[0];
        let tval = tvec.slice(1).join(' ');
        tval = tval.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        tmap[tkey] = tval;
      }
      fullLine = '';
      continue;
    }

    // Parse tree line
    const matches = /tree (\w|\.)+ *(\[&[^\]]*] *)* *= *(\[&[^\]]*] *)* */.exec(
      fullLine.toLowerCase()
    );
    if (matches !== null) {
      const eqIdx = matches[0].length;
      try {
        const tree = readNewick(fullLine.slice(eqIdx));
        trees.push(tree);
      } catch (e) {
        if (e instanceof SkipTreeException) {
          console.log('Skipping Nexus tree: ' + e.message);
        } else {
          throw e;
        }
      }
    }

    fullLine = '';
  }

  return trees;
}
