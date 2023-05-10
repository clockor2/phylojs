import { Node } from './Node';
import { Tree } from './Tree';

interface PhylogenyWriter {
  (tree: Tree): string;
}

interface Write {
  newick: PhylogenyWriter;
  nexus: PhylogenyWriter;
  //   phyloXML: PhylogenyWriter;
  //   neXML: PhylogenyWriter;
}

export const Write: Write = (function () {
  //const phyloXMLNS = 'http://www.phyloxml.org';
  //const neXMLNS = 'http://www.nexml.org/2009';
  //const xsiNS = 'http://www.w3.org/2001/XMLSchema-instance';

  function newickRecurse(node: Node, annotate: boolean): string {
    let res = '';
    if (!node.isLeaf()) {
      res += '(';
      for (let i = 0; i < node.children.length; i++) {
        if (i > 0) res += ',';
        res += newickRecurse(node.children[i], annotate);
      }
      res += ')';
    }

    if (node.label !== undefined) res += `"${node.label}"`;

    if (node.hybridID !== undefined) res += `#${node.hybridID}`;

    if (annotate) {
      const keys = Object.keys(node.annotation);
      if (keys.length > 0) {
        res += '[&';
        for (let idx = 0; idx < keys.length; idx++) {
          const key = keys[idx];

          if (idx > 0) res += ',';
          res += `"${key}"=`;
          const value = node.annotation[key];
          if (Array.isArray(value)) {
            res += `{${String(value.join(','))}}`; // Convert the array to a comma-separated string
          } else {
            res += `"${String(value)}"`; // Explicitly convert the value to a string
          }
        }
        res += ']';
      }
    }

    if (node.branchLength !== undefined) res += `:${node.branchLength}`;
    else res += ':0.0';

    return res;
  }

  function newickWriter(tree: Tree): string {
    let newickStr = '';

    if (tree.root !== undefined)
      newickStr += newickRecurse(tree.root, false) + ';';

    return newickStr;
  }

  function nexusWriter(tree: Tree): string {
    let nexusStr = '#NEXUS\n\nbegin trees;\n';

    if (tree.root !== undefined)
      nexusStr +=
        `\ttree tree_1 = [&R] ${newickRecurse(tree.root, true)};` + '\n';

    nexusStr += 'end;';

    return nexusStr;
  }
  return {
    newick: newickWriter,
    nexus: nexusWriter,
  };
})();
