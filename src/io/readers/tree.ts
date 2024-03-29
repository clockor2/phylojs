import {
  Tree,
  readTreesFromNewick,
  readTreesFromNeXML,
  readTreesFromPhyloXML,
  readTreesFromNexus,
  readTreesFromPhyJSON,
} from '../../';

type Schema = 'newick' | 'nexus' | 'phyloxml' | 'nexml' | 'phyjson';

/**
 * Reads trees from a string according to the specified `schema`. TODO: add support for getting trees from a URL.
 * @param {string} text
 * @param {Schema='newick'} schema newick, nexus, phyloXML, or NeXML
 * @returns {Tree[]}
 */
export function read(text: string, schema: Schema = 'newick'): Tree[] {
  if (text.startsWith('http://') || text.startsWith('https://')) {
    throw new Error('Fetching trees from the internet is not yet supported');
  }
  switch (schema) {
    case 'newick':
      return readTreesFromNewick(text);
    case 'nexus':
      return readTreesFromNexus(text);
    case 'phyloxml':
      return readTreesFromPhyloXML(text);
    case 'nexml':
      return readTreesFromNeXML(text);
    case 'phyjson':
      return readTreesFromPhyJSON(text);
    default:
      throw new Error('Invalid schema');
  }
}
