// Tree constructor
import { Node } from './node';

export class Tree {
  /** Public property used to construct tree */
  root: Node;
  /** A public property */
  private _nodeList: Node[] | undefined;
  /** A public property */
  nodeIDMap: { [key: number]: Node } | undefined;
  /** A public property */
  labelNodeMap: { [key: string]: Node } | undefined;
  /** A public property */
  private _leafList: Node[] | undefined;
  /** A public property */
  recombEdgeMap: { [key: string]: Node[] } | undefined;
  /** A public property*/
  ultrametric: boolean | undefined;

  /**
   * The constructor of the `Tree` class.
   *
   * @param {Node} root Root node
   */
  constructor(root: Node) {
    this.root = root;
  }

  // Tree methods

  /**
   * Computes height of each node above the root. Automatically done if rerooting.
   * NaN if any undefined branch lengths ancestral to a particular node. Contrasts
   * `Tree.getRTTD()` in not converting undefined branch lengths to 0.0.
   */
  computeNodeHeights(): void {
    this.root.applyPreOrder((node: Node) => {
      if (node.parent === undefined) node.height = 0.0;
      // root case
      else {
        if (node.branchLength !== undefined && node.parent.height !== undefined)
          node.height = node.parent.height + node.branchLength;
      }

      return node.height;
    });
  }

  /**
   * Reflects whether all tips are the same age (0), equivalently if they are
   * all the same height about the root. Only makes sense for time trees.
   * Sets property on tree object and returns boolean. The tolerance for differences
   * in tip heights is 1e-6 as a default, but can be adjusted.
   * @param {number} tol
   * @returns {boolean}
   */
  isUltrametric(tol = 1e-6): boolean {
    this.computeNodeHeights();
    const tipHeights = this.leafList.map(e => e.height);
    let definedHeights: number[];

    if (tipHeights.some(e => e == undefined)) {
      this.ultrametric = false;
      return false;
    } else {
      definedHeights = tipHeights as number[];
      if (definedHeights.every((e, i, a) => Math.abs(e - a[0]) < tol)) {
        this.ultrametric = true;
        return true;
      } else {
        this.ultrametric = false;
        return false;
      }
    }
  }

  /**
   * Ladderises the tree.
   * Applies a pre-order search. For each node, child nodes are ordered by increasing number of descending tips
   */
  ladderise(): void {
    this.root.applyPreOrder((node: Node) => {
      node.children.sort((a, b) => {
        const lenA = this.getSubtree(a).getTipLabels().length;
        const lenB = this.getSubtree(b).getTipLabels().length;
        if (lenA < lenB) {
          return -1;
        } else if (lenA > lenB) {
          return 1;
        } else {
          return 0;
        }
      });
    });
  }

  /** Return branch lengths in order matching .nodeList */
  getBranchLengths(): (number | undefined)[] {
    return this.nodeList.map(e => e.branchLength);
  }

  /** Returns root to tip distances. Counts undefined branch lengths as zero */
  getRTTDist(): number[] {
    const rttDist: (number | undefined)[] = this.root.applyPreOrder(
      (node: Node) => {
        if (node.parent === undefined) {
          node.rttDist = 0.0; // root case
        } else if (
          node.branchLength !== undefined &&
          node.parent.rttDist !== undefined
        ) {
          node.rttDist = node.branchLength + node.parent.rttDist;
        } else {
          node.rttDist = node.parent.rttDist;
        }
        if (node.isLeaf()) return node.rttDist;
        return undefined;
      }
    );
    // TODO: have to loop over array to remove undefined values
    // do it in the applyPreOrder function
    return rttDist.filter(e => e !== undefined) as number[];
  }

  /** Assign new node IDs (use with care!) */
  reassignNodeIDs(): void {
    let nodeID = 0;
    for (let i = 0; i < this.nodeList.length; i++)
      this.nodeList[i].id = nodeID++;
  }

  /** Clear various node caches */
  clearCaches(): void {
    this._nodeList = undefined;
    this.nodeIDMap = undefined;
    this.labelNodeMap = undefined;
    this._leafList = undefined;
    this.recombEdgeMap = undefined;
    this.ultrametric = undefined;
  }

  /** A getter that returns an array of nodes (`Node[]`) from private `_nodeList` property in order determined by a pre-order search*/
  get nodeList(): Node[] {
    if (this._nodeList === undefined && this.root !== undefined) {
      this._nodeList = this.root.applyPreOrder((node: Node) => {
        return node;
      });
    }
    if (!this._nodeList) {
      return [];
    }
    return this._nodeList;
  }

