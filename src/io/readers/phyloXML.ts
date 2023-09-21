import { Tree, Node } from '@phylojs';
import { SkipTreeException } from '@phylojs/utils/error';

function parse(phyloxml: string): HTMLCollectionOf<Element> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(phyloxml, 'application/xml');
  return doc.getElementsByTagName('phylogeny');
}

export function readPhyloXML(phyloxml: string): Tree {
  const phylogenyElements = parse(phyloxml);

  if (phylogenyElements.length === 0) {
    throw new Error('No phylogeny element found in phyloXML.');
  }
  const phylogenyElement = phylogenyElements[0];
  const phyloXML = new PhyloXML(phylogenyElement);
  if (!phyloXML.root) {
    throw new Error('Failed to parse the phyloXML data correctly.');
  }
  return new Tree(phyloXML.root);
}

export function readTreesFromPhyloXML(phyloxml: string): Tree[] {
  const trees: Tree[] = [];
  const phylogenyElements = parse(phyloxml);

  for (let i = 0; i < phylogenyElements.length; i++) {
    const phylogenyElement = phylogenyElements[i];
    try {
      const phyloXML = new PhyloXML(phylogenyElement);
      trees.push(new Tree(phyloXML.root));
    } catch (SkipTreeException) {
      console.log(`Skipping phyloXML tree ${i}: Unrooted tree.`);
    }
  }

  return trees;
}

// TreeFromPhyloXML constructor
export class PhyloXML {
  private thisNodeID = 0;
  public root: Node;

  constructor(phylogenyElement: Element) {
    this.root = this.walkDom(undefined, phylogenyElement);
    // Zero root edge length means undefined
    if (this.root.branchLength === 0.0) this.root.branchLength = undefined;
  }

  private annotateNode(node: Node, prefix: string, elements: HTMLCollection) {
    for (let j = 0; j < elements.length; j++) {
      const tname = elements[j].tagName;
      const tval = elements[j].textContent;
      node.annotation[prefix + '_' + tname] = tval;
    }
  }

  private walkDom(parent: Node | undefined, cladeElement: Element): Node {
    const node = new Node(this.thisNodeID++);
    if (parent !== undefined) parent.addChild(node);

    for (let i = 0; i < cladeElement.children.length; i++) {
      const childEl = cladeElement.children[i];
      const tagName = childEl.tagName;
      switch (tagName) {
        case 'clade':
          this.walkDom(node, childEl);
          break;
        case 'name':
          if (childEl.textContent) {
            node.label = childEl.textContent;
          }
          break;
        case 'taxonomy':
          this.annotateNode(node, 'taxonomy', childEl.children);
          break;
        case 'sequence':
          this.annotateNode(node, 'sequence', childEl.children);
          break;
        case 'confidence':
          node.annotation[`confidence_${childEl.getAttribute('type') || ''}`] =
            childEl.textContent;
          break;
        case 'branch_length':
          node.branchLength = Number(childEl.textContent);
          break;
        case 'property': {
          const refAttribute = childEl.getAttribute('ref');
          if (refAttribute) {
            // this checks both for null and empty string
            node.annotation[refAttribute] = childEl.textContent;
          }
          break;
        }
        default:
          break;
      }
    }
    const rootedAttribute = cladeElement.getAttribute('rooted');
    if (rootedAttribute && rootedAttribute.toLowerCase() === 'false')
      throw new SkipTreeException('Unrooted tree.');

    if (cladeElement.hasAttribute('branch_length'))
      node.branchLength = Number(cladeElement.getAttribute('branch_length'));

    return node;
  }
}
