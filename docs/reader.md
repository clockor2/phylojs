# Read

The `readNewick` function is used to parse a Newick string into a tree data structure. Newick format is a simple way to represent tree data structures, often used in phylogenetics, the study of evolutionary relationships among biological entities.

## Importing the function

This function is exported from the 'Reader' module. Import the function to use it in your code as follows:

```javascript
import { readNewick } from '../src/Reader';
```

## Function signature

The `readNewick` function takes one argument:

```javascript
readNewick(newick: string): Tree
```

**Parameters**

- `newick` (string): The Newick string to be parsed.

**Return**

- `Tree`: A tree object which represents the parsed Newick string.

## Function usage

```javascript
const newick =
  '((D:0.723274,E:0.567784):0.463812,(B:0.243269,C:0.202655):0.0576571,A:0.622173);';
const tree = readNewick(newick);
```

In the example above, the `newick` string represents a tree with 5 leaves (A, B, C, D, E) and the corresponding branch lengths. This string is passed to the `readNewick` function, which returns a `Tree` object.

## Errors and exceptions

The `readNewick` function throws `ParseException` errors if it encounters problems parsing the input Newick string. A `ParseException` error contains a message describing the error, and optionally a context of the error, showing the area in the input string where the problem occurred.

## Function testing

The 'Reader' module is equipped with tests that validate the `readNewick` function. The tests use the `writeNewick` function from the 'Write' module to convert the parsed tree back to a Newick string, and compare the result with the original input string.

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

The example above shows a test that creates a tree from a Newick string, converts the tree back to a Newick string, and checks if the resulting string is identical to the input string.

Please ensure that your input Newick string is well-formed and adheres to the Newick format standards, to avoid parsing errors.
