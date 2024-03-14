import { Tree, Node } from '../../';
import { newickRecurse } from './newick';

/** Writes tree in .nexus format. Undefined branch lengths set to 0.
 * @param {tree} tree The tree to write
 * @param {boolean} annotate Boolean to include annotations. Default is true.
 */
export function writeNexus(
  tree: Tree,
  annotationWriter: (
    annotation: typeof Node.prototype.annotation
  ) => string = _annotation => ''
): string {
  let nexusStr = '#NEXUS\n\nbegin trees;\n';

  if (tree.root !== undefined)
    nexusStr +=
      `\ttree tree_1 = [&R] ${newickRecurse(tree.root, annotationWriter)};` +
      '\n';

  nexusStr += 'end;';

  return nexusStr;
}
