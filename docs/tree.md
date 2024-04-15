# Tree Class in TypeScript

The `Tree` class is designed to handle both simple and complex tree structures, including phylogenetic networks. The class provides a variety of methods for manipulating and analyzing trees.

## Properties

The `Tree` class has several properties:

- `root`: The root node of the tree.
- `_nodeList`: A private property that stores a list of all nodes in the tree.
- `nodeIDMap`: A map from node IDs to nodes.
- `labelNodeMap`: A map from node labels to nodes.
- `_leafList`: A private property that stores a list of all leaf nodes in the tree.
- `recombEdgeMap`: A map from recombination edge IDs to source/destination node pairs.
- `ultrametric`: A boolean indicating whether all tips are the same age.

## Methods

The `Tree` class provides a variety of methods for manipulating and analyzing trees. Below is an overview, but please see the API for a complete description:

- `computeNodeHeights()`: Computes the height of each node above the root.
- `isUltrametric()`: Checks whether all tips are the same age.
- `ladderise()`: Orders the child nodes of each node by the number of descending tips.
- `getBranchLengths()`: Returns the branch lengths in the order matching the node list.
- `getRTTDist()`: Returns the root-to-tip distances.
- `reassignNodeIDs()`: Assigns new node IDs.
- `clearCaches()`: Clears various node caches.
- `getNode()`: Gets a node given its numerical ID.
- `getNodeByLabel()`: Retrieves a node given its label.
- `getRecombEdgeMap()`: Retrieves a map from recombination edge IDs to source/destination node pairs.
- `isRecombSrcNode()`: Checks if a node is a source node for a hybrid edge in the tree.
- `isRecombDestNode()`: Checks if a node is a destination node for a hybrid edge in the tree.
- `isNetwork()`: Checks if the tree is a phylogenetic network.
- `getSubtree()`: Returns a subtree descending from a given node.
- `getMRCA()`: Gets the most recent common ancestor of a set of nodes.
- `getTipLabels()`: Gets all tip names from the tree or descending from a node.
- `getTotalBranchLength()`: Returns the sum of all defined branch lengths.
- `reroot()`: Reroots the tree at a given node.
- `getInternalNodeHeights()`: Returns the height above the root for each internal node.
- `gammaStatistic()`: Calculates the Gamma statistic from Pybus and Harvey 2000.
- `sackinIndex()`: Returns the Sackin Index, which measures imbalance.
- `isBinary()`: Checks whether the tree is binary.
- `collessIndex()`: Returns the Colless Imbalance index.