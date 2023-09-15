# Write

The `writeNewick` and `writeNexus` functions are used to convert a tree data structure back into a Newick or Nexus formatted string, respectively. Both Newick and Nexus formats are commonly used in phylogenetics to represent tree data structures.

## Importing the functions

These functions are exported from a module. Import the functions to use them in your code as follows:

```javascript
import { writeNewick, writeNexus } from '../src/Write';
```

## Function signatures

The `writeNewick` function has the following signature:

```javascript
writeNewick(tree: Tree, annotate: boolean = false): string
```

**Parameters**

- `tree` (Tree): The tree object to be converted into a Newick string.

**Return**

- string: A Newick formatted string representing the tree.

The `writeNexus` function has the following signature:

```javascript
writeNexus(tree: Tree, annotate: boolean = true): string
```

**Parameters**

- `tree` (Tree): The tree object to be converted into a Nexus string.

**Return**

- string: A Nexus formatted string representing the tree.

## Function usage

```javascript
const tree = createTreeObject(); // Function to create the Tree object, not provided
const newickString = writeNewick(tree);
const nexusString = writeNexus(tree);
```

In the example above, `createTreeObject()` is a hypothetical function that returns a Tree object. This tree is then passed to `writeNewick` and `writeNexus` functions, which return Newick and Nexus strings respectively.

## Function details

The `writeNewick` function uses recursion to traverse the Tree object and build the corresponding Newick string. The `writeNexus` function, on the other hand, uses the same recursive traversal method, but appends additional Nexus-specific formatting to the output string.

Both functions handle node labels, hybrid IDs, and annotations, as well as branch lengths. If a node's branch length is undefined, a default value of 0.0 is used.

## Function testing

The module includes tests to validate both `writeNewick` and `writeNexus` functions. The tests ensure that the functions can correctly convert a Tree object back to Newick or Nexus strings.

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

Please ensure that your input Tree object is correctly formed and adheres to the tree data structure standards, to avoid writing errors.
