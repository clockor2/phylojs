// phyloWriter.test.ts
import { readNewick } from '../src/Reader';
import { Node } from '../src/Node';
import { Tree } from '../src/Tree';
import { writeNewick } from '../src/Write';
import { readFileSync } from 'fs';

describe('PhyloWriter', () => {
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
    let tr = readNewick('((A:1,B:1):1,C:1);')
    tr.reroot(tr.getNodeList()[3])
    let nwkPrime = writeNewick(tr)

    expect(nwkPrime).not.toBe('((A:1,B:1):1,C:1);')
  })

  let nwk = readFileSync('test/testTrees.nwk', 'utf-8').split(/\r?\n/)
  const tr = nwk.map(e => readNewick(e))

  test('invariant length with varying prop on test trees', () => {
    let nodes: any;
    let prop: number;
    let originalLength: number[] = []
    let newLength: number[] = []
    let diff: boolean[] = []
    const tol = 1e-10 // smaller than smallest branch length here

    for (let i = 0; i < tr.length; i++){

      nodes = tr[i].getNodeList().slice(1) // exclude root (0th id)
      for (let j = 0; j<nodes.length; j++) {

        originalLength.push(tr[i].getLength())

        prop = j / nodes.length
        tr[i].reroot(nodes[j], prop)
        newLength.push(tr[i].getLength())

        diff.push(Math.abs(originalLength[j] - newLength[j]) < tol)

      }
    }
    expect(
      JSON.stringify(diff)
    ).toBe(
      JSON.stringify(originalLength.map(e => true))
    )
  })
})

describe('getLength()', () => {
  test('all branch lengths defined', () => {
    let tr = readNewick('((A:1,B:1):1,C:1);')
    expect(tr.getLength()).toBe(4)
  })

  test('count undefined branch lengths as zero', () => {
    let tr = readNewick('((A:1,B:1),C:1);')
    expect(tr.getLength()).toBe(3)
  })
})

describe('getRTTDist()', () => {
  test('all branch lengths defined', () => {
    let tr = readNewick('((A:1,B:1):1,C:1);')
    let rttDist = tr.getRTTDist()
    expect(rttDist).toStrictEqual([2,2,1])
  })

  test('when some branch lengths defined', () => {
    let tr = readNewick('((A:1,B:1),C:1);')
    let rttDist = tr.getRTTDist()
    expect(rttDist).toStrictEqual([1,1,1])
  })

  test('returns values for test trees (<==> sum defined)', () => {
    let nwk = readFileSync('test/testTrees.nwk', 'utf-8').split(/\r?\n/)
    const tr = nwk.map(e => readNewick(e))

    let rttDistances = tr.map(e => e.getRTTDist())

    let type = rttDistances
      .map(e => e.map(e => typeof e))

    expect(
      JSON.stringify(type)
    )
    .toBe(
      JSON.stringify(rttDistances.map(e => e.map(() => 'number')))
    )
  })

})

describe('getSubtree()', () => {
  test('simple tree', () => {
    let tr = readNewick('((((A,B),C),D),E);')
    let subTree = tr.getSubtree(tr.getNodeList()[1])

    expect(
      writeNewick(subTree)
    ).toBe(
      '((("A":0.0,"B":0.0):0.0,"C":0.0):0.0,"D":0.0):0.0;'
    )
  })
})

describe('getTipLabels()', () => {
  let tr = readNewick('((((A,B),C),D),E);')
  test('whole tree', () => {
    let labs = tr.getTipLabels()

    expect(
      JSON.stringify(labs)
    ).toMatch(
      JSON.stringify(["A", "B", "C", "D", "E"])
    )
  })

  test('subtree', () => {
    let labs = tr.getSubtree(
      tr.getNodeList()[1]
    ).getTipLabels()

    expect(
      JSON.stringify(labs)
    ).toMatch(
      JSON.stringify(["A", "B", "C", "D"])
    )
  })
})