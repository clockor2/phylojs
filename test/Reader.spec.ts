import { writeNewick } from '../src/Write';
import { readNewick, readPhyloXML } from '../src/Reader';

describe('TreeFromNewick', () => {
  test('init', () => {
    const inNewick = '("A":1,("B":1,"C":1):1):0.0;';
    const tree = readNewick(inNewick);
    const outNewick = writeNewick(tree);
    expect(outNewick).toBe(inNewick);
  });
});

describe('TreeFromPhyloXML', () => {
  test('init', () => {
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
    </phyloxml>`;
    const tree = readPhyloXML(inPhyloXML);
    const outNewick = writeNewick(tree);
    const newick = '("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
});
