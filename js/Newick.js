// TreeFromNewick constructor

export function TreeFromNewick(newick) {

    // Lex
    var tokenList = this.doLex(newick);

    // Parse
    TreeBuilder.call(this, this.doParse(tokenList, newick));

    // Zero root edge length means undefined
    if (this.root.branchLength === 0.0)
        this.root.branchLength = undefined;
}

TreeFromNewick.prototype = Object.create(TreeBuilder.prototype);
TreeFromNewick.prototype.constructor = TreeFromNewick;


// TreeFromNewick properties/methods

TreeFromNewick.prototype.tokens = [
        ["OPENP", /^\(/, false],
        ["CLOSEP", /^\)/, false],
        ["COLON", /^:/, false],
        ["COMMA", /^,/, false],
        ["SEMI", /^;/, false],
        ["OPENA", /^\[&/, false],
        ["CLOSEA", /^\]/, false],
        ["OPENV", /^{/, false],
        ["CLOSEV", /^}/, false],
        ["EQ", /^=/, false],
        ["HASH", /#/, false],
        ["STRING", /^"(?:[^"]|"")+"/, true],
        ["STRING",/^'(?:[^']|'')+'/, true],
        ["STRING", /^[^,():;[\]#]+(?:\([^)]*\))?/, true, 0],
        ["STRING", /^[^,[\]{}=]+/, true, 1]];

// Lexical analysis
TreeFromNewick.prototype.doLex = function(newick) {
    var tokenList = [];
    var idx = 0;

    // Lexer has two modes: 0 (default) and 1 (attribute mode)
    var lexMode = 0;

    while (idx<newick.length) {

        // Skip over whitespace:
        var wsMatch = newick.slice(idx).match(/^\s/);
        if (wsMatch !== null && wsMatch.index === 0) {
            idx += wsMatch[0].length;
            continue;
        }

        var matchFound = false;
        for (var k = 0; k<this.tokens.length; k++) {

            // Skip lexer rules not applying to this mode:
            if (this.tokens[k].length>3 && this.tokens[k][3] !== lexMode)
                continue;

            var match = newick.slice(idx).match(this.tokens[k][1]);
            if (match !== null && match.index === 0) {

                var value = match[0];

                if (this.tokens[k][2]) {
                    if (this.tokens[k][0] === "STRING") {
                        value = value.replace(/^"(.*)"$/,"$1").replace(/^'(.*)'$/, "$1");
                        value = value.replace("''","'").replace('""','"');
                    }
                }

                tokenList.push([this.tokens[k][0], value, idx]);

                switch(this.tokens[k][0]) {
                    case "OPENA":
                        lexMode = 1;
                        break;
                    case "CLOSEA":
                        lexMode = 0;
                        break;
                    default:
                        break;
                }

                matchFound = true;
                idx += match[0].length;
                break;
            }
        }

        if (!matchFound) {
            throw new ParseException("Error reading character " + newick[idx] + " at position " + idx);
        }

    }

    return tokenList;
};

// Assemble tree from token list
TreeFromNewick.prototype.doParse = function(tokenList, newick) {

    var thisNodeID = 0;

    var idx = 0;
    //var indent = 0;
    return ruleT();


    /*function indentLog(string) {

    // String doesn't have a repeat method.  (Seriously!?)
            var spaces = "";
            for (var i=0; i<indent; i++)
                spaces += " ";

            console.log(spaces + string);
        }*/

    function getContext(flank) {
        var strIdx = tokenList[idx][2];
        var startIdx = strIdx >= flank ? strIdx-flank : 0;
        var stopIdx = newick.length - strIdx >= flank ? strIdx + flank : newick.length;

        return {
            left: newick.slice(startIdx, strIdx),
            at: newick[strIdx],
            right: newick.slice(strIdx+1, stopIdx)
        };
    }


    function acceptToken(token, mandatory) {
        if (idx<tokenList.length && tokenList[idx][0] === token) {
            idx += 1;
            return true;
        } else {
            if (mandatory)
                if (idx<tokenList.length) {
                    throw new ParseException("Expected token <b>" + token +
                                             "</b> but found <b>" + tokenList[idx][0] +
                                             "</b> (" +
                                             tokenList[idx][1] + ") at string position <b>" +
                                             tokenList[idx][2] + "</b>.",
                                             getContext(15));
                } else {
                    throw new ParseException("Newick string terminated early. Expected token " + token + ".");
                }
            else
                return false;
        }
    }

    // T -> N;
    function ruleT() {
        var node = ruleN(undefined);

        if (!acceptToken("SEMI", false) && acceptToken("COMMA", false))
            throw new ParseException("Tree/network with multiple roots found.");

        return node;
    }

    // N -> CLHAB
    function ruleN(parent) {
        var node = new Node(thisNodeID++);
        if (parent !== undefined)
            parent.addChild(node);

        ruleC(node);
        ruleL(node);
        ruleH(node);
        ruleA(node);
        ruleB(node);

        return node;
    }

    // C -> (NM)|eps
    function ruleC(node) {
        if (acceptToken("OPENP", false)) {

            //indentLog("(");
            //indent += 1;

            ruleN(node);
            ruleM(node);
            acceptToken("CLOSEP", true);

            //indent -= 1;
            //indentLog(")");
        }
    }

    // M -> ,NM|eps
    function ruleM(node) {
        if (acceptToken("COMMA", false)) {

            //indentLog(",");

            ruleN(node);
            ruleM(node);
        }
    }

    // L -> lab|num
    function ruleL(node) {
        if (acceptToken("STRING", false)) {
            node.label = tokenList[idx-1][1];

            //indentLog(node.label);
        }
    }

    // H -> #hybridID|eps
    function ruleH(node) {
        if (acceptToken("HASH", false)) {
            acceptToken("STRING", true);
            node.hybridID = tokenList[idx-1][1];
        }
    }

    // A -> [&DE]|eps
    function ruleA(node) {
        if (acceptToken("OPENA", false)) {
            ruleD(node);
            ruleE(node);
            acceptToken("CLOSEA", true);
        }
    }

    // D -> lab=Q|eps
    function ruleD(node) {
        acceptToken("STRING", true);
        var key = tokenList[idx-1][1];
        acceptToken("EQ", true);
        var value = ruleQ();

        node.annotation[key] = value;

        //indentLog(key + "=" + value);
    }

    // Q -> num|string|QW|eps
    function ruleQ() {
        if (acceptToken("STRING", false))
            value = tokenList[idx-1][1];

        else if (acceptToken("OPENV", false)) {
            value = [ruleQ()].concat(ruleW());
            acceptToken("CLOSEV", true);
        } else
            value = null;

        return value;
    }

    // W -> ,QW|eps
    function ruleW() {
        if (acceptToken("COMMA", false)) {
            return [ruleQ()].concat(ruleW());
        }
        else
            return [];
    }

    // E -> ,DE|eps
    function ruleE(node) {
        if (acceptToken("COMMA", false)) {
            ruleD(node);
            ruleE(node);
        }
    }

    // B -> :num R A | eps
    function ruleB(node) {
        if (acceptToken("COLON", false)) {
            acceptToken("STRING", true);

            var length = Number(tokenList[idx-1][1]);
            if (String(length) !== "NaN")
                node.branchLength = length;
            else
                throw new ParseException("Expected numerical branch length. Found " +
                    tokenList[idx-1][1] + " instead.");

            //indentLog(":"+tokenList[idx-1][1]);

            ruleR();

            ruleA(node);
        }
    }

    // R -> :num R | eps
    // (This rule strips out additional colon-delimited attributes from
    // phylonet output.)
    function ruleR() {
        if (acceptToken("COLON", false)) {
            acceptToken("STRING", false);

            ruleR();
        }
    }
};
