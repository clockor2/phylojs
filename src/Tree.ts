// Tree constructor
import { Node } from './Node';

export class Tree {
  root: Node;
  nodeList: Node[] | undefined;
  nodeIDMap: { [key: string]: Node } | undefined;
  leafList: Node[] | undefined;
  recombEdgeMap: { [key: string]: Node[] } | undefined;
  isTimeTree = false;

  constructor(root: Node) {
    this.root = root;
    this.computeNodeAges();
  }

  // Tree methods

  // Compute node ages
  computeNodeAges(): void {
    const heights: number[] = this.root.applyPreOrder((node: Node) => {
      if (node.parent === undefined) node.height = 0.0;
      // root case
      else {
        if (node.branchLength !== undefined && node.parent.height !== undefined)
          node.height = node.parent.height - node.branchLength;
        else {
          node.height = NaN;
        }
      }

      return node.height;
    });
    const youngestHeight: number = Math.min(...heights);

    this.isTimeTree =
      !Number.isNaN(youngestHeight) &&
      (heights.length > 1 || this.root.branchLength !== undefined);

    for (let i = 0; i < this.getNodeList().length; i++) {
      const node = this.getNodeList()[i];
      if (node.height !== undefined) {
        node.height -= youngestHeight;
      }
    }
  }

  // Return branch lengths in order matching .getNodeList()
  getBranchLengths(): (number | undefined)[] {
    return this.getNodeList().map(e => e.branchLength);
  }

  // root to tip distances. Count undefined branch lengths as zero
  getRTTDist(): (number | undefined)[] {
    this.root.applyPreOrder((node: Node) => {
      if (node.parent == undefined) {
        node.rttDist = 0.0; // root case
      } else if (node.parent.rttDist !== undefined) {
        if (node.branchLength !== undefined) {
          node.rttDist = node.branchLength + node.parent.rttDist;
        } else {
          node.rttDist = node.parent.rttDist;
        }
      }
      return node.rttDist;
    });

    return this.getLeafList().map(e => e.rttDist);
  }

  // Assign new node IDs (use with care!)
  reassignNodeIDs(): void {
    let nodeID = 0;
    for (let i = 0; i < this.getNodeList().length; i++)
      this.getNodeList()[i].id = nodeID++;
  }

  // Clear various node caches:
  clearCaches(): void {
    this.nodeList = undefined;
    this.nodeIDMap = undefined;
    this.leafList = undefined;
    this.recombEdgeMap = undefined;
  }

  // Retrieve list of nodes in tree.
  // (Should maybe use accessor function for this.)
  getNodeList(): Node[] {
    if (this.nodeList === undefined && this.root !== undefined) {
      this.nodeList = this.root.applyPreOrder((node: Node) => {
        return node;
      });
    }
    if (!this.nodeList) {
      return [];
    }
    return this.nodeList;
  }

  // Obtain node having given string representation:
  getNode(nodeID: string): Node | null {
    if (this.nodeIDMap === undefined && this.root !== undefined) {
      this.nodeIDMap = {};
      for (let i = 0; i < this.getNodeList().length; i++) {
        const node: Node = this.getNodeList()[i];
        this.nodeIDMap[node.id] = node;
      }
    }
    return this.nodeIDMap == undefined ? null : this.nodeIDMap[nodeID];
  }

  // Retrieve list of leaves in tree, in correct order.
  getLeafList(): Node[] {
    if (this.leafList === undefined && this.root !== undefined) {
      this.leafList = this.root.applyPreOrder((node: Node) => {
        if (node.isLeaf()) return node;
        else return null;
      });
    }
    return this.leafList == undefined ? [] : this.leafList;
  }

