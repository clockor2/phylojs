# Modifying annotations

This is another example, in addition to "Annotations and Pre-Order Traversal", that shows how annotations can be modified without a Pre-Order search.

Here, we show show how annotations can be extracted and modified in a loop. We swap Blue an Green type annotations to Red and Yellow on a small tree.

All node objects have an `annotation` field where annotations. The `annotation` fiel itself stores an object for all annotated tags. For example `Node.annotations = {Type: Blue}` for some leaf nodes in the following example.

Altered annotations are then written back to newick.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-slug-hash="vYMrRKe" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/vYMrRKe">
  modify-annotations</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>