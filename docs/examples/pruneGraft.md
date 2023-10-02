Here we demonstrate pruning and grafting of nodes usig the `.addChild()` and `.removeChild()` methods on the `Node` class. In effect, these can be used to add or remove clades and tips.

As a general node, using the `.copy()` method produces a deep copy of a node, and so is useful to avoid recursion issues with continual grafting.

## Pruning
```typescript
    let nwk = "((A,B),(C,D));"
    let tree = readNewick(nwk)  

    // Get ancestor of tips A and B
    let node = tree.getMRCA(tree.leafList.slice(0,2))
    // Prune
    tree
      .nodeList[node.parent.id] // Select node's parent by `id`
      .removeChild(node) // Pruning step

    console.log(`
      Original Nwk: ${nwk}
      Pruned Tree: ${writeNewick(tree)}
    `)
    // Returns
    // Original Nwk: ((A,B),(C,D));
    // Pruned Tree: (("C":0.0,"D":0.0):0.0):0.0;
```

## Grafting
```typescript
    let nwk = "((A,B),(C,D));"
    let tree = readNewick(nwk)  

    // Get ancestor of tips A and B. NB this is a `cherry` (A,B)
    let node = tree.getMRCA(tree.leafList.slice(0,2))

    // Graft cherry onto tip `A` 2 times to make a ladder.
    for (let i=0; i<2; i++) {
      tree
        //.nodeList[node.parent.id] // Select node's parent by `id`
        .leafList[i]
        .addChild(node.copy()) // .copy() to ensure we don't bump into recursion issues
    }

    console.log(`
      Original Nwk: ${nwk}
      Pruned Tree: ${writeNewick(tree)}
    `)
    // Return
    // Original Nwk: ((A,B),(C,D));
    // Pruned Tree: (((("A":0.0,"B":0.0):0.0)"A":0.0,(((("A":0.0,"B":0.0):0.0)"A":0.0,"B":0.0):0.0)"B":0.0):0.0,("C":0.0,"D":0.0):0.0):0.0;
```