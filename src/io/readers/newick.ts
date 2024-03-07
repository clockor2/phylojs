import { Tree, Node } from '../../';
import { SkipTreeException } from '../../utils/error';

/* 
	Parse a string in the New Hampshire format and return a pointer to the tree. 

	Is a slight modification of code written by Heng Li for jstreeview: at
	https://github.com/lh3/jstreeview/blob/main/knhx.js

	Modifications are for compatability with our tree object, and to avoid assigning
	';' as the root label.

	Function works by reding a .nwk string left to right. Where an open bracket is encountered,
	we venture deeper into the tree which is reflected in pushing -1 to the stack array.
*/

/**
 * Description
 * @param {string} str
 * @returns {Tree}
 */
export function readNewick(str: string) { // formerly kn_parse

	var stack: number[] = [];
	var nodes: Node[] = [];

	for (var l = 0; l < str.length;) {
		while (l < str.length && (str.charAt(l) < '!' || str.charAt(l) > '~')) ++l;
		if (l == str.length) break;
		var c = str.charAt(l);
		if (c == ',') ++l;
		else if (c == '(') {
			stack.push(-1); ++l;
		} else if (c == ')') {
			var x, m, i;
			x = nodes.length;
			for (i = stack.length - 1; i >= 0; --i) {
				if (stack[i] < 0) break;
			}
			if (i < 0) {
				//tree.error |= 1; break;
				break; // TODO: Add error
			}
			m = stack.length - 1 - i;
			l = kn_add_node(str, l + 1, nodes, m);
			for (i = stack.length - 1, m = m - 1; m >= 0; --m, --i) {
				nodes[x].children[m] = nodes[stack[i]];
				nodes[stack[i]].parent = nodes[x];
			}
			stack.length = i;
			stack.push(x);
		} else {
			stack.push(nodes.length);
			l = kn_add_node(str, l, nodes, 0); // leaps l to index after non ',' or '{' or ')'
		}
	}
	//if (stack.length > 1) tree.error |= 2; // TODO: Add error message
	var tree = new Tree(nodes[nodes.length - 1]);
	return tree;
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
 * Function constructs nodes. Returns index of furthest character read in nwk string.
 * Also originates from Heng Li's jstreeview.
 */
/**
 * Description
 * @param {string} str
 * @param {number} l
 * @param {Tree} tree
 * @param {number} x
 * @returns {number}
 */
function kn_add_node(str: string, l: number, nodes: Node[], x: number) {
	var r, beg: number, end: number = 0, z: Node;
	var z = new Node(x); // TODO: Unsure if x is righ index
	for (var i = l, beg = l; i < str.length && str.charAt(i) != ',' && str.charAt(i) != ')'; ++i) {
		var c = str.charAt(i);
		if (c == '[') { // TODO: Annotations
			var meta_beg = i;
			if (end == 0) end = i;
			do ++i; while (i < str.length && str.charAt(i) != ']');
			if (i == str.length) {
				//tree.error |= 4; // <-- TODO: add unfinished annotation error
				break;
			}
			//z.annotation = {["all_annotations"]: str.slice(meta_beg, i - meta_beg + 1)};
			z.annotation = parseAnnotations(str.slice(meta_beg + 1, i))
		} else if (c == ':') { // Parse branch length
			if (end == 0) end = i;
			for (var j = ++i; i < str.length; ++i) {
				var cc = str.charAt(i);
				if ((cc < '0' || cc > '9') && cc != 'e' && cc != 'E' && cc != '+' && cc != '-' && cc != '.')
					break;
			}
			//z.branchLength = parseFloat(str.slice(j, i - j));
			z.branchLength = parseFloat(str.slice(j, i));
			--i;
		} else if (c < '!' && c > '~' && end == 0) end = i;
	}
	if (end == 0) end = i;
	//if (end > beg) z.label = str.slice(beg, end - beg);
	if (end > beg) z.label = str.slice(beg, end)
		.replace(/;$/g, "")
		.replace(/^"|"$/g, "")
		.replace(/^'|'$/g, "") // remove quotes
	if (z.label?.length === 0) z.label = undefined;
	nodes.push(z);
	return i;
}

/**
 * Description
 * @param {string} metadata
 * @returns {any}
 */
function parseAnnotations(metadata: string) {
	//if (metadata.charAt(0) != '&') // Throw error
	var annotations = metadata.split(/,(?![^{]*\})/g)
		.map(e => e.split('='))
		// .map(e => {
		// 	e[1].replace(/{|}/g, '')
		// 		.split(',')
		// })
	
	let annotation_object: any = {};
	
	for (let i = 0; i < annotations.length; i += 1){
		annotation_object[annotations[i][0]] = annotations[i][1]
	}

	return annotation_object;
	//return { [key: string]: string | string[] | null }
}