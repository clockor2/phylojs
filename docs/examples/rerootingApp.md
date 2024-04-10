# Visualisation

Here is a minimal example of a small app that randomly reroots a starting tree. We parse a tree and use phylojs to reroot it randomly in a html widget. We use phylocanvas to visualise the tree. This example demonstrates rerooting, and connection with a plotting library such as phylocanvas.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html,result" data-slug-hash="yLrjLyL" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/yLrjLyL">
  visualise-reroot</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

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