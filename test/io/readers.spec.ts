import { writeNewick } from '@phylojs';
import {
  readNewick,
  readNexus,
  readPhyloXML,
  readNeXML,
  readTreesFromNewick,
  readTreesFromNexus,
  readTreesFromPhyloXML,
  readTreesFromNeXML,
} from '@phylojs';

describe('Newick', () => {
  test('read', () => {
    const inNewick = '("A":1,("B":1,"C":1):1):0.0;';
    const tree = readNewick(inNewick);
    const outNewick = writeNewick(tree);
    expect(outNewick).toBe(inNewick);
  });
  test('readTrees', () => {
    const inNewick =
      '("A":1,("B":1,"C":1):1):0.0;\n("A":1,("B":1,"C":1):1):0.0;';
    const trees = readTreesFromNewick(inNewick);
    const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
    expect(outNewick).toBe(inNewick);
  });
});

describe('Nexus', () => {
  test('read', () => {
    const inNexus = `#NEXUS
    Begin trees;
    tree tree1 = (A:1,(B:1,C:1):1);
    End;`;
    const tree = readNexus(inNexus);
    const outNewick = writeNewick(tree);
    const newick = '("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
  test('readTrees', () => {
    const inNexus = `#NEXUS
    Begin trees;
    tree tree1 = (A:1,(B:1,C:1):1);
    tree tree2 = (A:1,(B:1,C:1):1);
    End;`;
    const trees = readTreesFromNexus(inNexus);
    const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
    const newick = '("A":1,("B":1,"C":1):1):0.0;\n("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
});

describe('PhyloXML', () => {
  test('read', () => {
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
  test('readTrees', () => {
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
    const trees = readTreesFromPhyloXML(inPhyloXML);
    const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
    const newick = '("A":1,("B":1,"C":1):1):0.0;\n("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
});

describe('NeXML', () => {
  test('read', () => {
    const inNeXML = `<?xml version="1.0" encoding="UTF-8"?>
    <nexml xmlns="http://www.nexml.org/2009" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nexml.org/2009 http://www.nexml.org/2009/nexml.xsd" version="0.9" generator="OpenAI Assistant">
        <otus id="otu_set">
            <otu id="A" label="A"/>
            <otu id="B" label="B"/>
            <otu id="C" label="C"/>
        </otus>
        <trees id="tree_set" otus="otu_set">
            <tree id="tree1" label="sample_tree">
                <node id="node1" root="true"/>
                <node id="node2" label="A" otu="A"/>
                <node id="node3" />
                <node id="node4" label="B" otu="B"/>
                <node id="node5" label="C" otu="C"/>
    
                <edge id="edge1" source="node1" target="node2" length="1"/>
                <edge id="edge2" source="node1" target="node3" length="1"/>
                <edge id="edge3" source="node3" target="node4" length="1"/>
                <edge id="edge4" source="node3" target="node5" length="1"/>
            </tree>
        </trees>
    </nexml>`;
    const tree = readNeXML(inNeXML);
    const outNewick = writeNewick(tree);
    const newick = '("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
  test('readTrees', () => {
    const inNeXML = `<?xml version="1.0" encoding="UTF-8"?>
    <nexml xmlns="http://www.nexml.org/2009" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nexml.org/2009 http://www.nexml.org/2009/nexml.xsd" version="0.9" generator="OpenAI Assistant">
        <otus id="otu_set">
            <otu id="A" label="A"/>
            <otu id="B" label="B"/>
            <otu id="C" label="C"/>
        </otus>
        <trees id="tree_set" otus="otu_set">
            <tree id="tree1" label="sample_tree">
                <node id="node1" root="true"/>
                <node id="node2" label="A" otu="A"/>
                <node id="node3" />
                <node id="node4" label="B" otu="B"/>
                <node id="node5" label="C" otu="C"/>
    
                <edge id="edge1" source="node1" target="node2" length="1"/>
                <edge id="edge2" source="node1" target="node3" length="1"/>
                <edge id="edge3" source="node3" target="node4" length="1"/>
                <edge id="edge4" source="node3" target="node5" length="1"/>
            </tree>
            <tree id="tree2" label="sample_tree">
                <node id="node1" root="true"/>
                <node id="node2" label="A" otu="A"/>
                <node id="node3" />
                <node id="node4" label="B" otu="B"/>
                <node id="node5" label="C" otu="C"/>
    
                <edge id="edge1" source="node1" target="node2" length="1"/>
                <edge id="edge2" source="node1" target="node3" length="1"/>
                <edge id="edge3" source="node3" target="node4" length="1"/>
                <edge id="edge4" source="node3" target="node5" length="1"/>
            </tree>
        </trees>
    </nexml>`;
    const trees = readTreesFromNeXML(inNeXML);
    const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
    const newick = '("A":1,("B":1,"C":1):1):0.0;\n("A":1,("B":1,"C":1):1):0.0;';
    expect(outNewick).toBe(newick);
  });
});
