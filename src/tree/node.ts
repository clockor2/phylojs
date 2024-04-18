// Node constructor
export class Node {
  /** Node id */
  id: number;
  /** Node parent */
  parent: Node | undefined;
  /** descending nodes */
  children: Node[];
  /** Heigh above the root */
  height: number | undefined;
  /** Root to tip distance for each tip */
  rttDist: number | undefined;
  /** Length of descending branch */ //TODO: Confirm descending rather than incoming.
  branchLength: number | undefined;
  /** Node label */
  label: string | undefined;
  /** Node annotation(s) */
  annotation: { [key: string]: string | string[] | null };
  /** ID of node if hybrid */
  hybridID: number | undefined;

  /**
   * The constructor of the `Node` class.
   *
   * @param {number} id node `id` number
   */
  constructor(id: number) {
    this.id = id;

    this.parent = undefined;
    this.children = [];
    this.height = undefined;
    this.branchLength = undefined;
    this.label = undefined;
    this.annotation = {};
    this.hybridID = undefined;
    this.rttDist = undefined;
  }

  // Node methods

  /** Ensure nodes with unique IDs have unique hashes. */
  toString(): string {
    return `node#${this.id}`;
  }

  /**
   * Appends child node to `children`
   * @param {Node} child
   */
  addChild(child: Node): void {
    this.children.push(child);
    child.parent = this;
  }

  /**
   * Removes a node from `children`
   * @param {Node} child
   */
  removeChild(child: Node): void {
    const idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
    child.parent = undefined; // Set parent of the removed child to undefined
  }

  /** Checks if a node is root */
  isRoot(): boolean {
    return this.parent === undefined;
  }

  /** Check if a node is a Leaf */
  isLeaf(): boolean {
    return this.children.length === 0;
  }

  /** Checks if node only has one child */
  isSingleton(): boolean {
    return this.children.length === 1;
  }

  /** Checks if a node is a hybrid node */
  isHybrid(): boolean {
    return this.hybridID !== undefined;
  }

  /**
   * Gets ancestral nodes
   * @param {Node} node
   */
  private _getAncestors(node: Node): Node[] {
    if (node.isRoot()) {
      return [node];
    } else {
      return node.parent
        ? [node].concat(this._getAncestors(node.parent))
        : [node];
    }
  }
  /** Gets ancestral nodes. Wraps `_getAncestors` to handle concat types. */
  getAncestors(): Node[] {
    return this._getAncestors(this);
  }

  /**
   * Returns true if this node is left of the argument on the
   * tree.  If one node is the direct ancestor of the other,
   * the result is undefined.
   *
   * @param {Node} other
   *
   */
  isLeftOf(other: Node): boolean | undefined {
    const ancestors = this.getAncestors().reverse();
    const otherAncestors = other.getAncestors().reverse();

    let i;
    for (i = 1; i < Math.min(ancestors.length, otherAncestors.length); i++) {
      if (ancestors[i] != otherAncestors[i]) {
        const mrca = ancestors[i - 1];

        return (
          mrca.children.indexOf(ancestors[i]) <
          mrca.children.indexOf(otherAncestors[i])
        );
      }
    }

    return undefined;
  }

  /** Produce a deep copy of the clade below this node */
  copy(): Node {
    const nodeCopy = new Node(this.id);
    nodeCopy.height = this.height;
    nodeCopy.branchLength = this.branchLength;
    nodeCopy.label = this.label;
    for (const key in this.annotation)
      nodeCopy.annotation[key] = this.annotation[key];
    nodeCopy.id = this.id;
    nodeCopy.hybridID = this.hybridID;

    for (let i = 0; i < this.children.length; i++)
      nodeCopy.addChild(this.children[i].copy());

    return nodeCopy;
  }

  /**
   * Apply a function `f()` to each node in a subtree descending from `node` in post-order
   * @param {Node} node Node from which to apply `f()` post-order
   */
  applyPreOrder<T>(f: (node: Node) => T): T[] {
    const res: T[] = [];
    const stack: Node[] = [this]; // Initialize the stack with the root node.

    while (stack.length > 0) {
      const currentNode = stack.pop(); // Pop the last node from the stack.

      if (!currentNode) continue; // If the node is null or undefined, skip.

      const thisRes = f(currentNode);
      res.push(thisRes); // Apply f to the current node and collect the result.

      // Push children to the stack in reverse order to maintain the correct traversal order.
      for (let i = currentNode.children.length - 1; i >= 0; i--) {
        stack.push(currentNode.children[i]);
      }
    }
    return res;
  }
}
