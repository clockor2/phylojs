import { writeNewick } from '../src/Write';
import { readNewick } from '../src/Reader';

describe('TreeFromNewick', () => {
  test('init', () => {
    const inNewick = '("A":1,("B":1,"C":1):1):0.0;';
    const tree = readNewick(inNewick);
    const outNewick = writeNewick(tree); 
    expect(outNewick).toBe(inNewick);
  });
});