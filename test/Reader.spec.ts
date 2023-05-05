import { TreeFromNewick, Write } from '../src';

describe('TreeFromNewick', () => {
  test('init', () => {
    const inNewick = '("A":1,("B":1,"C":1):1):0.0;';
    const tree = new TreeFromNewick(inNewick);
    const outNewick = Write.newick(tree);
    expect(outNewick).toBe(inNewick);
  });
});
