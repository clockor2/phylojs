# App for basic tree statistics

Here we build an app that calculates basic tree statistics for a given input tree.

Note that because we calculate the Gamma Statistic (Pybus and Harvey 2000), we need an ultrametric tree as input, meaning a tree where all the leaves are the same distance above the root.

In PhyloJS, you can check this using the `isUltrametric()` method on the `Tree` class, but for the sake of simplicity we leave it to the user to ensure the tree is ultrametric. As an aside, PhyloJS allows for a difference of 1e-6 between tip heights above the root when deciding if a tree is ultrametric. Users can set this tolerance though (see API).

If you don't have an ultremetric tree in any of the above formats handy to test out, then you can download a [small Newick tree here](../downloads/tree.newick){:download="tree.newick"}.



<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html,result" data-slug-hash="VwNdLxK" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/VwNdLxK">
  tree-stats</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>