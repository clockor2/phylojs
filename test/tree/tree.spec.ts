import { readNewick } from '../../src';
import { Node } from '../../src/tree/node';
import { Tree } from '../../src/tree';
import { writeNewick } from '../../src';
import { readFileSync } from 'fs';

describe('Netowrks', () => {
    test('empiricalARGNetworkRecombMapDefined', () => {
        const inNHX = readFileSync('test/data/ARG.newick', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        const edgeMap = network.getRecombEdgeMap();
        expect(
            JSON.stringify(Object.values(edgeMap).map(e => e.length)) // Once source and dest
        ).toBe(
            JSON.stringify(Array(Object.keys(edgeMap).length).fill(2))
        )
    })
    test('empiricalTestSrcNode', () => {
        const inNHX = readFileSync('test/data/ARG.newick', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        const node = network.nodeList[network.nodeList.length - 1]
        expect(network.isRecombSrcNode(node)).toBe(false)
    })
    test('empiricalTestDestNode', () => {
        const inNHX = readFileSync('test/data/ARG.newick', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        const node = network.nodeList[network.nodeList.length - 1]
        expect(network.isRecombDestNode(node)).toBe(true)

    })
    test('empiricalIsNetwork', () => {
        const inNHX = readFileSync('test/data/ARG.newick', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        expect(network.isNetwork()).toBe(true)
    })
    test('isNotNetwork', () => {
        const inNHX = '(A,B);';
        const network = readNewick(inNHX);
        expect(network.isNetwork()).toBe(false)
    })
})

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
            tree.nodeList.map(n => n.label).filter(n => n !== undefined)
        ).toStrictEqual(['A', 'B', 'C']);
        tree.reroot(childNode4);
        const newick = writeNewick(tree);
        expect(newick).toBe('("C":0.5,("B":1,"A":2):0.5);');
        expect(tree.root.children.length).toBe(2);
        expect(
            tree.nodeList.map(n => n.label).filter(n => n !== undefined)
        ).toStrictEqual(['C', 'B', 'A']);
    });
});

describe('reroot() - basic', () => {
    test('updates nwk', () => {
        const tr = readNewick('((A:1,B:1):1,C:1);');
        tr.reroot(tr.nodeList[3]);
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
            nodes = tr[i].nodeList.slice(1); // exclude root (0th id)
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
    })
});

