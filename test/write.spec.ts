// phyloWriter.test.ts
import { Node } from '../src/Node';
import { Tree } from '../src/Tree';
import { Write } from '../src/write';

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

  test('newickWriter', () => {
    const newick = Write.newick(tree);
    expect(newick).toBe('("A":1,("B":1,"C":1):1):0.0;');
  });

  test('nexusWriter', () => {
    const nexus = Write.nexus(tree);
    expect(nexus).toBe(
      '#NEXUS\n\nbegin trees;\n\ttree tree_1 = [&R] ("A":1,("B":1,"C":1):1):0.0;\nend;'
    );
  });
});