  // Retrieve map from recomb edge IDs to src/dest node pairs
  getRecombEdgeMap(): { [key: string]: Node[] } {
    if (this.recombEdgeMap === undefined) {
      let node: Node;
      let i: number;
      let hybridNodeList: Node[];
      if (this.root !== undefined) {
        hybridNodeList = this.root.applyPreOrder((node: Node) => {
          if (node.isHybrid()) return node;
          else return null;
        });
      } else {
        hybridNodeList = [];
      }

      const srcHybridIDMap: { [key: string]: Node } = {};
      const destHybridIDMap: { [key: string]: Node[] } = {};
      for (i = 0; i < hybridNodeList.length; i++) {
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

  // return subtree of tree
  getSubtree(node: Node): Tree {
    return new Tree(node);
  }

  // get all tip names from tree or from node
  getTipLabels(node?: Node): (string | undefined)[] {
    let tips: (string | undefined)[];
    if (node !== undefined) {
      tips = this.getSubtree(node)
        .getLeafList()
        .map(e => e.id.toString());
    } else {
      tips = this.getLeafList().map(e => e.label);
    }

    return tips;
  }

  // Sum of all defined branch lengths
  getLength(): number {
    let totalLength = 0.0;
    const nodeList = this.getNodeList();

    for (const node of nodeList) {
      if (node.branchLength !== undefined) {
        totalLength += node.branchLength;
      }
    }

    return totalLength;
  }

  // Re-root tree:
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
    this.computeNodeAges();

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

  // Collapse zero-length edges:
  collapseZeroLengthEdges(): void {
    this.root.applyPreOrder(function (node: Node) {
      const childrenToConsider = node.children.slice();
      while (childrenToConsider.length > 0) {
        const child = childrenToConsider.pop();
        if (child === undefined) continue;
        if (child.height == node.height) {
          node.removeChild(child);

          // Does this do the right thing for polytomy dummy nodes?
          node.annotation = child.annotation;
          node.label = child.label;

          for (let j = 0; j < child.children.length; j++) {
            const grandChild = child.children[j];
            node.addChild(grandChild);
            childrenToConsider.push(grandChild);
          }
        }
      }
    });

    // Invalidate cached leaf and node lists
    this.clearCaches();
  }

  // Sort nodes according to clade sizes.
  sortNodes(decending: boolean): void {
    if (this.root === undefined) return;

    function sortNodesRecurse(node: Node): number {
      let size = 1;
      const childSizes: { [key: number]: number } = {};
      for (let i = 0; i < node.children.length; i++) {
        const thisChildSize: number = sortNodesRecurse(node.children[i]);
        size += thisChildSize;
        childSizes[node.children[i].id] = thisChildSize;
      }

      node.children.sort((a: Node, b: Node) => {
        if (decending) return childSizes[b.id] - childSizes[a.id];
        else return childSizes[a.id] - childSizes[b.id];
      });

      return size;
    }

    sortNodesRecurse(this.root);

    // Clear out-of-date leaf list
    this.leafList = undefined;
  }

  // Shuffle nodes
  shuffleNodes(): void {
    if (this.root === undefined) return;

    function shuffleArray(array: any[]): void {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    function shuffleNodesRecurse(node: Node): void {
      for (let i = 0; i < node.children.length; i++)
        shuffleNodesRecurse(node.children[i]);

      shuffleArray(node.children);
    }

    shuffleNodesRecurse(this.root);
  }
  isRecombSrcNode(node: Node): boolean {
    if (node.hybridID !== undefined)
      return (
        node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] == node
      );
    return false;
  }

  isRecombDestNode(node: Node): boolean {
    if (node.hybridID !== undefined)
      return (
        node.isHybrid() && this.getRecombEdgeMap()[node.hybridID][0] != node
      );
    return false;
  }

  isNetwork(): boolean {
    return Object.keys(this.getRecombEdgeMap()).length > 0;
  }

  // Minimize distance between hybrid pairs
  minimizeHybridSeparation(): void {
    const recombEdgeMap = this.getRecombEdgeMap();

    for (const recombID in recombEdgeMap) {
      const srcNode = recombEdgeMap[recombID][0];

      for (let i = 1; i < recombEdgeMap[recombID].length; i++) {
        const destNode = recombEdgeMap[recombID][i];
        const destNodeP = destNode.parent;
        if (destNodeP === undefined) continue;
        destNodeP.removeChild(destNode);
        if (srcNode.isLeftOf(destNodeP)) {
          destNodeP.children.splice(0, 0, destNode);
        } else {
          destNodeP.children.push(destNode);
        }
      }
    }
  }

  getTraitList(filter?: (node: any, trait: any) => boolean): any[] {
    if (this.root === undefined) return [];

    const traitSet: { [key: string]: boolean } = {};
    const nodeList = this.getNodeList();

    for (const thisNode of nodeList) {
      for (const trait in thisNode.annotation) {
        if (filter !== undefined && !filter(thisNode, trait)) continue;
        traitSet[trait] = true;
      }
    }

    // Create list from set
    const traitList = Object.keys(traitSet);

    return traitList;
  }

  // Return deep copy of tree:
  copy(): Tree {
    return new Tree(this.root.copy());
  }

  translate(tmap: { [key: string]: string }): void {
    const nodeList = this.getNodeList();
    for (const node of nodeList) {
      const { label } = node;
      if (label && Object.prototype.hasOwnProperty.call(tmap, label)) {
        node.label = tmap[label];
      }
    }
  }

  // Return list of nodes belonging to monophyletic groups involving
  // the provided node list
  getCladeNodes(nodes: Node[]): Node[] {
    function getCladeMembers(node: Node, nodes: Node[]): Node[] {
      let cladeMembers: Node[] = [];

      let allChildrenAreMembers = true;
      for (let cidx = 0; cidx < node.children.length; cidx++) {
        const child = node.children[cidx];

        const childCladeMembers = getCladeMembers(child, nodes);
        if (childCladeMembers.indexOf(child) < 0) allChildrenAreMembers = false;

        cladeMembers = cladeMembers.concat(childCladeMembers);
      }

      if (
        nodes.indexOf(node) >= 0 ||
        (node.children.length > 0 && allChildrenAreMembers)
      )
        cladeMembers = cladeMembers.concat(node);

      return cladeMembers;
    }

    return getCladeMembers(this.root, nodes);
  }

  // Return list of all nodes ancestral to those in the provided node list
  getAncestralNodes(nodes: Node[]): Node[] {
    function getAncestors(node: Node, nodes: Node[]): Node[] {
      let ancestors: Node[] = [];

      for (let cidx = 0; cidx < node.children.length; cidx++) {
        const child = node.children[cidx];

        ancestors = ancestors.concat(getAncestors(child, nodes));
      }

      if (nodes.indexOf(node) >= 0 || ancestors.length > 0)
        ancestors = ancestors.concat(node);

      return ancestors;
    }

    return getAncestors(this.root, nodes);
  }

  getLineagesThroughTime(): any {
    const nodeList = this.getNodeList().slice(0);

    nodeList.sort(function (nodeA, nodeB) {
      if (nodeA.height === undefined || nodeB.height === undefined)
        throw 'height === undefined';
      return nodeA.height - nodeB.height;
    });

    interface Res {
      lineages: number[];
      ages: number[];
    }

    const res: Res = { lineages: [], ages: [] };

    let k = 0;
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];

      k += 1 - node.children.length;

      res.lineages.push(k);
      if (node.height !== undefined) {
        res.ages.push(node.height);
      }
    }

    return res;
  }
}
