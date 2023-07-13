<!-- markdownlint-disable-next-line -->
<p align="center">
  <a href="https://mui.com/" rel="noopener" target="_blank"><img width="250" src="docs/images/logo.png" alt="MUI logo"></a>
</p>

<h1 align="center">PhyloJS</h1>

<div align="center">

[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Version][npm-img]][npm-url]
[![Issues][issues-img]][issues-url]
[![Codecov][codecov-img]][codecov-url]
[![semantic-release][semantic-release-img]][semantic-release-url]
[![Commitizen friendly][commitizen-img]][commitizen-url]

</div>

**PhyloJS** is a powerful javascript/typescript library for manipulating phylogenetic trees. It allows users to read and write trees in various formats, extract subtrees, and compute properties such as the most recent common ancestor (MRCA) of a set of nodes, among other features.

PhyloJS is especially helpful in situations where you need to analyze large phylogenetic trees, such as when you're studying evolutionary relationships in bioinformatics or computational biology. PhyloJS is lightweight and has zero dependencies.

## Installation

You can install PhyloJS using npm:

```bash
npm install phylojs
```

## Usage

Here is an example of how you can use PhyloJS to find the MRCA of a set of nodes and then extract a subtree from that MRCA:

```typescript
import { readNewick, Tree, Node } from 'phylojs';

function findMRCAandExtractSubtree(newickStr: string, labels: string[]): Tree {
  const tree: Tree = readNewick(newickStr);
  const nodes: Node[] = labels.map(label => {
    const node = tree.getNodeByLabel(label);
    if (node === null) throw new Error(`No node found with label ${label}`);
    return node;
  });

  const mrca = tree.getMRCA(nodes);
  if (mrca === null) throw new Error('MRCA is null');

  const subtree: Tree = tree.getSubtree(mrca);

  return subtree;
}

const newickStr: string = '((A:0.1,B:0.2):0.3,(C:0.3,D:0.4):0.5,E:0.6);'; // Newick string as input
const labels: string[] = ['A', 'B', 'D']; // Leaf labels to find MRCA

try {
  const subtree: Tree = findMRCAandExtractSubtree(newickStr, labels);
  // Process the 'subtree' as needed
  // For example, you might print it to the console
  // console.log(subtree);
} catch (error) {
  console.error(error);
}
```

This script reads a Newick string to create a `Tree` object, then uses the `getNodeByLabel` method to find nodes corresponding to the given labels. It then calculates the MRCA of these nodes using `getMRCA`, and finally extracts the corresponding subtree using `getSubtree`.

Please refer to the [API Documentation](#) for more details about the available methods and classes in PhyloJS.

## IcyTree

PhyloJS it derived from Tim Vaughan's [IcyTree](https://icytree.org/) and is similarly licensed under version 3 of the GNU General Public License (GPL).

[build-img]: https://github.com/clockor2/phylojs/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/clockor2/phylojs/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/phylojs
[downloads-url]: https://www.npmtrends.com/phylojs
[npm-img]: https://img.shields.io/npm/v/phylojs
[npm-url]: https://www.npmjs.com/package/phylojs
[issues-img]: https://img.shields.io/github/issues/clockor2/phylojs
[issues-url]: https://github.com/clockor2/phylojs/issues
[codecov-img]: https://codecov.io/gh/clockor2/phylojs/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/clockor2/phylojs
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/


## [![Repography logo](https://images.repography.com/logo.svg)](https://repography.com) / Recent activity [![Time period](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_badge.svg)](https://repography.com)
[![Timeline graph](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_timeline.svg)](https://github.com/clockor2/phylojs/commits)
[![Issue status graph](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_issues.svg)](https://github.com/clockor2/phylojs/issues)
[![Pull request status graph](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_prs.svg)](https://github.com/clockor2/phylojs/pulls)
[![Trending topics](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_words.svg)](https://github.com/clockor2/phylojs/commits)
[![Top contributors](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_users.svg)](https://github.com/clockor2/phylojs/graphs/contributors)
[![Activity map](https://images.repography.com/39585511/clockor2/phylojs/recent-activity/fEpIxSDb_sYUgM2j1bUXjyxlfQUWr4vm0GR4B9KfpZ0/AlnGCAo5heF-BM0bnFaZKQDLWHHjzsmfLVqlVNru6dw_map.svg)](https://github.com/clockor2/phylojs/commits)


