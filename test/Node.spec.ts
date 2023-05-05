import { Node } from '../src/Node';

describe('Node', () => {
  test('create node and check basic properties', () => {
    const node = new Node(1);
    expect(node.id).toBe(1);
    expect(node.parent).toBeUndefined();
    expect(node.children.length).toBe(0);
  });

  test('addChild and isLeaf', () => {
    const parentNode = new Node(1);
    const childNode = new Node(2);

    parentNode.addChild(childNode);

    expect(parentNode.children.length).toBe(1);
    expect(childNode.parent).toBe(parentNode);
    expect(parentNode.isLeaf()).toBe(false);
    expect(childNode.isLeaf()).toBe(true);
  });

  test('removeChild', () => {
    const parentNode = new Node(1);
    const childNode = new Node(2);

    parentNode.addChild(childNode);
    parentNode.removeChild(childNode);

    expect(parentNode.children.length).toBe(0);
    expect(childNode.parent).toBeUndefined();
  });

  test('isRoot', () => {
    const parentNode = new Node(1);
    const childNode = new Node(2);

    parentNode.addChild(childNode);

    expect(parentNode.isRoot()).toBe(true);
    expect(childNode.isRoot()).toBe(false);
  });

  test('isSingleton', () => {
    const parentNode = new Node(1);
    const childNode1 = new Node(2);
    const childNode2 = new Node(3);

    parentNode.addChild(childNode1);

    expect(parentNode.isSingleton()).toBe(true);
    expect(childNode1.isSingleton()).toBe(false); // childNode1 is a leaf, not a singleton

    parentNode.addChild(childNode2);

    expect(parentNode.isSingleton()).toBe(false);
    expect(childNode1.isSingleton()).toBe(false);
  });

  test('isHybrid', () => {
    const node = new Node(1);

    expect(node.isHybrid()).toBe(false);

    node.hybridID = 42;

    expect(node.isHybrid()).toBe(true);
  });

  test('getAncestors', () => {
    const node1 = new Node(1);
    const node2 = new Node(2);
    const node3 = new Node(3);

    node1.addChild(node2);
    node2.addChild(node3);

    expect(node1.getAncestors()).toEqual([node1]);
    expect(node2.getAncestors()).toEqual([node2, node1]);
    expect(node3.getAncestors()).toEqual([node3, node2, node1]);
  });

  test('copy', () => {
    const node1 = new Node(1);
    const node2 = new Node(2);
    const node3 = new Node(3);

    node1.addChild(node2);
    node2.addChild(node3);

    const copyNode1 = node1.copy();

    expect(copyNode1).not.toBe(node1);
    expect(copyNode1).toEqual(node1);
  });

  test('toString', () => {
    const node = new Node(1);
    expect(node.toString()).toBe('node#1');
  });

  test('isLeftOf', () => {
    const nodeA = new Node(1);
    const nodeB = new Node(2);
    const nodeC = new Node(3);
    const nodeD = new Node(4);

    nodeA.addChild(nodeB);
    nodeA.addChild(nodeC);
    nodeC.addChild(nodeD);

    expect(nodeB.isLeftOf(nodeD)).toBe(true);
    expect(nodeD.isLeftOf(nodeB)).toBe(false);
    expect(nodeA.isLeftOf(nodeD)).toBeUndefined();
  });

  test('applyPreOrder', () => {
    const nodeA = new Node(1);
    const nodeB = new Node(2);
    const nodeC = new Node(3);

    nodeA.addChild(nodeB);
    nodeA.addChild(nodeC);

    const nodes = nodeA.applyPreOrder(node => node);
    expect(nodes.length).toBe(3);
    expect(nodes).toContain(nodeA);
    expect(nodes).toContain(nodeB);
    expect(nodes).toContain(nodeC);
  });
});
