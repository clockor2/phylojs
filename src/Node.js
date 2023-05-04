// Node constructor

function Node(id) {
    this.id = id;

    this.parent =  undefined;
    this.children = [];
    this.height = undefined;
    this.branchLength = undefined;
    this.label = undefined;
    this.annotation = {};
    this.hybridID = undefined;
}

// Node methods

// Ensure nodes with unique IDs have unique hashes.
Node.prototype.toString = function() {
    return "node#" + this.id;
};

Node.prototype.addChild = function(child) {
    this.children.push(child);
    child.parent = this;
};

Node.prototype.removeChild = function(child) {
    var idx = this.children.indexOf(child);
    this.children.splice(idx, 1);
};

Node.prototype.isRoot = function() {
    return (this.parent === undefined);
};

Node.prototype.isLeaf = function() {
    return (this.children.length === 0);
};

Node.prototype.isSingleton = function() {
    return (this.children.length === 1);
};

Node.prototype.isHybrid = function() {
    return (this.hybridID !== undefined);
};

Node.prototype.getAncestors = function() {
    if (this.isRoot())
        return [this];
    else
        return [this].concat(this.parent.getAncestors());
};

// Returns true if this node is left of the argument on the
// tree.  If one node is the direct ancestor of the other,
// the result is undefined.
Node.prototype.isLeftOf = function(other) {
    var ancestors = this.getAncestors().reverse();
    var otherAncestors = other.getAncestors().reverse();

    var i;
    for (i=1; i<Math.min(ancestors.length, otherAncestors.length); i++) {
        if (ancestors[i] != otherAncestors[i]) {
            var mrca = ancestors[i-1];

            return mrca.children.indexOf(ancestors[i]) <
                mrca.children.indexOf(otherAncestors[i]);
        }
    }

    return undefined;
};

// Produce a deep copy of the clade below this node
Node.prototype.copy = function() {

    var nodeCopy = new Node(this.id);
    nodeCopy.height = this.height;
    nodeCopy.branchLength = this.branchLength;
    nodeCopy.label = this.label;
    for (var key in this.annotation)
        nodeCopy.annotation[key] = this.annotation[key];
    nodeCopy.id = this.id;
    nodeCopy.hybridID = this.hybridID;

    nodeCopy.collapsed = this.collapsed;
    nodeCopy.cartoon = this.cartoon;

    for (var i=0; i<this.children.length; i++)
        nodeCopy.addChild(this.children[i].copy());

    return nodeCopy;
};

// Apply f() to each node in subtree
Node.prototype.applyPreOrder = function(f) {
    var res = [];

    var thisRes = f(this);
    if (thisRes !== null)
        res = res.concat(thisRes);

    for (var i=0; i<this.children.length; i++)
        res = res.concat(this.children[i].applyPreOrder(f));

    return res;
};
