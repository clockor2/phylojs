# Extracting Clades

This script demonstrates how the `getNodeByLabel`, `getMRCA`, and `getClade` methods on the `Tree` class can be wrapped in a function to find and extract clades relating a subset of tips. 

The particular function here takes a Newick string and list of desired taxa. We use TypeScript here as this would likely be part of a larger application needing type safety. Just remove type annotations and change the compiler in codepen to run it in JavaScript.

<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="js" data-slug-hash="bGJKLjL" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/bGJKLjL">
  extract-subtree</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>