# Visualisation

Here is a minimal example of how phyojs can interface with another phylogenetics visualisation library. We parse a tree and use phylojs to reroot it randomly in a html widget. We use phylocanvas to visualise the tree.

<iframe height="300" style="width: 100%;" scrolling="no" title="PhyloJS-paste-visualise-reroot" src="https://codepen.io/LeoFeatherstone/embed/yLrjLyL?default-tab=html%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/yLrjLyL">
  PhyloJS-paste-visualise-reroot</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### How random rerooting works

```javaScript
// Randomly reroot tree on button click
function onClick() {

    // Returns an index from 1,...,nNodes (0 is the root)
    let randomIndex = Math.floor(nNodes * Math.random() + 1)
    
    // Select node corresponding to index
    let randomNode = tree.nodeList[randomIndex]

    tree.reroot(randomNode)

    treeVis.setProps({
        source: phylojs.writeNewick(tree)
    })

}
```