  /**
   * Get node given its numerical `id`
   * @param {number} nodeID Numerical id of node
   */
  getNode(nodeID: number): Node | null {
    if (this.nodeIDMap === undefined && this.root !== undefined) {
      this.nodeIDMap = {};
      for (let i = 0; i < this.nodeList.length; i++) {
        const node: Node = this.nodeList[i];
        this.nodeIDMap[node.id] = node;
      }
    }
    return this.nodeIDMap == undefined ? null : this.nodeIDMap[nodeID];
  }

  /** A getter that returns an array of nodes (`Node[]`) from private `_nodeList` property in order determined by a pre-order search*/
  get leafList(): Node[] {
    if (this._leafList === undefined && this.root !== undefined) {
      this._leafList = this.nodeList.filter(e => e.isLeaf());
    }
    return this._leafList == undefined ? [] : this._leafList;
  }

  /**
   * Retrieve node having given label
   * @param {string} label Node's label
   */
  getNodeByLabel(label: string): Node | null {
    if (this.labelNodeMap === undefined && this.root !== undefined) {
      this.labelNodeMap = {};
      for (let i = 0; i < this.leafList.length; i++) {
        const node: Node = this.leafList[i];
        if (node.label !== undefined) {
          this.labelNodeMap[node.label] = node; // Assume Node has 'label' property
        }
      }
    }
    return this.labelNodeMap == undefined ||
      this.labelNodeMap[label] === undefined
      ? null
      : this.labelNodeMap[label];
  }

  /** Retrieve map from recomb edge IDs to src/dest node pairs */
  getRecombEdgeMap(): { [key: string]: Node[] } {
    if (this.recombEdgeMap === undefined) {
      let node: Node;
      let i: number;
      let hybridNodeList: Node[];
      if (this.root !== undefined) {
        hybridNodeList = this.nodeList.filter(e => e.isHybrid());
      } else {
        hybridNodeList = [];
      }

      const srcHybridIDMap: { [key: string]: Node } = {};
      const destHybridIDMap: { [key: string]: Node[] } = {};
      for (i = 0; i < hybridNodeList.length; i++) {
        if (hybridNodeList[i] === null) continue;
        node = hybridNodeList[i];
        if (node.hybridID === undefined) {
          continue;
        }
        if (node.isLeaf()) {
          if (node.hybridID in destHybridIDMap)
            destHybridIDMap[node.hybridID].push(node);
          else destHybridIDMap[node.hybridID] = [node];
        } else srcHybridIDMap[node.hybridID] = node;
      }

      let hybridID: string;

      this.recombEdgeMap = {};
      for (hybridID in srcHybridIDMap) {
        if (hybridID in destHybridIDMap)
          this.recombEdgeMap[hybridID] = [srcHybridIDMap[hybridID]].concat(
            destHybridIDMap[hybridID]
          );
        else
          throw 'Extended Newick error: hybrid nodes must come in groups of 2 or more.';
      }

      // Edge case: leaf recombinations

      for (hybridID in destHybridIDMap) {
        if (!(hybridID in this.recombEdgeMap))
          this.recombEdgeMap[hybridID] = destHybridIDMap[hybridID];
      }
    }

    return this.recombEdgeMap;
  }

