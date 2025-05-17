# Tree Data Import Functions: An Overview
Here we proivde an overview of functions used for reading phylogenetic trees from different file formats. Each format—NeXML, Newick, Nexus, PhyloXML, and PhyJSON—has specific reading functions, which are described below.
## NeXML
`readNeXML(nexml: string): Tree`
This function reads a NeXML string and returns a single tree. NeXML is an XML format designed for rich representation of phylogenetic data.

`readTreesFromNeXML(nexml: string): Tree[]`
Reads NeXML strings and returns an array of trees, allowing multiple trees to be parsed from a single NeXML document.

## Newick
```javascript
readNewick(
    str: string,
    annotationParser: (annotations: string) => typeof Node.prototype.annotation = parseNewickAnnotations
    ): Tree
```
Parses a Newick format string and returns a tree. See API for details on the `annotationParser` function. In short, it is optional and you can ommit any reference to it if you do not need to parse annotations. That is, you can just call `readNewick(str)`.

`readTreesFromNewick(newick: string): Tree[]`
Reads multiple Newick format strings, each separated by `\n`, and returns an array of trees.

## Nexus
`readNexus(nexus: string): Tree`
Reads a single tree from Nexus format. Returns only the first tree if many are present. Nexus is a format that can include multiple types of data including trees, morphological characters, and molecular sequences.

`readTreesFromNexus(nexus: string): Tree[]`
Parses Nexus format strings and returns an array of trees, supporting documents containing multiple trees.

## PhyloXML
`readPhyloXML(phyloxml: string): Tree`
Reads a single tree from a PhyloXML format string. PhyloXML is an XML format specifically designed for phylogenetic trees and networks.

`readTreesFromPhyloXML(phyloxml: string): Tree[]`
Reads multiple trees from a PhyloXML document, returning an array of trees.

## PhyJSON
`readPhyJSON(phyJSONString: string): Tree`
Parses a PhyJSON format string and returns a single tree. PhyJSON is a JSON format for phylogenetic trees.

`readTreesFromPhyJSON(phyJSONString: string): Tree[]`
Reads multiple trees from a PhyJSON document, returning an array of trees.

## General Tree Reader
`read(text: string, schema: Schema = ‘newick’): Tree[]`
A general function to read trees from a string according to the specified schema (`newick`, `nexus`, `phyloxml`, `nexml`, or `phyjson`). This function provides a unified interface to parse trees from different formats.