# Finding MRCA for a set of nodes

This script demonstrates how the `getNodeByLabel`, `getMRCA`, and `getClade` methods on the `Tree` object can be wrapped in a function to find and extract subtrees given a newick string and list of desired taxa.

```typescript
import { readNewick, Tree, Node } from 'phylojs';

function findMRCAandExtractSubtree(newickStr: string, labels: string[]): Tree {
  const tree: Tree = readNewick(newickStr);
  const nodes: Node[] = labels.map(label => {
    const node = tree.getNodeByLabel(label);
    if (node === null) throw new Error(`No node found with label ${label}`);
    return node;
  });

  const mrca = tree.getMRCA(nodes);
  if (mrca === null) throw new Error('MRCA is null');

  const subtree: Tree = tree.getClade(mrca);

  return subtree;
}

const newickStr: string = '((A:0.1,B:0.2):0.3,(C:0.3,D:0.4):0.5,E:0.6);'; // Newick string as input
const labels: string[] = ['A', 'B', 'D']; // Leaf labels to find MRCA

try {
  const subtree: Tree = findMRCAandExtractSubtree(newickStr, labels);
  // Process the 'subtree' as needed
  // For example, you might print it to the console
  // console.log(subtree);
} catch (error) {
  console.error(error);
}
```
