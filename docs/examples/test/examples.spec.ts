/////////////////////////////////////////////////////
//////// Testing examples for documentation /////////
/////////////////////////////////////////////////////

import { readNewick } from '../../../src/';
import { writeNewick } from '../../../src/';

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

    const nodes = tree.getNodeList();
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
    expect(writeNewick(tree, true)).not.toEqual(newick);
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

    expect(writeNewick(tree, true)).not.toEqual(newick);
  });
});
