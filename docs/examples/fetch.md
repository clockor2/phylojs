Here, we demonstrate how to read in a tree from a url using a `fetch()` request from the fetch API. In this case, we are reading in a list of trees used for testing.

```typescript
    let url = 'https://raw.githubusercontent.com/clockor2/phylojs/main/test/data/egTree.nwk'
    let newick;
    
    fetch(url)
      .then(res => res.text())
      .then(txt => {newick = txt})

    // log first 99 characters to show newick is defined
    console.log(newick.slice(0,99))
    // Returns:
    // (Jeddah-1_KF917527_camel_2013-11-08:0.0000013865,Jeddah-1_KF958702_human_2013-11-05:0.0000013652,((
```