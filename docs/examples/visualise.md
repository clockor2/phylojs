# Visualisation

This tutorial gives a minimal example of how phyojs can interface with another phylogenetics visualisation library. We parse a tree and use phylojs to reroot it randomly in a html widget. We use phylocanvas to visualise the tree.
You can see the final app [here](./visualise.html).
### Add HTML scaffold
First, we lay down the skeleton of the html:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passing phylojs to visualisation</title>
</head>

<body>
</body>
</html>
```

### Load libraries
Next, we can include phylojs and phylocanvas via a `<script/>` tag in the html. This is a useful way to loading the library if one is making a relatively simple app that doesn't require much code or many html pages. For more complex apps, a more conventional installation (see [installation](../index.md)) is probably preferable.

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passing phylojs to visualisation</title>
</head>

<body>

    <button onclick="onClick()">Click to Randomly Reroot</button>
    <div id="demo"></div>

    <!-- Include phylojs and phylocanvas -->
    <script src="https://unpkg.com/@phylocanvas/phylocanvas.gl@latest/dist/bundle.min.js"></script>
    <script src="https://unpkg.com/phylojs@latest/lib/dist/phylojs.min.js"></script>

</body>
</html>
```

### Add rerooting code
Finally, we can add the phylojs code to parse and reroot the tree as well as the phylocanvas code to render it.

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passing phylojs to visualisation</title>
</head>

<body>

    <button onclick="onClick()">Click to Randomly Reroot</button>
    <div id="demo"></div>

    <!-- Include phylojs and phylocanvas -->
    <script src="https://unpkg.com/@phylocanvas/phylocanvas.gl@latest/dist/bundle.min.js"></script>
    <script src="https://unpkg.com/phylojs@latest/lib/dist/phylojs.min.js"></script>
    <!-- JS code for tree -->
    <script>
        let newick = `(Bovine:0.69395,(Gibbon:0.36079,(Orangutan:0.33636,(Gorilla:0.17147,(Chimp:1.19268,Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460);`
        let tree = phylojs.readNewick(newick)
        let nNodes = tree.nodeList().length

        // Initial rendering
        const treeVis = new phylocanvas.PhylocanvasGL(
            document.querySelector("#demo"),
            {
                size: { width: 800, height: 600 },
                source: phylojs.writeNewick(tree),
                showLeafLabels: true,
                showLabels: true
            },
        )
        // Randomly reroot tree on button click
        function onClick() {

            let i = Math.floor(nNodes * Math.random() + 1) // Returns an integer from 1,...,nNodes
            let node = tree.nodeList()[i]

            tree.reroot(node)

            treeVis.setProps({
                source: phylojs.writeNewick(tree)
            })

        }
    </script>

</body>

</html>
```