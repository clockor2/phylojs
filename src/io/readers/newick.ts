import { Tree, Node } from '../../';
import { SkipTreeException } from '../../utils/error';

/**
 * Parse a string in the New Hampshire (Newick) format and return a tree object.
 *
 * This function reads a Newick string from left to right, building the tree structure:
 * - Opening parenthesis '(' starts a new subtree
 * - Closing parenthesis ')' completes the current subtree and attaches it to its parent
 *
 * Based on the kn_parse function by Heng Li for jstreeview:
 * https://github.com/lh3/jstreeview/blob/main/knhx.js
 * Modified for compatibility with our Tree object and to prevent ';' assignment as root label.
 *
 * Note: Node IDs are allocated in order of parsing, not reflecting the tree structure.
 * To renumber nodes, use .preorderTraversal() or .postorderTraversal() methods.
 *
 * @param {string} newick - The string in Newick format to parse
 * @returns {Tree} - The constructed phylogenetic tree
 */
export function readNewick(newick: string): Tree {
  const stack: number[] = []; // Stack to track node relationships during parsing
  const nodes: Node[] = []; // Array to store all created nodes

  // Check if multiple trees are included in the string
  if (newick.includes('\n')) {
    newick = newick.slice(0, newick.indexOf('\n'));
    console.warn(
      'Multiple trees in Newick string. Only reading the first tree. Use readTreesFromNewick() to read all trees.'
    );
  }

  // Parse the string character by character
  let position = 0;
  while (position < newick.length) {
    // Skips over space and delete (non-printable) characters in ASCII
    while (
      position < newick.length &&
      (newick.charAt(position) < '!' || newick.charAt(position) > '~')
    ) {
      position++;
    }

    if (position === newick.length) break;

    const currentChar = newick.charAt(position);

    if (currentChar === ',') {
      // Comma separates nodes at the same level
      position++;
    } else if (currentChar === '(') {
      // Opening parenthesis indicates the start of child nodes
      stack.push(-1); // -1 marks new set of sister nodes
      position++;
    } else if (currentChar === ')') {
      // Closing parenthesis indicates the end of sister nodes
      const newNodeIndex = nodes.length;

      let stackIndex, childIndex;

      // Search backwards for first sibling node (most recent opening parenthesis)
      for (stackIndex = stack.length - 1; stackIndex >= 0; --stackIndex) {
        if (stack[stackIndex] < 0) break;
      }

      if (stackIndex < 0) {
        throw new Error('Unmatched closing parenthesis in Newick string');
      }

      // Number of children we need to add
      const childCount = stack.length - 1 - stackIndex;

      // Add new node, parse its label/branch length, and update position
      position = kn_add_node(newick, position + 1, nodes, newNodeIndex);

      // Connect children to the new parent node
      for (
        stackIndex = stack.length - 1, childIndex = childCount - 1;
        childIndex >= 0;
        stackIndex--, childIndex--
      ) {
        nodes[newNodeIndex].children[childIndex] = nodes[stack[stackIndex]];
        nodes[stack[stackIndex]].parent = nodes[newNodeIndex];
      }

      // Remove processed nodes from stack
      stack.length = stackIndex;
      stack.push(newNodeIndex);
    } else {
      // Add leaves. Parent established when ')' next encountered in case above^
      stack.push(nodes.length);
      position = kn_add_node(newick, position, nodes, nodes.length);
    }
  }

  if (stack.length > 1) {
    console.warn('Multiple unconnected trees found in Newick string');
  }

  // Create and return the tree with the last node as root
  return new Tree(nodes[nodes.length - 1]);
}

/**
 * Reads .newick strings, separated by ';' and returns an array of Trees.
 * @param {string} newick
 * @returns {Tree[]} Tree
 */
export function readTreesFromNewick(newick: string): Tree[] {
  const trees: Tree[] = [];
  const lines = newick.split(/;\s*\n/);

  for (let thisLine of lines) {
    thisLine = thisLine.trim();
    if (thisLine.length === 0) continue;

    try {
      trees.push(readNewick(thisLine));
    } catch (e) {
      if (e instanceof SkipTreeException) {
        console.log('Skipping Newick tree: ' + e.message);
      } else {
        throw e;
      }
    }
  }

  return trees;
}
/**
 * Parses a node from a Newick string and adds it to the nodes array.
 *
 * This function extracts node information (label, branch length, annotations) from
 * the Newick string starting at position l. It creates a new Node object, populates
 * its properties, and adds it to the nodes array.
 *
 * @param {string} str - The Newick format string being parsed
 * @param {number} position - The starting position in the string to parse from
 * @param {Node[]} nodes - The array where all created nodes are stored
 * @param {number} newNodeIndex - The index to assign to the new node
 * @returns {number} - The position in the string where parsing for this node ended
 */
