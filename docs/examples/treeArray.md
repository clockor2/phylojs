# Working with arrays of trees
This example demonstrates how one can manipulate an array of trees for efficient bulk processing.

Arrays of trees (`Tree[]`) can be read in with any of the `readTrees*()` functions. That is, `readTreesFromNewick()`, `readTreesFromNexus()`, `readTreesFromPhyloXML()`, and `readTreesFromNeXML()`. The `read()` function also returns an array of trees, taking flags for the input string and expected file format.

In the below example, we parse two trees from phyloXML format, reroot them, rescale their branches randomly, and ladderise. Output is then written to newick where it could, for example, be passed to visualisation code.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-slug-hash="bGJKvzy" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/bGJKvzy">
  tree-arrays</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>