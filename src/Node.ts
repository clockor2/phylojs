// Node constructor
export class Node {
  id: number;
  parent: Node | undefined;
  children: Node[];
  height: number | undefined; // above root
  rttDist: number | undefined;
  branchLength: number | undefined;
  label: string | undefined;
  annotation: { [key: string]: string | string[] | null };
  hybridID: number | undefined;
  collapsed: boolean | undefined;
  cartoon: boolean | undefined;

  constructor(id: number) {
    this.id = id;

    this.parent = undefined;
    this.children = [];
    this.height = undefined;
    this.branchLength = undefined;
    this.label = undefined;
    this.annotation = {};
    this.hybridID = undefined;
  }

  // Node methods

  // Ensure nodes with unique IDs have unique hashes.
  toString(): string {
    return `node#${this.id}`;
  }

  addChild(child: Node): void {
    this.children.push(child);
    child.parent = this;
  }

  removeChild(child: Node): void {
    const idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
    child.parent = undefined; // Set parent of the removed child to undefined
  }

  isRoot(): boolean {
    return this.parent === undefined;
  }

  isLeaf(): boolean {
    return this.children.length === 0;
  }

  isSingleton(): boolean {
    return this.children.length === 1;
  }

  isHybrid(): boolean {
    return this.hybridID !== undefined;
  }

  private _getAncestors(node: Node): Node[] {
    if (node.isRoot()) {
      return [node];
    } else {
      return node.parent
        ? [node].concat(this._getAncestors(node.parent))
        : [node];
    }
  }

  getAncestors(): Node[] {
    return this._getAncestors(this); // to handel issue with concat types
  }

  // Returns true if this node is left of the argument on the
  // tree.  If one node is the direct ancestor of the other,
  // the result is undefined.
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

  // Produce a deep copy of the clade below this node
  copy(): Node {
    const nodeCopy = new Node(this.id);
    nodeCopy.height = this.height;
    nodeCopy.branchLength = this.branchLength;
    nodeCopy.label = this.label;
    for (const key in this.annotation)
      nodeCopy.annotation[key] = this.annotation[key];
    nodeCopy.id = this.id;
    nodeCopy.hybridID = this.hybridID;

    nodeCopy.collapsed = this.collapsed;
    nodeCopy.cartoon = this.cartoon;

    for (let i = 0; i < this.children.length; i++)
      nodeCopy.addChild(this.children[i].copy());

    return nodeCopy;
  }

  // Apply f() to each node in subtree
  applyPreOrder(f: (node: Node) => any): any[] {
    let res: any[] = [];

    const thisRes = f(this);
    if (thisRes !== null) res = res.concat(thisRes);

    for (let i = 0; i < this.children.length; i++) {
      res = res.concat(this.children[i].applyPreOrder(f));
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res; // will have to create a function signature type
  }
}
