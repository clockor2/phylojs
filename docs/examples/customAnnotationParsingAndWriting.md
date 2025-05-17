# How to use custom annotation parsers and writer with readNewick and writeNewick

PhyloJS provides flexibility in handling custom annotations in Newick format trees through custom parser and writer functions. This example demonstrates how to read a Newick string with custom annotations and write it back with custom formatting.

Let's say we have a Newick tree with some custom annotation format with key value pairs separated by ';'. This is a terrible idea in practice because ';' signifies the end of a 
Newick string, but for the sake of an example, let's run with it.

NOTE: As of 17-05-2025, custom parsers still expect annotations to be enclosed in square brackets. This is a limitation of the current implementation and will be fixed in future releases.

```javascript

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="ByyEjNW" data-pen-title="Custom Annotation Parsing and Writing" data-user="LeoFeatherstone" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/LeoFeatherstone/pen/ByyEjNW">
  Custom Annotation Parsing and Writing</a> by Leo Featherstone (<a href="https://codepen.io/LeoFeatherstone">@LeoFeatherstone</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://public.codepenassets.com/embed/index.js"></script>