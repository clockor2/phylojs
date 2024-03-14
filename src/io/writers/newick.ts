import { Node, Tree } from '../../';

/**
 * Writes tree in .newick format. Undefined branch lengths set to 0.
 * @param {tree} tree The tree to write
 * @param {annotationWriter} string Function parsing node annotations to string. Defaults to empty string - no annotation case. Can be user Defined or use in-build beastAnnotations or nhxAnnotations
 * @returns {string}
 */

export function writeNewick(
  tree: Tree,
  annotationWriter: (annotation: typeof Node.prototype.annotation) => string = annotation => ''
): string {

  let newickStr = '';

  if (tree.root !== undefined)
    newickStr += newickRecurse(tree.root, annotationWriter) + ';';

  return newickStr;
}

/**
 * Recurses through tree, writing building up nwk string as it foes
 * @param {node} Node
 * @param {annotationWriter} string Function parsing Node.annotation to string. Defaults to empty string, not writing annotations. Can be user Defined or use in-build beastAnnotations or nhxAnnotations
 * @returns {string}
 */
export function newickRecurse(
  node: Node,
  annotationWriter: (annotation: typeof Node.prototype.annotation) => string = annotation => ''
  ): string {

  let res = '';

  if (!node.isLeaf()) {
    res += '(';
    for (let i = 0; i < node.children.length; i++) {
      if (i > 0) res += ',';
      res += newickRecurse(node.children[i], annotationWriter);
    }
    res += ')';
  }

  // TODO: Add hybrid type to node labels - H, LGT, or R
  if (node.label !== undefined && node.hybridID == undefined) {
    res += `"${node.label}"`;
  } else if (node.label !== undefined && node.hybridID !== undefined) {
    res += `"${node.label}"#${node.hybridID}`;
  } else if (node.label == undefined && node.hybridID !== undefined) {
    res += `#${node.hybridID}`;
  }
  
  res += annotationWriter(node.annotation)

  if (node.branchLength !== undefined) {
    node.branchLength == 0 ? (res += ':0.0') : (res += `:${node.branchLength}`);
  }

  return res;
}

/**
 * Writes node annotations to a string in the syle of BEAST.
 * Eg: [&Type=A,Cols={Red,Blue}]
 * @param {annotation} typeof Node.prototype.annotation
 * @returns {string}
 */
export function beastAnnotation(
  annotation: typeof Node.prototype.annotation
  ): string {

    let res = '';

    if (annotation !== undefined) {

      const keys = Object.keys(annotation);

      if (keys.length > 0) {
        res += '[&';

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
  
          if (i > 0) res += ',';
          res += `${key}=`;
          const value = annotation[key];

          if (Array.isArray(value)) {
            res += `{${String(value.join(','))}}`; // Convert the array to a comma-separated string
          } else {
            res += `${String(value)}`; // Explicitly convert the value to a string
          }
        }

        res += ']'
      }
    }

    return res;

}

/**
 * Writes node annotations to a string in the syle of NHX.
 * Eg: [&&NHX:Type=A:Col=Red]. NHX does not appear to support
 * array date for annotations. Please get in touch if it does!
 * @param {annotation} typeof Node.prototype.annotation
 * @returns {string}
 */
export function nhxAnnotation(
  annotation: typeof Node.prototype.annotation
  ): string {

    let res = '';

    if (annotation !== undefined) {
      const keys = Object.keys(annotation);

      if (keys.length > 0) {
        res += '[&&NHX:';

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
  
          if (i > 0) res += ':';
          res += `${key}=`;

          const value = annotation[key];
          res += `${String(value)}`; // Explicitly convert the value to a string
        }

        res += ']'
      }
    }

    return res;

}