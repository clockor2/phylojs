# Rerooting and ladderising

In this example we will reroot at each node of a dummy tree and check that the tree length (the sum of all branch lengths) is identical each time.

This example demonstrates use of the `.reroot`, `.nodeList`, and `.getTotalBranchLength()` methods.

Node that `.nodeList` returns an array of nodes (`Node[]`), the first of which is always the root. `.reroot()` throws an error if you try to reroot at the root, which is why we start out loop from the 1st rather than 0th node below.

```typescript
        let newick = '(("D_2000":1.0,"E_2003":1.2):3.0,("C_2005":2.5,("A_2010":1.8,"B_2011":1.07):1.0):1.2):4.0;'
        let tree = readNewick(newick)

        let nodes = tree.nodeList
        
        let length: number[] = []
        // Note i starts at 1 as 0th node is the root
        for (let i=1; i<nodes.length; i++) {

            tree.reroot(nodes[i])
            tree.ladderise()  // ladderising should also preserve length

            length.push(tree.getTotalBranchLength())

        }

        console.log(`
            legnth: ${length.map(e => e.toFixed(3))}
        `)
        // Returns:
        // legnth: 12.770,12.770,12.770,12.770,12.770,12.770,12.770,12.770
```

