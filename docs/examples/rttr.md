# Root-to-tip Regression

In this example we will do a root to tip regression on a small tree.

We will demonstrate use of `Tree.getRTTDist()`, `Tree.getTipLabels()`, and the `readNewick()` function. 

We begin by defining the newick string, the linear regression function, and a utility function to parse the tip date from the tip label:

```typescript
    import { Tree, readNewick, writeNewick } from 'phylojs'
    
    // Define tree with dates in tip labels
    let newick = '(("D_2000":1.0,"E_2003":1.2):3.0,("C_2005":2.5,("A_2010":1.8,"B_2011":1.07):1.0):1.2):4.0;'

    // Define utility functions to parse dates and do regression
    interface LinearRegression {
        x: number[],
        y: number[],
        fitY: number[],
        slope: number,
        intercept: number,
        r2: number
    }
    function linearRegression(x: number[], y: number[]): LinearRegression {

        let reg = {} as LinearRegression;

        let sum_x = 0;
        let n = y.length;
        let sum_y = 0;
        let sum_xy = 0;
        let sum_xx = 0;
        let sum_yy = 0;
    
        for (let j = 0; j < y.length; j++) {
            sum_x += x[j];
            sum_y += y[j];
            sum_xy += (x[j]*y[j]);
            sum_xx += (x[j]*x[j]);
            sum_yy += (y[j]*y[j]);
        } 
    
        reg.x = x;
        reg.y = y;
        reg.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        reg.intercept = (sum_y - reg.slope * sum_x)/n;
        reg.fitY = x.map(e => (reg.slope * e + reg.intercept));
        reg.r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        
        return reg;
    }
    function extractDate(name: string | undefined, delimiter: string, location: number): number {
        return name !== undefined
            ? parseFloat(name.split(delimiter)[location])
            : NaN
    }
```

Now we can run the regression and view the output
```typescript
    // read tree
    let tree = readNewick(newick);

    // get root-to-tip distances
    let rttd = tree.getRTTDist()

    // get dates
    let dates = tree
        .getTipLabels()
        .map(e => extractDate(e, '_', 1))

    // NB, you might need to disable linting for this line in VScode, as we have below!
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    let reg = linearRegression(dates, rttd)
    
    // Do regression
    console.log(reg)
    // Returns
    // {
    //   x: [ 2000, 2003, 2005, 2010, 2011 ],
    //   y: [ 4, 4.2, 3.7, 4, 3.2700000000000005 ],
    //   slope: -0.04741935483868017,
    //   intercept: 98.94774193542469,
    //   fitY: [
    //     4.109032258064346,
    //     3.9667741935483036,
    //     3.871935483870942,
    //     3.6348387096775383,
    //     3.5874193548388575
    //   ],
    //   r2: 0.37168278586966874
    // }
```