  /**
   * Check if node is a source node for a hybrid edge in the tree.
   * @param {Node} node
   * @returns {boolean}
   */
  isRecombSrcNode(node: Node): boolean {
    if (node.hybridID !== undefined) {
      return (
        node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] == node
      );
    } else {
      return false;
    }
  }

  /**
   * Check if node is a destination node for a hybrid edge in the tree.
   * @param {Node} node
   * @returns {boolean}
   */
  isRecombDestNode(node: Node): boolean {
    if (node.hybridID !== undefined) {
      return (
        node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] != node
      );
    } else {
      return false;
    }
  }

  /**
   * Check if the tree is a phylogenetic network.
   * @param {Node} node
   * @returns {boolean}
   */
  isNetwork(): boolean {
    return Object.keys(this.getRecombEdgeMap()).length > 0;
  }

  /**
   * Return sub-stree descending from a given `node`
   * @parm {Node} node root of desired subtree
   */
  getSubtree(node: Node): Tree {
    return new Tree(node);
  }

  /**
   * Get the most recent common ancestor of a set of nodes
   * @param {Node[]} nodes Nodes for which the MRCA is sought
   */
  getMRCA(nodes: Node[]): Node | null {
    const leafCount = nodes.length;
    if (leafCount === 0) return null;
    if (leafCount === 1) return nodes[0].parent || nodes[0];

    const visitCounts = new Map<Node, number>();
    let nodesToCheck = nodes.slice();

    while (nodesToCheck.length > 0) {
      const nextNodes: Node[] = [];

      for (const node of nodesToCheck) {
        const count = (visitCounts.get(node) || 0) + 1;
        if (count === leafCount) {
          // This is the MRCA.
          return node;
        }

        visitCounts.set(node, count);
        if (node.parent) {
          nextNodes.push(node.parent);
        }
      }

      nodesToCheck = nextNodes;
    }

    return null; // return null if no common ancestor is found
  }

  /**
   * Get all tip names from tree or descending from a `node`
   * @param {Node | undefined} node Optional node whose descending tips are returned. Defaults to root
   */
  getTipLabels(node?: Node): string[] {
    let tips: string[];
    if (node !== undefined) {
      tips = this.getSubtree(node).leafList.map(
        e => e.label ?? e.id.toString()
      );
    } else {
      tips = this.leafList.map(e => e.label ?? e.id.toString());
    }
    return tips;
  }

  /** Sum of all defined branch lengths. Elsewhere referred to tree "length" if all baranch lengths are defined */
  getTotalBranchLength(): number {
    let totalLength = 0.0;
    const nodeList = this.nodeList;

    for (const node of nodeList) {
      if (node.branchLength !== undefined) {
        totalLength += node.branchLength;
      }
    }

    return totalLength;
  }

  /**
   * Reroot a tree at a given node.
   * @param {Node} edgeBaseNode `Node` to reroot at
   * @param {number|undefined} prop Proportion of the branch descending from `edgeBaseNode` at which to cut and place the root. Defaults ot 0.5
   */
  reroot(edgeBaseNode: Node, prop?: number): void {
    this.recombEdgeMap = undefined;
    const currentRecombEdgeMap = this.getRecombEdgeMap();

    const oldRoot = this.root;
    this.root = new Node(0); // TODO figure out what the root node ID should be ? new Node()

    const edgeBaseNodeP = edgeBaseNode.parent;
    if (edgeBaseNodeP === undefined) throw 'edgeBaseNodeP === undefined';
    edgeBaseNodeP.removeChild(edgeBaseNode);
    this.root.addChild(edgeBaseNode);

    // handling proprtion to cut branch for root
    let BL = edgeBaseNode.branchLength; // TMP
    if (edgeBaseNode.branchLength !== undefined) {
      if (prop !== undefined && prop >= 0 && prop <= 1) {
        const totalBL = edgeBaseNode.branchLength;
        edgeBaseNode.branchLength *= prop;
        BL = totalBL - edgeBaseNode.branchLength;
      } else {
        edgeBaseNode.branchLength /= 2;
        BL = edgeBaseNode.branchLength;
      }
    }

    const node = edgeBaseNodeP;
    const prevNode = this.root;

    const usedHybridIDs: { [key: string]: boolean } = {};
    for (const recombID in currentRecombEdgeMap) {
      usedHybridIDs[recombID] = true;
    }

    function recurseReroot(
      node: Node | undefined,
      prevNode: Node,
      seenNodes: { [key: number]: boolean },
      BL: number | undefined
    ): void {
      if (node === undefined) return;

      if (node.id in seenNodes) {
        // Handle creation of hybrid nodes

        const newHybrid = new Node(0); // TODO figure out what the root node ID should be ? new Node()
        if (node.isHybrid()) newHybrid.hybridID = node.hybridID;
        else {
          let newHybridID = 0;
          while (newHybridID in usedHybridIDs) {
            newHybridID += 1;
          }
          node.hybridID = newHybridID;
          newHybrid.hybridID = newHybridID;
          usedHybridIDs[newHybridID] = true;
        }

        newHybrid.branchLength = BL;
        prevNode.addChild(newHybrid);

        return;
      } else {
        seenNodes[node.id] = true;
      }

      const nodeP = node.parent;

      if (nodeP !== undefined) nodeP.removeChild(node);
      prevNode.addChild(node);

      const tmpBL = node.branchLength;
      node.branchLength = BL;
      BL = tmpBL;

      recurseReroot(nodeP, node, seenNodes, BL);

      let destNodes: Node[] = [];
      let destNodePs: (Node | undefined)[] = []; // root P is undefined
      if (node.isHybrid()) {
        if (node.hybridID === undefined)
          throw 'Hybrid node does not have hybridID';
        destNodes = currentRecombEdgeMap[node.hybridID].slice(1);
        destNodePs = destNodes.map(function (destNode: Node) {
          return destNode.parent;
        });

        // Node will no longer be hybrid
        node.hybridID = undefined;

        for (let i = 0; i < destNodes.length; i++) {
          const destNodeP = destNodePs[i];
          if (destNodeP !== undefined) {
            destNodeP.removeChild(destNodes[i]);
          }

          recurseReroot(destNodeP, node, seenNodes, destNodes[i].branchLength);
        }
      }
    }

    recurseReroot(node, prevNode, {}, BL);

    // Delete singleton node left by old root

    if (oldRoot.children.length == 1 && !oldRoot.isHybrid()) {
      const child = oldRoot.children[0];
      const parent = oldRoot.parent;
      if (parent === undefined) throw 'root with single child?';
      parent.removeChild(oldRoot);
      oldRoot.removeChild(child);
      parent.addChild(child);
      if (
        child.branchLength === undefined ||
        oldRoot.branchLength === undefined
      )
        throw 'branchLength === undefined';
      child.branchLength = child.branchLength + oldRoot.branchLength;
    }

    // Clear out-of-date leaf and node lists
    this.clearCaches();

    // Recompute node ages
    this.computeNodeHeights();

    // Create new node IDs:
    this.reassignNodeIDs();

    // Ensure destNode leaf heights match those of corresponding srcNodes
    for (const recombID in this.getRecombEdgeMap()) {
      const srcNode = this.getRecombEdgeMap()[recombID][0];
      for (let i = 1; i < this.getRecombEdgeMap()[recombID].length; i++) {
        const destNode = this.getRecombEdgeMap()[recombID][i];
        if (destNode.branchLength === undefined)
          throw 'branchLength === undefined';
        if (destNode.height === undefined || srcNode.height === undefined)
          throw 'height === undefined';
        destNode.branchLength += destNode.height - srcNode.height;
      }
    }
  }

  /**
   * Returns height above the root for each internal node. Root height is assumed to be 0
   * and undefined branch lengths are assumed to be zero.
   * @returns {number[]}
   */
  getInternalNodeHeights(): number[] {
    const heights: (number | undefined)[] = this.root.applyPreOrder(
      (node: Node) => {
        if (node.parent === undefined) {
          node.height = 0.0; // root case
        } else if (
          node.branchLength !== undefined &&
          node.parent.height !== undefined
        ) {
          node.height = node.branchLength + node.parent.height;
        } else {
          node.height = node.parent.height;
        }

        if (!node.isLeaf()) return node.height;
        return undefined;
      }
    );
    // TODO: have to loop over array to remove undefined values from leaves
    // do it in the applyPreOrder function
    return heights.filter(e => e !== undefined) as number[];
  }

  /**
   * Calculates Gamma statistic from Pybus and Harvey 2000 (10.1098/rspb.2000.1278 ).
   * The Gamma statistic measures deviation from a constant rate pure-birth process
   * in the underlying population (also known as a Yule process). Values above 0 indicate
   *  longer external branches, while values corresond to internal branches. Calculating the Gamma statistic involves
   * manipulations that mean the statistic should follow a standard normal distribution,
   * such that one can perform a frequentist test to measure consistency with the pure birth
   * process.
   *
   * Since the Gamma statistic applies to a pure birth process, the tree is expected to be
   * ultrametric and the method throws an error if it is not. It also returns NaN if any node
   * node heights are undefined, due to undefined branch lengths.
   *
   * @param {number} tol Tolerance for ultrametricity passed to `.isUltrametric()`
   * @returns {number}
   *
   */
  gammaStatistic(tol = 1e-6): number {
    let g: number[]; // inter-node times (Fig 1 Pybys & Harvey 2004)
    const n: number = this.leafList.length; // Num Tips
    let A = 0;

    if (n <= 2) {
      return NaN;
    } else if (!this.isUltrametric(tol)) {
      console.warn('Gamma Statistic requires an untrametric tree!');
      return NaN;
    }

    this.computeNodeHeights();
    const nodes = this.nodeList;
    const heights = nodes.map(e => e.height).slice(1);

    if (heights.slice(1).some(e => e == undefined)) return NaN; // if any heights undefined

    if (nodes.some(node => node.isHybrid())) {
      console.warn('This is a netowrk! Gamma statistic ignoring hybrid nodes.');
    }

    g = nodes
      .slice(1)
      .filter(node => !node.isLeaf())
      .map(node => node.height)
      .filter(e => e !== undefined) as number[]; // Need to assert type here

    const maxHeight = this.leafList.map(e => e.height)[0] as number;
    g.push(maxHeight);
    g.sort((a, b) => a - b); // in place
    const minHeight = g[0];
    g = g.map((e, i, a) => e - a[i - 1]);
    g[0] = minHeight; // NaN from first diff --> frist branch time

    const T = g
      .map((e, i) => (i + 2) * e)
      .reduce((partialSum, e) => partialSum + e, 0);

    let sum: number;
    for (let i = 0; i <= g.length - 2; i++) {
      sum = 0;
      for (let k = 0; k <= i; k++) {
        sum += (k + 2) * g[k];
      }
      A += sum;
    }

    A /= n - 2;

    const gamma = (A - T / 2) / Math.sqrt(1 / (12 * (n - 2)));

    return gamma;
  }
}
