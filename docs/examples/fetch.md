# Reading trees from a URL

Here, we demonstrate how to read in a tree from a url using a `fetch()` request from the fetch API. In this case, we read Newick trees from a URL as part of a small app that counts the number of trees in the link and plots the first one with Phylocanvas.

The `fetch()` request is nested in the function `treesFromURL()`, which also handles plotting data to the screen. Key features are that the fetch request is asynchronous, so we annotate it with `await` and annotate the wrapper function with `async`. You can learn more about asynchronous function in JavaScript [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

You can copy a url linking 5 trees that we use for testing here:
```text
https://raw.githubusercontent.com/clockor2/phylojs/main/test/data/egTree.nwk
```


<p class="codepen" data-height="300" data-theme-id="dark" data-default-tab="html" data-slug-hash="XWQYVeV" data-editable="true" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/XWQYVeV">
  fetch-url-tree</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>