function kn_add_node(
  str: string,
  position: number,
  nodes: Node[],
  newNodeIndex: number
) {
  const beg = position;
  let end = 0,
    i: number,
    j: number;

  const z = new Node(newNodeIndex);
  let label: string; // Node label
  for (
    i = position;
    i < str.length && str.charAt(i) != ',' && str.charAt(i) != ')';
    ++i
  ) {
    const c = str.charAt(i);
    if (c == '[') {
      const meta_beg = i;
      if (end == 0) end = i;
      do ++i;
      while (i < str.length && str.charAt(i) != ']');
      if (i == str.length) {
        //tree.error |= 4; // <-- TODO: add unfinished annotation error
        break;
      }
      z.annotation = parseNewickAnnotations(str.slice(meta_beg + 1, i));
    } else if (c == ':') {
      // Parse branch length
      if (end == 0) end = i;
      for (j = ++i; i < str.length; ++i) {
        const cc = str.charAt(i);
        if (
          (cc < '0' || cc > '9') &&
          cc != 'e' &&
          cc != 'E' &&
          cc != '+' &&
          cc != '-' &&
          cc != '.'
        )
          break;
      }
      z.branchLength = parseFloat(str.slice(j, i));
      --i;
    } else if (c < '!' && c > '~' && end == 0) end = i;
  }
  if (end == 0) end = i;
  if (end > beg) {
    label = str
      .slice(beg, end)
      .replace(/;$/g, '')
      .replace(/^"|"$/g, '') // remove quotes
      .replace(/^'|'$/g, ''); // remove quotes

    if (label.includes('#')) {
      // Hybrid case
      const parsedLabel = parseHybridLabels(label);
      z.label = parsedLabel['label'];
      z.hybridID = parsedLabel['hybridID'];
    } else {
      label.length > 0 ? (z.label = label) : (z.label = undefined);
    }
  }

  nodes.push(z);
  return i;
}

interface HybridInformation {
  label: string | undefined;
  hybridID: number;
}

/**
 * Function parses hybrid id labels, which are assumed to contain '#'.
 * Following Cardona et al. 2008, (https://doi.org/10.1186/1471-2105-9-532).
 * Function expects unparsed labels to be of the form [label]#[type]i[:branch-length]
 * where '#' and i (the hybrid node ID) are mandatory. PhyloJS ignores the type annotation
 * (H for hybridisation, LGT for lateral gene transfer, R for recombination) and extracts only
 * the label and hybridID, following icyTREE.
 * @param {string} label
 * @returns {HybridInformation}
 */
export function parseHybridLabels(label: string): HybridInformation {
  if (!label.includes('#')) throw 'No hash(#), in hybrid label.';

  const splitLabel = label.split('#');
  const parsedLabel = splitLabel[0].length > 0 ? splitLabel[0] : undefined;
  const hybridID = Number(splitLabel[1].replace(/H|LGT|R/g, '')); // remove hybridisation types

  if (!Number.isInteger(hybridID)) throw 'Hybrid ID is not an integer!';

  const info: HybridInformation = {
    label: parsedLabel,
    hybridID: hybridID,
  };

  return info;
}

/**
 * Parses newick annotations to object for storage
 * in `Node` object. Parses annotations in BEAST-type format [&...]
 * and in NHX type [&&NHX:..], such as from RevBayes. Annotations in
 * arrays are expected to be stored in braces, and separaged by ',' or ':'.
 * For example ...Type={Blue,Res} or ...Type={Blue:Red}
 * @param {string} annotations
 * @returns {any}
 */
export function parseNewickAnnotations(
  annotations: string
): typeof Node.prototype.annotation {
  // Remove the '&' at the start or '&&NHX' in the case of NHX
  if (annotations.startsWith('&&NHX:')) {
    annotations = annotations.slice(6);
  } else if (annotations.startsWith('&')) {
    annotations = annotations.slice(1);
  }

  const annotation_object: typeof Node.prototype.annotation = {};

  const pairs = annotations.split(/[,:](?![^{]*\})/g); // Split on all ',' and ':' not in braces '{}'

  pairs.forEach(pair => {
    const keyValue: string[] = pair.split('=');
    const key: string = keyValue[0];
    const value: string = keyValue[1];

    // Handling array-like values enclosed in {}
    if (value.includes('{') && value.includes('}')) {
      annotation_object[key] = value.replace(/{|}/g, '').split(/,|:/g);
    } else {
      annotation_object[key] = value;
    }
  });

  return annotation_object;
}
