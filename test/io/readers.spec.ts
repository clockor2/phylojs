import {
    writeNewick,
    readNewick,
    readNexus,
    readPhyloXML,
    readNeXML,
    readTreesFromNewick,
    readTreesFromNexus,
    readTreesFromPhyloXML,
    readTreesFromNeXML

} from '../../src';
import { parseNewickAnnotations, parseHybridLabels } from '../../src/io/readers/newick';
import { readFileSync } from 'fs';
import { beastAnnotation, nhxAnnotation } from '../../src/io/writers/newick';

describe('parseAnnotations', () => {
    test('parseBEASTStyleAnnotations', () => {
        var a = '&col=Red,hand={left,right}';
        var parsed = parseNewickAnnotations(a);

        expect(parsed).toEqual(
            {
                col: 'Red',
                hand: ['left', 'right']
            }
        )
    })
    test('parseNHXAnnotations', () => {
        var a = '&&NHX:col=Red:hand={left,right}';
        var parsed = parseNewickAnnotations(a);

        expect(parsed).toEqual(
            {
                col: 'Red',
                hand: ['left', 'right']
            }
        )
    })
    test('parseHybridLabels', () => {
        var inLabel = 'x#H21'
        var outLabel = parseHybridLabels(inLabel)

        expect(JSON.stringify(outLabel)).toBe(
            JSON.stringify({ label: 'x', hybridID: 21 })
        )
    })
})

describe('Extended Newick', () => {
    test('parseSimpleNetwork', () => {
        const inNHX = '((C,(Y)x#H1)c,(x#H1,D)d)e;'
        const network = readNewick(inNHX);
        const outNewick = writeNewick(network)
        expect(outNewick).toBe('(("C",("Y")"x"#1)"c",("x"#1,"D")"d")"e";')
    })
    test('hybridMapExists', () => {
        const inNHX = '((C,(Y)x#H1)c,(x#H1,D)d)e;'
        const network = readNewick(inNHX);
        expect(network.getRecombEdgeMap()).toBeDefined()
    })
    test('parseWithBL', () => {
        const inNHX = '((C,(Y)x#H1:3)c:3,(x#H1,D)d)e;'
        const network = readNewick(inNHX);
        const outNewick = writeNewick(network)
        expect(outNewick).toBe('(("C",("Y")"x"#1:3)"c":3,("x"#1,"D")"d")"e";')
    })
    test('parseEmpiricalARGNetwork', () => {
        const inNHX = readFileSync('test/data/ARG.newick', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        const outNewick = writeNewick(network)
        expect(outNewick).toBe(inNHX)
    })
})

describe('NHX', () => {
    test('parseEmpiricalNHX', () => {
        const inNHX = readFileSync('test/data/testNHX.nhx', 'utf-8').split("\n")[0];
        const network = readNewick(inNHX);
        const outNewick = writeNewick(network, nhxAnnotation)
        // TODO: For now am assuming that order of branch lenght and annotations isn't important
        const expected = "(((\"ADH2\"[&&NHX:S=human]:0.1,\"ADH1\"[&&NHX:S=human]:0.11)[&&NHX:S=primates:D=Y:B=100]:0.05,\"ADHY\"[&&NHX:S=nematode]:0.1,\"ADHX\"[&&NHX:S=insect]:0.12)[&&NHX:S=metazoa:D=N]:0.1,(\"ADH4\"[&&NHX:S=yeast]:0.09,\"ADH3\"[&&NHX:S=yeast]:0.13,\"ADH2\"[&&NHX:S=yeast]:0.12,\"ADH1\"[&&NHX:S=yeast]:0.11)[&&NHX:S=Fungi]:0.1)[&&NHX:D=N];"
        expect(outNewick).toBe(expected)
    })
})

describe('Newick', () => {
    test('read', () => {
        const inNewick = '(A:1,(B:1,C:1):1):0;';
        const tree = readNewick(inNewick);
        const outNewick = writeNewick(tree);
        expect(outNewick).toBe('("A":1,("B":1,"C":1):1):0.0;');
    });
    test('readTrees', () => {
        const inNewick =
            '("A":1,("B":1,"C":1):1):0.0;\n("A":1,("B":1,"C":1):1):0.0;';
        const trees = readTreesFromNewick(inNewick);
        const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
        expect(outNewick).toBe(inNewick);
    });
    test('readTreesDecimalBL', () => {
        const inNewick =
            '("A":1.2,("B":1.3,"C":1.4):1.5):0.0;\n("A":1.6,("B":1.7,"C":1.8):1.9):0.8;';
        const trees = readTreesFromNewick(inNewick);
        const outNewick = trees.map(tree => writeNewick(tree)).join('\n');
        expect(outNewick).toBe(inNewick);
    });
    test('parseAnnotations', () => {
        const inNewick = '(("A"[&Type=Blue]:1.1,"B"[&Type=Blue]:2.2),"C"[&Type=Green]);'
        const tree = readNewick(inNewick);
        const outNewick = writeNewick(tree, beastAnnotation);
        expect(outNewick).toBe(inNewick);
    });
    test('parseAnnotationsWithArray', () => {
        const inNewick = '(("A"[&Type={Blue,Green}]:1.1,"B"[&Type={Blue,Mauve}]:2.2),"C"[&Type=Green]);'
        const tree = readNewick(inNewick);
        const outNewick = writeNewick(tree, beastAnnotation);
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
        const newick = '("A":1,("B":1,"C":1):1);';
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
        const newick = '("A":1,("B":1,"C":1):1);\n("A":1,("B":1,"C":1):1);';
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
        const newick = '("A":1,("B":1,"C":1):1);';
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
        const newick = '("A":1,("B":1,"C":1):1);\n("A":1,("B":1,"C":1):1);';
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
        const newick = '("A":1,("B":1,"C":1):1);';
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
        const newick = '("A":1,("B":1,"C":1):1);\n("A":1,("B":1,"C":1):1);';
        expect(outNewick).toBe(newick);
    });
});
