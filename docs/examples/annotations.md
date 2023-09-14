# Handling annotations

All node objects have an `annotation` field where annotations. The `annotation` fiel itself stores an object for all annotated tags. For example `Node.annotations = {Type: Blue}` for some leaf nodes in the following example.

Here, we show show how annotations can be extracted and modified in a loop. We swap Blue an Green type annotations to Red and Yellow on a small tree.

Altered annotations are then writtedn back to newick or nexus.

```typescript
        let newick = '((A[&Type=Blue],B[&Type=Blue]),C[&Type=Green]);'
        let tree = readNewick(newick)

        if (tree.leafList !== undefined) { // Avoids 'leafList' possibly undefined error

            for (let i=0; i<tree.leafList.length; i++) {
                if(tree.leafList[i].annotation.Type == 'Blue') {
                    tree.leafList[i].annotation.Type = 'Red'
                } else {
                    tree.leafList[i].annotation.Type = 'Yellow'
                }
            }
        }

        console.log(writeNewick)
        // (("A"[&"Type"="Red"]:0.0,"B"[&"Type"="Red"]:0.0):0.0,"C"[&"Type"="Yellow"]:0.0):0.0;
        // Note types changed ^
```