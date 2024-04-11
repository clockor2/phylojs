# Annotations and Pre-Order Traversal

Here is an example that demonstrating how developers might work with node annotations and employ a pre-order traversal of a tree. We choose to demonstrate these together, since it makes sense to use them together. - If you want do do something to once node, it's likely you might want to apply it to other nodes given some logical condition.

In this example, we develop a function to calculate the internal to external branch length ratio (IE ratio) of a tree - a measure of 'tippiness' with larger values corresponding to shorter external branch lengths. We then calculate the IE ratio of the subtree descending from each internal node of a starting tree, and annotate each node with this value.

For those coming to PhyloJS without a computer sciance background (like the writer of this tutorial),  a pre-order traversal refers to the process of applying an operation to each node in a tree starting at the root and interating through each descending node. There are many other way of trversing a tree [here](https://en.wikipedia.org/wiki/Tree_traversal).

We also present this example in `TypeScript`, since it's a good example of something that might be part of a larger application where type-safety is valuable. If you want to run the example in `JavaScript`, just delete the type annotations (eg. delete `: number`, `: string`, and so on after variable declarations). You can then use the JavaScript compiler if you go to the Codepen link.

One final thing to note is that the pre-order traversal in PhyloJS is a method on the `Node` class rather than the `Tree` class. Hence, when we do a pre-order traversal in the example code, we apply it as `tree.root.applyPreOrder()` to start at the root node. Why is it a method on Nodes rather than Trees? This is for flexibilty. - You might want to begin a pre-order traversal at an internal node, rather than for the tree as a whole.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html" data-slug-hash="xxezGQG" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/xxezGQG">
  preorder-annotations</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>