Here, we demonstrate how we can calculate a tree summary statistic at each internal node of a tree. We calculate the internal to external branch length ratio for the subtree descending from each internal node and add it as an annotation to each node. We define a function to calculate the internal to external branch length ratio `getBranchLengthRatio()` as well as demonstrate use of the `.isLeaf()` and `.applyPreOrder()` methods on the `Node` class.

The internal to external branch length ratio is defined as the ratio of the sum of internal branch lenghts to the sum of external branch lengths (leading to tips). It is a commonly used statistic that describes how 'tippy' or 'stemmy' trees appear.


```typescript
// Internal to external branch length ratio
    function getBranchLengthRatio(tree: Tree): number {

      let sumInternal: number = 0.0;
      let sumExternal: number = 0.0;

      for (let i=0; i<tree.nodeList.length; i++) {
        if(tree.nodeList[i].branchLength !== undefined){
          if (tree.nodeList[i].isLeaf()) {
            sumExternal += tree.nodeList[i].branchLength
          } else {
            sumInternal += tree.nodeList[i].branchLength
          }
        }
      }
      return sumInternal / sumExternal;
    }

    let nwk = `((a:2,b:2):1,(c:1,d:1):4);`
    let tree = readNewick(nwk)

    // IE ratio for subtrees descending from each node, except tips
    tree.root.applyPreOrder((node: Node) => {
      if(!node.isLeaf()) {
        let ieRatio = getBranchLengthRatio(tree.getSubtree(node))
        node.annotation = {ieRatio: ieRatio.toFixed(2)}
      }
    });

    // Expect annotations in newick with `true` flag
    console.log(writeNewick(tree, true))
    // Returns:
    // (("a":2,"b":2)[&"ieRatio"="0.25"]:1,("c":1,"d":1)[&"ieRatio"="2.00"]:4)["ieRatio"="0.83"]:0.0;
```
