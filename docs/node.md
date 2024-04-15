# Node Class in PhyloJS

The `Node` class is the foundational class used n PhyloJS. The `Tree` class wraps nested nodes. It represents a single node in a tree, with properties such as:

- `id`: Numerical ID
- `parent`: Parent node
- `children`: Array of child nodes
- `height`: Heights above the root
- `branchLength`: BRanch lengths leading into the node
- `label`: Name for the node
- `annotation`: Any node annotations
-  `hybridID`: Boolean for whether node is hybrid
-  `collapsed`: Boolean for wehther node is collapsed

Each node can have multiple children but only one parent. The `Node` class also includes several methods, which are documented in the API.