import { Tree } from '../../tree';
import { Node } from '../../node';
import { SkipTreeException } from '../../utils/Error';

const neXMLNS = 'http://www.nexml.org/2009';

export function readNeXML(neXMLString: string): Tree {
  const parser = new DOMParser();
  const doc = parser.parseFromString(neXMLString, 'application/xml');
  const treeElements = doc.getElementsByTagName('tree');

  if (treeElements.length === 0) {
    throw new Error('No tree element found in NeXML.');
  }
  if (treeElements.length > 1) {
    throw new Error('Multiple tree elements found in NeXML.');
  }
  const treeElement = treeElements[0];
  const neXML = new NeXML(treeElement);

  if (!neXML.root) {
    throw new Error('Failed to parse the NeXML data correctly.');
  }
  return new Tree(neXML.root);
}

export class NeXML {
  private thisNodeID = 0;
  public root: Node | undefined;

  constructor(treeElement: Element) {
    this.processTree(treeElement);
  }

  private processTree(treeElement: Element) {
    const nodeElements = treeElement.getElementsByTagNameNS(neXMLNS, 'node');
    const edgeElements = treeElement.getElementsByTagNameNS(neXMLNS, 'edge');

    let metaElements: HTMLCollectionOf<Element>;
    let metaEl: Element;

    const nodesByID: { [key: string]: Node } = {};
    for (let nidx = 0; nidx < nodeElements.length; nidx++) {
      const nodeEl = nodeElements[nidx];
      const node: Node = new Node(this.thisNodeID++);
      node.label = nodeEl.getAttribute('label') || undefined;
      nodesByID[nodeEl.getAttribute('id') || ''] = node;

      if (nodeEl.getAttribute('root') === 'true') this.root = node;

      metaElements = nodeEl.getElementsByTagNameNS(neXMLNS, 'meta');
      for (let midx = 0; midx < metaElements.length; midx++) {
        metaEl = metaElements[midx];
        if (metaEl.hasAttribute('property') && metaEl.hasAttribute('content')) {
          node.annotation[metaEl.getAttribute('property') || ''] =
            metaEl.getAttribute('content');
        }
      }
    }

    if (!this.root) {
      throw new SkipTreeException('Unrooted tree.');
    }

    for (let eidx = 0; eidx < edgeElements.length; eidx++) {
      const edgeEl = edgeElements[eidx];
      const parent = nodesByID[edgeEl.getAttribute('source') || ''];
      const child = nodesByID[edgeEl.getAttribute('target') || ''];
      parent.addChild(child);
      if (edgeEl.hasAttribute('length')) {
        child.branchLength = parseFloat(edgeEl.getAttribute('length') || '0');
      }

      metaElements = edgeEl.getElementsByTagNameNS(neXMLNS, 'meta');
      for (let midx = 0; midx < metaElements.length; midx++) {
        metaEl = metaElements[midx];
        if (metaEl.hasAttribute('property') && metaEl.hasAttribute('content')) {
          child.annotation[metaEl.getAttribute('property') || ''] =
            metaEl.getAttribute('content');
        }
      }
    }
  }
}
