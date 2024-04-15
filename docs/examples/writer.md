# Writing trees

The `writeNewick` and `writeNexus` functions are used to convert a tree data structure back into a Newick or Nexus formatted string, respectively. Both Newick and Nexus formats are commonly used in phylogenetics to represent tree data structures.

## Importing the functions

These functions are exported from a module. Import the functions to use them in your code as follows:

```javascript
import { writeNewick, writeNexus } from '../src/Write';
```

## Function signatures

The `writeNewick` function has the following signature:

```javascript
writeNewick(
    tree: Tree,
    annotationWriter: (annotation: typeof Node.prototype.annotation) => string = _annotation => ''
): string 
```

**Parameters**

- `tree` (Tree): The tree object to be converted into a Newick string.
- `annotationWriter` (annotationWriter: (annotation: typeof Node.prototype.annotation) => string = _annotation => ''): Function converting node annotations to string. Defaults to empty string(no annotation case). Can be user defined or use in-built beastAnnotation() or nhxAnnotation()

**Return**

- string: A Newick formatted string representing the tree.

The `writeNexus` function has the following signature:

```javascript
writeNexus(
    tree: Tree,
    annotationWriter: (annotation: typeof Node.prototype.annotation) => string = _annotation => ''
): string 
```

**Parameters**

- `tree` (Tree): The tree object to be converted into a Nexus string.
- `annotationWriter` (annotationWriter: (annotation: typeof Node.prototype.annotation) => string = _annotation => ''): Function converting node annotations to string. Defaults to empty string(no annotation case). Can be user defined or use in-built beastAnnotation() or nhxAnnotation()

**Return**

- string: A Nexus formatted string representing the tree.

## Function usage

```javascript
const tree; // Tree object
const newickString = writeNewick(tree); // annotations omitted
const newickString = writeNewick(tree, beastAnnotations); // include annotations as in BEAST Newick
const newickString = writeNewick(tree, nhxAnnotations); // include annotations as in NHX
const nexusString = writeNexus(tree); // Annotations options same as for `writeNewick()`
```

## Function details

The `writeNewick` function uses recursion to traverse the Tree object and build the corresponding Newick string. The `writeNexus` function, on the other hand, uses the same recursive traversal method, but appends additional Nexus-specific formatting to the output string.

Both functions handle node labels, hybrid IDs, and annotations, as well as branch lengths.

## How We Test Each Function

The module includes tests to validate both `writeNewick` and `writeNexus` functions. The tests ensure that the functions can correctly convert a Tree object back to Newick or Nexus strings, with variations for including/excluding annotations.

```javascript
import { writeNewick } from '../src/Write';
import { readNewick } from '../src/Reader';

describe('TreeFromNewick', () => {
  test('init', () => {
    const inNewick = '("A":1,("B":1,"C":1):1):0.0;';
    const tree = readNewick(inNewick);
    const outNewick = writeNewick(tree);
    expect(outNewick).toBe(inNewick);
  });
});
```

The test shown above creates a Tree object from a Newick string using the `readNewick` function. It then uses `writeNewick` to convert the tree back to a Newick string and checks if the resulting string is identical to the input string. A similar testing approach can be used for `writeNexus`.