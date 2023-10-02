import { Tree } from '../../';
import { newickRecurse } from './newick';

/** Writes tree in .nexus format. Undefined branch lengths set to 0.
 * @param {tree} tree The tree to write
 * @param {boolean} annotate Boolean to include annotations. Default is true.
 */
export function writeNexus(tree: Tree, annotate = true): string {
  let nexusStr = '#NEXUS\n\nbegin trees;\n';

  if (tree.root !== undefined)
    nexusStr +=
      `\ttree tree_1 = [&R] ${newickRecurse(tree.root, annotate)};` + '\n';

  nexusStr += 'end;';

  return nexusStr;
}
