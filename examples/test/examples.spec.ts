/////////////////////////////////////////////////////
//////// Testing examples for documentation /////////
/////////////////////////////////////////////////////

import { readNewick, readTreesFromPhyloXML, readTreesFromNewick, writeNewick, Tree } from '@phylojs';
import { beastAnnotation } from '../../../src/io/writers/newick';

describe('Examples', () => {
  test('RTTR', () => {
    // Define tree with dates in tip labels
    const newick =
      '(("D_2000":1.0,"E_2003":1.2):3.0,("C_2005":2.5,("A_2010":1.8,"B_2011":1.07):1.0):1.2):4.0;';

    // Define utility functions to parse dates and do regression
    interface LinearRegression {
      x: number[];
      y: number[];
      fitY: number[];
      slope: number;
      intercept: number;
      r2: number;
    }
    function linearRegression(x: number[], y: number[]): LinearRegression {
      const reg = {} as LinearRegression;

      let sum_x = 0;
      const n = y.length;
      let sum_y = 0;
      let sum_xy = 0;
      let sum_xx = 0;
      let sum_yy = 0;

      for (let j = 0; j < y.length; j++) {
        sum_x += x[j];
        sum_y += y[j];
        sum_xy += x[j] * y[j];
        sum_xx += x[j] * x[j];
        sum_yy += y[j] * y[j];
      }

      reg.x = x;
      reg.y = y;
      reg.slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
      reg.intercept = (sum_y - reg.slope * sum_x) / n;
      reg.fitY = x.map(e => reg.slope * e + reg.intercept);
      reg.r2 = Math.pow(
        (n * sum_xy - sum_x * sum_y) /
          Math.sqrt(
            (n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)
          ),
        2
      );

      return reg;
    }
    function extractDate(
      name: string | undefined,
      delimiter: string,
      location: number
    ): number {
      return name !== undefined
        ? parseFloat(name.split(delimiter)[location])
        : NaN;
    }

    // get tree
    const tree = readNewick(newick);

    // get root-to-tip distances
    const rttd = tree.getRTTDist();

    // get dates
    const dates = tree.getTipLabels().map(e => extractDate(e, '_', 1));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const reg = linearRegression(dates, rttd);

    // Do regression
    //console.log(reg)
    expect(reg).toBeDefined();
  });

  test('rerooting', () => {
    const newick =
      '(("D_2000":1.0,"E_2003":1.2):3.0,("C_2005":2.5,("A_2010":1.8,"B_2011":1.07):1.0):1.2):4.0;';
    const tree = readNewick(newick);

    const nodes = tree.nodeList;
    const length: number[] = [];

    // We will reroot at each node and check that the length is the same
    for (let i = 1; i < nodes.length; i++) {
      tree.reroot(nodes[i]);
      tree.ladderise();

      length.push(tree.getTotalBranchLength());
    }

    // console.log(`
    //     legnth: ${length.map(e => e.toFixed(3))}
    // `)

    expect(length).toBeDefined();
  });

  test('annotations', () => {
    const newick = '((A[&Type=Blue],B[&Type=Blue]),C[&Type=Green]);';
    const tree = readNewick(newick);

    if (tree.leafList !== undefined) {
      for (let i = 0; i < tree.leafList.length; i++) {
        if (tree.leafList[i].annotation.Type == 'Blue') {
          tree.leafList[i].annotation.Type = 'Red';
        } else {
          tree.leafList[i].annotation.Type = 'Yellow';
        }
      }
    }
    expect(writeNewick(tree, beastAnnotation)).not.toEqual(newick);
  });

  test('annotations subset', () => {
    const newick = '((A[&Type=Blue],B),C);';
    const tree = readNewick(newick);

    if (tree.leafList !== undefined) {
      for (let i = 0; i < tree.leafList.length; i++) {
        if (tree.leafList[i].annotation.Type == 'Blue') {
          tree.leafList[i].annotation.Type = 'Red';
        } else {
          tree.leafList[i].annotation.Type = 'Yellow';
        }
      }
    }

    expect(writeNewick(tree, beastAnnotation)).not.toEqual(newick);
  });

  test('multiple trees', () => {
    // Using two small trees here
    const inPhyloXML = `<phyloxml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.phyloxml.org" xsi:schemaLocation="http://www.phyloxml.org http://www.phyloxml.org/1.10/phyloxml.xsd">
    <phylogeny rooted="true">
      <clade>
          <branch_length>1</branch_length>
          <name>A</name>
      </clade>
      <clade>
          <branch_length>1</branch_length>
          <clade>
              <branch_length>1</branch_length>
              <name>B</name>
          </clade>
          <clade>
              <branch_length>1</branch_length>
              <name>C</name>
          </clade>
      </clade>
    </phylogeny>
    <phylogeny rooted="true">
      <clade>
          <branch_length>1</branch_length>
          <name>A</name>
      </clade>
      <clade>
          <branch_length>1</branch_length>
          <clade>
              <branch_length>1</branch_length>
              <name>B</name>
          </clade>
          <clade>
              <branch_length>1</branch_length>
              <name>C</name>
          </clade>
      </clade>
    </phylogeny>
    </phyloxml>`;

    let trees = readTreesFromPhyloXML(inPhyloXML);

    let inNewick = trees.map(t => writeNewick(t)).join('\n')

    // Operate on trees using array methods. E.g. Reroot, ladderise, and scale branch lengths randomly

    trees.forEach(t => t.reroot(t.nodeList[4])) // arbitrarily to 4th node
    trees.forEach(t => t.ladderise())
    trees.forEach(t => t.nodeList.forEach(
      n => n.branchLength ? n.branchLength *= Math.floor(10*Math.random() + 1) : 0
    ))

    // write output
    let outNewick = trees.map(t => writeNewick(t)).join('\n')

    expect(inNewick).not.toEqual(outNewick)
  })

  test('multiple trees with newick', () => {
    // Using two small trees here

    const inNewick = '((A:1,B:1):1,C:1);\n((A:1,B:1):1,C:1);'
    let trees = readTreesFromNewick(inNewick);

    // Operate on trees using array methods. E.g. Reroot, ladderise, and scale branch lengths randomly

    trees.forEach(t => t.reroot(t.nodeList[4])) // arbitrarily to 4th node
    trees.forEach(t => t.ladderise())
    trees.forEach(t => t.nodeList.forEach(
      n => n.branchLength ? n.branchLength *= Math.floor(10*Math.random() + 1) : 0
    ))

    // write output
    let outNewick = trees.map(t => writeNewick(t)).join('\n')

    expect(inNewick).not.toEqual(outNewick)
  })

  // COMMENTED OUT BC JEST DOESN'T LIKE FETCH API
  // test('multiple trees with fetch', () => {
  //   // Using two small trees here

  //   let url = 'https://raw.githubusercontent.com/clockor2/phylojs/main/test/data/egTree.nwk'
  //   let newick;
    
  //   fetch(url)
  //     .then(res => res.text())
  //     .then(txt => {newick = txt})

  //   // log first 99 characters to show newick is defined
  //   console.log(newick.slice(0,99))
  //   // Returns:
  //   // (Jeddah-1_KF917527_camel_2013-11-08:0.0000013865,Jeddah-1_KF958702_human_2013-11-05:0.0000013652,((
  // })

  test('getBranchLengthRatio()', () => {
    function getBranchLengthRatio(tree: Tree): number {

      let sumInternal: number = 0.0;
      let sumExternal: number = 0.0;

      for (let i=0; i<tree.nodeList.length; i++) {
        if(tree.nodeList[i].branchLength !== undefined){
          if (tree.nodeList[i].isLeaf()) {
            sumExternal += tree.nodeList[i].branchLength
          } else {
            sumInternal += tree.nodeList[i].branchLength
          }
        }
      }
      return sumInternal / sumExternal;
    }

    let nwk = `((a:2,b:2):1,(c:2,d:2):1);`
    let tree = readNewick(nwk)

    expect(getBranchLengthRatio(tree)).toEqual(0.25)
  })

  test('IE BL ratio statistic', () => {
    // Internal to external branch length ratio
    function getBranchLengthRatio(tree: Tree): number {

      let sumInternal: number = 0.0;
      let sumExternal: number = 0.0;

      for (let i=0; i<tree.nodeList.length; i++) {
        if(tree.nodeList[i].branchLength !== undefined){
          if (tree.nodeList[i].isLeaf()) {
            sumExternal += tree.nodeList[i].branchLength
          } else {
            sumInternal += tree.nodeList[i].branchLength
          }
        }
      }
      return sumInternal / sumExternal;
    }

    let nwk = `((a:2,b:2):1,(c:1,d:1):4);`
    let tree = readNewick(nwk)

    // IE ratio for subtrees descending from each node, except tips
    tree.root.applyPreOrder((node: Node) => {
      if(!node.isLeaf()) {
        let ieRatio = getBranchLengthRatio(tree.getSubtree(node))
        node.annotation = {ieRatio: ieRatio.toFixed(2)}
      }
    });

    // Expect annotations in newick with `true` flag
    expect(writeNewick(tree, beastAnnotation)).not.toBe(nwk)
  })

  test('Pruning', () => {
    let nwk = "((A,B),(C,D));"
    let tree = readNewick(nwk)  

    // Get ancestor of tips A and B
    let node = tree.getMRCA(tree.leafList.slice(0,2))
    // Prune
    tree
      .nodeList[node.parent.id] // Select node's parent by `id`
      .removeChild(node) // Pruning step

    // console.log(`
    //   Original Nwk: ${nwk}
    //   Pruned Tree: ${writeNewick(tree)}
    // `)
    // Returns
    // Original Nwk: ((A,B),(C,D));
    // Pruned Tree: (("C":0.0,"D":0.0):0.0):0.0;
    
    expect(writeNewick(tree)).not.toBe(nwk)

  })
  test('Grafting', () => {
    let nwk = "((A,B),(C,D));"
    let tree = readNewick(nwk)  

    // Get ancestor of tips A and B. NB this is a `cherry` (A,B)
    let node = tree.getMRCA(tree.leafList.slice(0,2))

    // Graft cherry onto tip `A` 2 times
    for (let i=0; i<2; i++) {
      tree
        //.nodeList[node.parent.id] // Select node's parent by `id`
        .leafList[i]
        .addChild(node.copy()) // .copy() to ensure we don't bump into recursion issues
    }

    // console.log(`
    //   Original Nwk: ${nwk}
    //   Pruned Tree: ${writeNewick(tree)}
    // `)
    // Return
    // Original Nwk: ((A,B),(C,D));
    // Pruned Tree: (((("A":0.0,"B":0.0):0.0)"A":0.0,(((("A":0.0,"B":0.0):0.0)"A":0.0,"B":0.0):0.0)"B":0.0):0.0,("C":0.0,"D":0.0):0.0):0.0;
    
    expect(writeNewick(tree)).not.toBe(nwk)

  })

});
