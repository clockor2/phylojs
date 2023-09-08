# Manipulate Trees

The Tree class in the provided code is a fundamental structure for storing and managing phylogenetic trees. It includes methods for manipulating and accessing information about the tree.

## Importing the class

This class is exported from a module. You can import it into your code as follows:

```javascript
import { Tree } from '../src/Tree';
```

## Class instantiation

A Tree object is created by providing a Node object (representing the root of the tree) to the Tree constructor:

```javascript
const rootNode = new Node(0);
const tree = new Tree(rootNode);
```

## Class methods

Here are the key methods for the Tree class:

- `reroot(node, prop)`: Re-roots the tree at the specified node. Optionally, a proportion can be specified to position the root along the branch leading to the node.

- `getTotalBranchLength()`: Returns the total sum of the lengths of all branches in the tree.

- `getRTTDist()`: Returns an array of root-to-tip distances for all leaves in the tree.

- `getSubtree(node)`: Returns a new Tree object representing the subtree rooted at the specified node.

- `getMRCA(nodes)`: Returns the most recent common ancestor (MRCA) of the given list of nodes.

- `getTipLabels()`: Returns an array of labels of all leaf nodes in the tree.

- `getNodeList()`: Returns an array of all nodes in the tree.

- `getLeafList()`: Returns an array of all leaf nodes in the tree.

## Function usage

Below is a simple usage of the Tree class methods:

```javascript
const rootNode = new Node(0);
const tree = new Tree(rootNode);

// Access nodes
const nodes = tree.getNodeList();

// Reroot the tree at the second node
tree.reroot(nodes[1]);

// Get total branch length
const totalBranchLength = tree.getTotalBranchLength();

// Get root-to-tip distances
const rttDist = tree.getRTTDist();

// Get subtree
const subtree = tree.getSubtree(nodes[1]);

// Get most recent common ancestor of two nodes
const mrca = tree.getMRCA([nodes[1], nodes[2]]);

// Get tip labels
const tipLabels = tree.getTipLabels();
```

The Tree class is essential for various phylogenetic applications including tree manipulation, tree metrics calculation, and tree traversal. It works together with the Node class, where each node represents a vertex in the tree. Both classes are designed to be versatile and easy to use, catering to both simple and complex phylogenetic tree applications.

## Testing the Class Methods

The codebase includes a series of tests to verify the functionality of the Tree class. For instance, it tests rerooting, subtree extraction, and other operations. These tests ensure that the Tree class methods behave as expected when applied to a variety of tree structures.

Ensure to run these tests after any modifications to the Tree class to ensure its integrity. The provided tests can be a helpful guide for extending the class with new features or for developing similar tests in the future for newly added methods.