describe('diagnose reroot deltas at each tip', () => {
    const newick = `(Bovine:0.69395,(Gibbon:0.36079,(Orangutan:0.33636,` +
        `(Gorilla:0.17147,(Chimp:1.19268,Human:0.11927):0.08386):0.06124):0.15057):0.54939,Mouse:1.21460);`;
    const base = readNewick(newick);
    const N0 = base.nodeList.length;
    const L0 = base.leafList.length;
    const BL0 = base.getTotalBranchLength();

    const results: { label: string; dN: number; dL: number; dBL: number }[] = [];

    for (const leaf of base.leafList) {
        const tr = readNewick(newick);
        const node = tr.getNodeByLabel(leaf.label!)!;
        tr.reroot(node);

        const dN = tr.nodeList.length - N0;
        const dL = tr.leafList.length - L0;
        const dBL = tr.getTotalBranchLength() - BL0;
        results.push({ label: leaf.label!, dN, dL, dBL });
    }

    test('print reroot deltas', () => {
        // This will print out the array so you can inspect it.
        console.table(results);
        // And fail so you actually see it in CI
        expect(results.every(r => r.dN === 0 && Math.abs(r.dBL) < 1e-8)).toBe(true);
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

describe('getClade()', () => {
    test('simple tree', () => {
        const tr = readNewick('((((A,B),C),D),E);');
        const subTree = tr.getClade(tr.nodeList[1]);

        expect(writeNewick(subTree)).toBe(
            '((("A","B"),"C"),"D");'
        );
    });
});

describe('getMRCA()', () => {
    test('same node', () => {
        const tr = readNewick('((((A,B),C),D),E);');
        const nodeA = tr.leafList[0];
        const mrca = tr.getMRCA([nodeA, nodeA]);
        if (mrca === null) throw new Error('MRCA is null');
        const subTree = tr.getClade(mrca);
        expect(writeNewick(subTree)).toBe('"A";');
    });

    test('sibling nodes', () => {
        const tr = readNewick('((((A,B),C),D),E);');
        const nodeA = tr.leafList[0];
        const nodeB = tr.leafList[1];
        const mrca = tr.getMRCA([nodeA, nodeB]);
        if (mrca === null) throw new Error('MRCA is null');
        const subTree = tr.getClade(mrca);
        expect(writeNewick(subTree)).toBe('("A","B");');
    });

    test('non-sibling nodes', () => {
        const tr = readNewick('((((A,B),C),D),E);');
        const nodeA = tr.leafList[0];
        const nodeC = tr.leafList[2];
        const mrca = tr.getMRCA([nodeA, nodeC]);
        if (mrca === null) throw new Error('MRCA is null');
        const subTree = tr.getClade(mrca);
        expect(writeNewick(subTree)).toBe('(("A","B"),"C");');
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
        const labs = tr.getClade(tr.nodeList[1]).getTipLabels();

        expect(JSON.stringify(labs)).toMatch(JSON.stringify(['A', 'B', 'C', 'D']));
    });
});

describe('ladderise()', () => {
    const tr = readNewick('((D,E),((A,B),C));');
    const oldNwk = writeNewick(tr);
    tr.ladderise();
    const nwkLadderise = writeNewick(tr);

    test('Actually does something', () => {
        expect(oldNwk).not.toMatch(nwkLadderise);
    });

    test('Sort simple tree', () => {
        expect(nwkLadderise).toMatch(
            '(("D","E"),("C",("A","B")));'
        );
    });
});

describe('isUltrametric', () => {
    test('Default undefined', () => {
        const newick = '((A:1,B:1):1,C:2);';
        const tree = readNewick(newick)
        expect(tree.ultrametric).toBe(undefined)
    })
    test('whenTrue', () => {
        const newick = '((A:1,B:1):1,C:2);';
        const tree = readNewick(newick)
        const ultrametric = tree.isUltrametric()
        expect(tree.ultrametric && ultrametric).toBe(true)
    })
    test('Undefined branch lengths', () => {
        const newick = '((A,B),C);';
        const tree = readNewick(newick)
        tree.isUltrametric()
        expect(tree.ultrametric).toBe(false)
    })
    test('Random Tree', () => {
        const newick = '((t1:0.3138195008,(t4:0.2490693955,t3:0.2490693955):0.0647501053):1.194642285,t2:1.508461786);';
        const tree = readNewick(newick)
        tree.isUltrametric()
        expect(tree.ultrametric).toBe(true)
    })
})

describe('gammaStatistic', () => {
    test('Defined branch lengths', () => {
        const newick = "((t1:0.3138195008,(t4:0.2490693955,t3:0.2490693955):0.0647501053):1.194642285,t2:1.508461786);";
        const tree = readNewick(newick)
        expect(tree.gammaStatistic()).toBeCloseTo(0.9531662)
    })
    test('Undefined branch lengths', () => {
        const newick = "((t1,(t4:0.2490693955,t3:0.2490693955):0.0647501053):1.194642285,t2:1.508461786);";
        const tree = readNewick(newick)
        expect(tree.gammaStatistic()).toBe(NaN)
    })
    test('treeTooSmall', () => {
        const newick = "(t1:0.9179862785,t2:0.9179862785);";
        const tree = readNewick(newick)
        expect(tree.gammaStatistic()).toBe(NaN)
    })
})

describe('imbalanceIndicies', () => {
    const newick = "((t1:0.3475497498,(t3:0.1509478958,t2:0.1509478958):0.196601854):0.1545193298,t4:0.5020690796);"
    const tree = readNewick(newick)
    test('colless', () => {
        expect(tree.collessIndex()).toBe(3)
    })
    test('collessNormalised', () => {
        expect(tree.collessIndex("corrected")).toBe(1)
    })
    test('collessQuadratic', () => {
        expect(tree.collessIndex("quadratic")).toBe(5)
    })
    test('Sackin', () => {
        expect(tree.sackinIndex()).toBe(9)
    })
})