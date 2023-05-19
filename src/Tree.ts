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
  getRTTDist(): number[] {
    const rttDist: number[] = this.root.applyPreOrder((node: Node) => {
      if (node.parent == undefined) {
        node.rttDist = 0.0; // root case
      } else if (node.parent.rttDist !== undefined) {
        if (node.branchLength !== undefined) {
          node.rttDist = node.branchLength + node.parent.rttDist;
        } else {
          node.rttDist = node.parent.rttDist;
        }
      }
      if (node.isLeaf()) return node.rttDist;
      else return null;
    });

    return rttDist;
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
  getTipLabels(node?: Node): string[] {
    let tips: string[];
    if (node !== undefined) {
      tips = this.getSubtree(node)
        .getLeafList()
        .map(e => e.label ?? e.id.toString());
    } else {
      tips = this.getLeafList().map(e => e.label ?? e.id.toString());
    }
    return tips;
  }

  // Sum of all defined branch lengths
  getTotalBranchLength(): number {
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
}
