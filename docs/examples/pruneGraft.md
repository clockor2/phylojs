Here we demonstrate pruning and grafting of nodes usig the `.addChild()` and `.removeChild()` methods on the `Node` class. In effect, these can be used to add or remove clades and tips.

As a general note, using the `.copy()` method produces a deep copy of a node, and so is useful to avoid recursion issues, especially with iterative grafting.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html" data-slug-hash="XWQYVvB" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/XWQYVvB">
  prune-graft</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>