import { Tree, Node } from '../../';

interface phyNode {
  branch_length: number | undefined;
  children: phyNode[] | undefined;
  taxon: string | undefined;
}

interface PhyJSON {
  trees: {
    root: phyNode;
  }[];
  taxa: {
    id: string | number;
    name: string | undefined;
    characters: any | undefined;
  }[];
  format: string;
  version: string;
}

function preprocessTaxa(taxa: PhyJSON['taxa']): Record<string, string> {
  const taxaMap: Record<string, string> = {};
  for (const taxon of taxa) {
    if (taxon.id && taxon.name) {
      taxaMap[taxon.id] = taxon.name;
    }
  }
  return taxaMap;
}

function buildTree(
  node: phyNode,
  taxaMap: Record<string, string>,
  currentId: number
): Node {
  const tree = new Node(currentId);
  tree.label = node.taxon ? taxaMap[node.taxon] || undefined : undefined; // Use taxaMap for label lookup
  tree.branchLength = node.branch_length;

  // Recursively handle children, if any
  if (node.children) {
    node.children.forEach((child, index) => {
      const childNode = buildTree(child, taxaMap, currentId + 1 + index); // Increment ID for each child uniquely
      tree.addChild(childNode);
    });
  }

  return tree; // Return the current tree node and the next available ID
}

function parse(phyNode: phyNode, taxaMap: Record<string, string>): Tree {
  const rootNode = buildTree(phyNode, taxaMap, 0);
  const tree = new Tree(rootNode);
  return tree;
}

export function readPhyJSON(phyJSONString: string): Tree {
  const obj: PhyJSON = JSON.parse(phyJSONString);
  const taxaMap = preprocessTaxa(obj.taxa);
  const phyRoot = obj.trees[0].root;
  return parse(phyRoot, taxaMap);
}

export function readTreesFromPhyJSON(phyJSONString: string): Tree[] {
  const obj: PhyJSON = JSON.parse(phyJSONString);
  const taxaMap = preprocessTaxa(obj.taxa);
  const trees = [];
  for (const treeObj of obj.trees) {
    const tree = parse(treeObj.root, taxaMap);
    trees.push(tree);
  }
  return trees;
}
