import { Tree } from '@phylojs';
import { SkipTreeException } from '@phylojs/utils/error';
import { readNewick } from './newick';

// Function to extract the translate mapping
export function getTranslateFromNexus(nexus: string): {
  [key: string]: string;
} {
  const tmap: { [key: string]: string } = {};
  const lines = nexus.split('\n');
  let fullLine = '';

  for (let i = 1; i < lines.length; i++) {
    fullLine += lines[i].trim();

    // Remove comments
    fullLine = fullLine.replace(/\[[^&][^\]]*\]/g, '').trim();

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
      break;
    }
  }

  return tmap;
}

function translateTree(tree: Tree, tmap: { [key: string]: string }): Tree {
  // traverse nodes
  tree.root.applyPreOrder(node => {
    // If node's identifier exists in tmap, replace it
    if (node.label && tmap[node.label]) {
      node.label = tmap[node.label];
    }
  });
  return tree;
}

function _getTreesFromNexus(nexus: string, singleTree?: boolean): Tree[] {
  const trees: Tree[] = [];
  const lines = nexus.split('\n');
  let inTrees = false;
  let fullLine = '';

  const tmap = getTranslateFromNexus(nexus); // Retrieve the translation mapping

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

    // Parse tree line
    const matches = /tree (\w|\.)+ *(\[&[^\]]*] *)* *= *(\[&[^\]]*] *)* */.exec(
      fullLine.toLowerCase()
    );
    if (matches !== null) {
      const eqIdx = matches[0].length;
      try {
        let tree = readNewick(fullLine.slice(eqIdx));
        tree = translateTree(tree, tmap); // Use the translation map here
        trees.push(tree);
        if (singleTree) return trees; // If only one tree is requested, return immediately
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

export function readNexus(nexus: string): Tree {
  const trees = _getTreesFromNexus(nexus, true);
  if (trees.length === 0) {
    throw new Error('No trees found in Nexus.');
  }
  return trees[0];
}

export function readTreesFromNexus(nexus: string): Tree[] {
  const trees = _getTreesFromNexus(nexus, false);
  return trees;
}
