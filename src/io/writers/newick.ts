import { Node, Tree } from '../../';

/**
 * Writes tree in .newick format. Undefined branch lengths set to 0.
 * @param {tree} tree The tree to write
 * @param {boolean} annotate Boolean to include annotations. Default is false.
 */
export function writeNewick(tree: Tree, annotate = false): string {
  let newickStr = '';

  if (tree.root !== undefined)
    newickStr += newickRecurse(tree.root, annotate) + ';';

  return newickStr;
}

export function newickRecurse(node: Node, annotate: boolean): string {
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
