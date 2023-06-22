import { readNewick } from '../src/Reader';
import { Node } from '../src/Node';
import { Tree } from '../src/Tree';
import { writeNewick } from '../src/Write';
import { readFileSync } from 'fs';

describe('Tree', () => {
  const rootNode = new Node(0);
  const childNode1 = new Node(1);
  childNode1.label = 'A';
  childNode1.branchLength = 1;
  const childNode2 = new Node(2);
  childNode2.branchLength = 1;
  const childNode3 = new Node(3);
  childNode3.label = 'B';
  childNode3.branchLength = 1;
  const childNode4 = new Node(4);
  childNode4.label = 'C';
  childNode4.branchLength = 1;

  childNode2.addChild(childNode3);
  childNode2.addChild(childNode4);

  rootNode.addChild(childNode1);
  rootNode.addChild(childNode2);
  const tree = new Tree(rootNode);

  test('reroot', () => {
    expect(
      tree
        .getNodeList()
        .map(n => n.label)
        .filter(n => n !== undefined)
    ).toStrictEqual(['A', 'B', 'C']);
    tree.reroot(childNode4);
    const newick = writeNewick(tree);
    expect(newick).toBe('("C":0.5,("B":1,"A":2):0.5):0.0;');
    expect(tree.root.children.length).toBe(2);
    expect(
      tree
        .getNodeList()
        .map(n => n.label)
        .filter(n => n !== undefined)
    ).toStrictEqual(['C', 'B', 'A']);
  });
});

describe('reroot() - basic', () => {
  test('updates nwk', () => {
    const tr = readNewick('((A:1,B:1):1,C:1);');
    tr.reroot(tr.getNodeList()[3]);
    const nwkPrime = writeNewick(tr);

    expect(nwkPrime).not.toBe('((A:1,B:1):1,C:1);');
  });

  const nwk = readFileSync('test/data/testTrees.nwk', 'utf-8').split(/\r?\n/);
  const tr = nwk.map(e => readNewick(e));

  test('invariant length with varying prop on test trees', () => {
    let nodes: Node[];
    let prop: number;
    const originalLength: number[] = [];
    const newLength: number[] = [];
    const diff: boolean[] = [];
    const tol = 1e-10; // smaller than smallest branch length here

    for (let i = 0; i < tr.length; i++) {
      nodes = tr[i].getNodeList().slice(1); // exclude root (0th id)
      for (let j = 0; j < nodes.length; j++) {
        originalLength.push(tr[i].getTotalBranchLength());

        prop = j / nodes.length;
        tr[i].reroot(nodes[j], prop);
        newLength.push(tr[i].getTotalBranchLength());

        diff.push(Math.abs(originalLength[j] - newLength[j]) < tol);
      }
    }
    expect(JSON.stringify(diff)).toBe(
      JSON.stringify(originalLength.map(e => true))
    );
  });
});

describe('getTotalBranchLength()', () => {
  test('all branch lengths defined', () => {
    const tr = readNewick('((A:1,B:1):1,C:1);');
    expect(tr.getTotalBranchLength()).toBe(4);
  });

  test('count undefined branch lengths as zero', () => {
    const tr = readNewick('((A:1,B:1),C:1);');
    expect(tr.getTotalBranchLength()).toBe(3);
  });
});

describe('getRTTDist()', () => {
  test('all branch lengths defined', () => {
    const tr = readNewick('((A:1,B:1):1,C:1);');
    const rttDist = tr.getRTTDist();
    expect(rttDist).toStrictEqual([2, 2, 1]);
  });

  test('when some branch lengths defined', () => {
    const tr = readNewick('((A:1,B:1),C:1);');
    const rttDist = tr.getRTTDist();
    expect(rttDist).toStrictEqual([1, 1, 1]);
  });

  test('returns values for test trees (<==> sum defined)', () => {
    const nwk = readFileSync('test/data/testTrees.nwk', 'utf-8').split(/\r?\n/);
    const tr = nwk.map(e => readNewick(e));

    const rttDistances = tr.map(e => e.getRTTDist());

    const type = rttDistances.map(e => e.map(e => typeof e));

    expect(JSON.stringify(type)).toBe(
      JSON.stringify(rttDistances.map(e => e.map(() => 'number')))
    );
  });
});

describe('getSubtree()', () => {
  test('simple tree', () => {
    const tr = readNewick('((((A,B),C),D),E);');
    const subTree = tr.getSubtree(tr.getNodeList()[1]);

    expect(writeNewick(subTree)).toBe(
      '((("A":0.0,"B":0.0):0.0,"C":0.0):0.0,"D":0.0):0.0;'
    );
  });
});

describe('getMRCA()', () => {
  test('same node', () => {
    const tr = readNewick('((((A,B),C),D),E);');
    const nodeA = tr.getLeafList()[0];
    const mrca = tr.getMRCA([nodeA, nodeA]);
    if (mrca === null) throw new Error('MRCA is null');
    const subTree = tr.getSubtree(mrca);
    expect(writeNewick(subTree)).toBe('"A":0.0;');
  });

  test('sibling nodes', () => {
    const tr = readNewick('((((A,B),C),D),E);');
    const nodeA = tr.getLeafList()[0];
    const nodeB = tr.getLeafList()[1];
    const mrca = tr.getMRCA([nodeA, nodeB]);
    if (mrca === null) throw new Error('MRCA is null');
    const subTree = tr.getSubtree(mrca);
    expect(writeNewick(subTree)).toBe('("A":0.0,"B":0.0):0.0;');
  });

  test('non-sibling nodes', () => {
    const tr = readNewick('((((A,B),C),D),E);');
    const nodeA = tr.getLeafList()[0];
    const nodeC = tr.getLeafList()[2];
    const mrca = tr.getMRCA([nodeA, nodeC]);
    if (mrca === null) throw new Error('MRCA is null');
    const subTree = tr.getSubtree(mrca);
    expect(writeNewick(subTree)).toBe('(("A":0.0,"B":0.0):0.0,"C":0.0):0.0;');
  });
});

describe('getNodeByLabel()', () => {
  test('returns the correct node by its label', () => {
    const newick = '((A:1,B:1):1,C:1);';
    const tree = readNewick(newick);

    const nodeA = tree.getNodeByLabel('A');
    const nodeB = tree.getNodeByLabel('B');
    const nodeC = tree.getNodeByLabel('C');

    expect(nodeA).toBeInstanceOf(Node);
    expect(nodeA?.label).toBe('A');

    expect(nodeB).toBeInstanceOf(Node);
    expect(nodeB?.label).toBe('B');

    expect(nodeC).toBeInstanceOf(Node);
    expect(nodeC?.label).toBe('C');
  });

  test('returns null when there is no node with the given label', () => {
    const newick = '((A:1,B:1):1,C:1);';
    const tree = readNewick(newick);

    const nodeD = tree.getNodeByLabel('D');

    expect(nodeD).toBeNull();
  });
});

describe('getTipLabels()', () => {
  const tr = readNewick('((((A,B),C),D),E);');
  test('whole tree', () => {
    const labs = tr.getTipLabels();

    expect(JSON.stringify(labs)).toMatch(
      JSON.stringify(['A', 'B', 'C', 'D', 'E'])
    );
  });

  test('subtree', () => {
    const labs = tr.getSubtree(tr.getNodeList()[1]).getTipLabels();

    expect(JSON.stringify(labs)).toMatch(JSON.stringify(['A', 'B', 'C', 'D']));
  });
});
