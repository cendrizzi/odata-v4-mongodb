"use strict";
var odata_v4_literal_1 = require("odata-v4-literal");
var Visitor = (function () {
    function Visitor() {
        this.query = {};
        this.sort = {};
        this.projection = {};
        this.includes = [];
        this.aggAddFieldsStage = {}; // $addFields:{}
        this.aggProjectStage = {}; // $project:{}
        this.aggMatchStage = {}; // $match:{}
        this.aggSkipStage = {}; // $skip:{}
        this.aggLimitStage = {}; // $limit:{}
        this.aggSortStage = {}; // $sort:{}
        var _ast;
        Object.defineProperty(this, "ast", {
            get: function () { return _ast; },
            set: function (v) { _ast = v; },
            enumerable: false
        });
    }
    Visitor.prototype.Visit = function (node, context) {
        this.ast = this.ast || node;
        context = context || {};
        if (node) {
            var visitor = this[("Visit" + node.type)];
            if (visitor)
                visitor.call(this, node, context);
        }
        return this;
    };
    Visitor.prototype.VisitODataUri = function (node, context) {
        this.Visit(node.value.resource, context);
        this.Visit(node.value.query, context);
    };
    Visitor.prototype.VisitEntitySetName = function (node, context) {
        this.collection = node.value.name;
    };
    Visitor.prototype.VisitExpand = function (node, context) {
        var _this = this;
        var innerContexts = {};
        node.value.items.forEach(function (item) {
            var expandPath = item.value.path.raw;
            var innerVisitor = _this.includes.filter(function (v) { return v.navigationProperty === expandPath; })[0];
            if (!innerVisitor) {
                innerVisitor = new Visitor();
                innerContexts[expandPath] = {
                    query: {},
                    sort: {},
                    projection: {},
                    options: {}
                };
                _this.includes.push(innerVisitor);
            }
            var innerContext = innerContexts[expandPath] || {};
            innerVisitor.Visit(item, innerContext);
            innerVisitor.query = innerContext.query || innerVisitor.query || {};
            innerVisitor.sort = innerContext.sort || innerVisitor.sort;
            innerVisitor.projection = innerContext.projection || innerVisitor.projection;
        });
    };
    Visitor.prototype.VisitExpandItem = function (node, context) {
        var _this = this;
        this.Visit(node.value.path, context);
        node.value.options && node.value.options.forEach(function (item) { return _this.Visit(item, context); });
    };
    Visitor.prototype.VisitExpandPath = function (node, context) {
        this.navigationProperty = node.raw;
    };
    Visitor.prototype.VisitQueryOptions = function (node, context) {
        var _this = this;
        console.log("HERE");
        var self = this;
        context.options = {};
        node.value.options.forEach(function (option) { return _this.Visit(option, context); });
        this.query = context.query || {};
        this.aggMatchStage = context.aggMatchStage || {};
        this.aggAddFieldsStage = context.aggAddFieldsStage || {};
        delete context.query;
        delete context.aggMatchStage;
        delete context.aggAddFieldsStage;
        this.sort = context.sort;
        delete context.sort;
    };
    Visitor.prototype.VisitInlineCount = function (node, context) {
        this.inlinecount = odata_v4_literal_1.Literal.convert(node.value.value, node.value.raw);
    };
    Visitor.prototype.VisitFilter = function (node, context) {
        context.query = {};
        context.aggMatchStage = {};
        context.aggAddFieldsStage = {};
        this.Visit(node.value, context);
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitOrderBy = function (node, context) {
        var _this = this;
        context.sort = {};
        context.aggSortStage = {};
        node.value.items.forEach(function (item) { return _this.Visit(item, context); });
    };
    Visitor.prototype.VisitOrderByItem = function (node, context) {
        this.Visit(node.value.expr, context);
        if (context.identifier) {
            context.sort[context.identifier] = node.value.direction;
            context.aggSortStage[context.identifier] = node.value.direction;
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitSkip = function (node, context) {
        this.skip = +node.value.raw;
        this.aggSkipStage = +node.value.raw;
    };
    Visitor.prototype.VisitTop = function (node, context) {
        this.limit = +node.value.raw;
        this.aggLimitStage = +node.value.raw;
    };
    Visitor.prototype.VisitSelect = function (node, context) {
        var _this = this;
        context.projection = {};
        context.aggProjectStage = {};
        node.value.items.forEach(function (item) { return _this.Visit(item, context); });
        this.projection = context.projection;
        delete context.projection;
    };
    Visitor.prototype.VisitSelectItem = function (node, context) {
        context.projection[node.raw.replace(/\//g, '.')] = 1;
        context.aggProjectStage[node.raw.replace(/\//g, '.')] = 1;
    };
    Visitor.prototype.VisitAndExpression = function (node, context) {
        // console.log('and expression', node);
        var query = context.query;
        var leftQuery = {};
        context.query = leftQuery;
        this.Visit(node.value.left, context);
        var rightQuery = {};
        context.query = rightQuery;
        this.Visit(node.value.right, context);
        if (Object.keys(leftQuery).length > 0 && Object.keys(rightQuery).length > 0) {
            query.$and = [leftQuery, rightQuery];
        }
        context.query = query;
        context.aggMatchStage = query;
    };
    Visitor.prototype.VisitOrExpression = function (node, context) {
        // console.log('or expression', node);
        var query = context.query;
        var leftQuery = {};
        context.query = leftQuery;
        this.Visit(node.value.left, context);
        var rightQuery = {};
        context.query = rightQuery;
        this.Visit(node.value.right, context);
        if (Object.keys(leftQuery).length > 0 && Object.keys(rightQuery).length > 0) {
            query.$or = [leftQuery, rightQuery];
        }
        context.query = query;
        context.aggMatchStage = query;
    };
    Visitor.prototype.VisitBoolParenExpression = function (node, context) {
        this.Visit(node.value, context);
    };
    Visitor.prototype.VisitParenExpression = function (node, context) {
        this.Visit(node.value, context);
    };
    Visitor.prototype.VisitCommonExpression = function (node, context) {
        this.Visit(node.value, context);
    };
    Visitor.prototype.VisitFirstMemberExpression = function (node, context) {
        this.Visit(node.value, context);
    };
    Visitor.prototype.VisitMemberExpression = function (node, context) {
        this.Visit(node.value, context);
    };
    Visitor.prototype.VisitPropertyPathExpression = function (node, context) {
        if (node.value.current && node.value.next) {
            this.Visit(node.value.current, context);
            if (context.identifier)
                context.identifier += ".";
            this.Visit(node.value.next, context);
        }
        else
            this.Visit(node.value, context);
    };
    Visitor.prototype.VisitSingleNavigationExpression = function (node, context) {
        if (node.value.current && node.value.next) {
            this.Visit(node.value.current, context);
            this.Visit(node.value.next, context);
        }
        else
            this.Visit(node.value, context);
    };
    Visitor.prototype.VisitODataIdentifier = function (node, context) {
        console.log(context.identifier + ' ' + node.value.name);
        var prefx = (context && context.identifier && context.identifier.indexOf(".") != -1) ? context.identifier : '';
        context.identifier = prefx + node.value.name;
    };
    Visitor.prototype.VisitEqualsExpression = function (node, context) {
        console.log('EQUALS');
        this.Visit(node.value.left, context);
        this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = context.literal;
            context.aggMatchStage[context.identifier] = context.literal;
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitNotEqualsExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = { $ne: context.literal };
            context.aggMatchStage[context.identifier] = { $ne: context.literal };
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitLesserThanExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = { $lt: context.literal };
            context.aggMatchStage[context.identifier] = { $lt: context.literal };
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitLesserOrEqualsExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = { $lte: context.literal };
            context.aggMatchStage[context.identifier] = { $lte: context.literal };
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitGreaterThanExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = { $gt: context.literal };
            context.aggMatchStage[context.identifier] = { $gt: context.literal };
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitGreaterOrEqualsExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        if (context.identifier) {
            context.query[context.identifier] = { $gte: context.literal };
            context.aggMatchStage[context.identifier] = { $gte: context.literal };
        }
        delete context.identifier;
        delete context.literal;
    };
    Visitor.prototype.VisitLiteral = function (node, context) {
        context.literal = odata_v4_literal_1.Literal.convert(node.value, node.raw);
    };
    Visitor.prototype.VisitCommonArithmetic = function (node, context, arithmetic) {
        console.log(arithmetic, JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
        var rightContext = JSON.parse(JSON.stringify(context));
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, rightContext);
        console.log(arithmetic, JSON.stringify(context, null, 4), '\n', JSON.stringify(rightContext, null, 4));
        var leftParam = (context.identifier) ? '$' + context.identifier : context.literal;
        var rightParam = (rightContext.identifier) ? '$' + rightContext.identifier : rightContext.literal;
        var LeftTitle = (context.identifier) ? context.identifier : context.literal;
        var rightTitle = (rightContext.identifier) ? rightContext.identifier : rightContext.literal;
        var newIdentifier = LeftTitle + '_' + rightTitle + '_' + arithmetic;
        context.aggAddFieldsStage[newIdentifier] = {};
        context.aggAddFieldsStage[newIdentifier]['$' + arithmetic] = [leftParam, rightParam];
        context.identifier = newIdentifier;
    };
    Visitor.prototype.VisitAddExpression = function (node, context) {
        this.VisitCommonArithmetic(node, context, 'add');
    };
    Visitor.prototype.VisitSubExpression = function (node, context) {
        this.VisitCommonArithmetic(node, context, 'subtract');
    };
    Visitor.prototype.VisitMulExpression = function (node, context) {
        this.VisitCommonArithmetic(node, context, 'multiply');
    };
    Visitor.prototype.VisitDivExpression = function (node, context) {
        this.VisitCommonArithmetic(node, context, 'divide');
    };
    Visitor.prototype.VisitModExpression = function (node, context) {
        this.VisitCommonArithmetic(node, context, 'mod');
    };
    Visitor.prototype.VisitMethodCallExpression = function (node, context) {
        var _this = this;
        var method = node.value.method;
        console.log('\n\nmethod', method);
        var params = (node.value.parameters || []).forEach(function (p) { return _this.Visit(p, context); });
        if (context.identifier) {
            console.log('\n\nmethod', method);
            switch (method) {
                case "contains":
                    context.query[context.identifier] = new RegExp(context.literal, "gi");
                    context.aggMatchStage[context.identifier] = new RegExp(context.literal, "gi");
                    console.log('context', context);
                    break;
                case "endswith":
                    context.query[context.identifier] = new RegExp(context.literal + "$", "gi");
                    context.aggMatchStage[context.identifier] = new RegExp(context.literal + "$", "gi");
                    break;
                case "startswith":
                    context.query[context.identifier] = new RegExp("^" + context.literal, "gi");
                    context.aggMatchStage[context.identifier] = new RegExp("^" + context.literal, "gi");
                    break;
                case "length":
                    // console.log('LENGTH!!', context, node);
                    var newIdentifier = context.identifier + '_len';
                    context.aggAddFieldsStage[newIdentifier] = { $strLenCP: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "indexof":
                    // console.log('INDEX OF!!', context, node);
                    var newIdentifier = context.identifier + '_io';
                    context.aggAddFieldsStage[newIdentifier] = { $indexOfCP: ['$' + context.identifier, context.literal] };
                    context.identifier = newIdentifier;
                    break;
                case "substring":
                    // console.log('SUBSTRING', context, node);
                    var newIdentifier = context.identifier + '_sub';
                    context.aggAddFieldsStage[newIdentifier] = { $substrBytes: ['$' + context.identifier, context.literal] };
                    context.identifier = newIdentifier;
                    break;
                case "substringof":
                    console.log('no idea');
                    break;
                case "concat":
                    var newIdentifier = context.identifier + '';
                    context.aggAddFieldsStage[newIdentifier] = { $concat: ['$' + context.identifier, context.literal] };
                    context.identifier = newIdentifier;
                    break;
                case "round":
                    console.log('Round yo');
                    break;
                case "tolower":
                    var newIdentifier = context.identifier + '_lc';
                    context.aggAddFieldsStage[newIdentifier] = { $tolower: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "toupper":
                    var newIdentifier = context.identifier + '_uc';
                    context.aggAddFieldsStage[newIdentifier] = { $toUpper: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "floor":
                    var newIdentifier = context.identifier + '_fr';
                    context.aggAddFieldsStage[newIdentifier] = { $floor: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "ceiling":
                    var newIdentifier = context.identifier + '_cl';
                    context.aggAddFieldsStage[newIdentifier] = { $ceil: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "year":
                    var newIdentifier = context.identifier + '_yr';
                    context.aggAddFieldsStage[newIdentifier] = { $year: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "month":
                    var newIdentifier = context.identifier + '_mo';
                    context.aggAddFieldsStage[newIdentifier] = { $month: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "day":
                    var newIdentifier = context.identifier + '_dy';
                    context.aggAddFieldsStage[newIdentifier] = { $day: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "hour":
                    var newIdentifier = context.identifier + '_hr';
                    context.aggAddFieldsStage[newIdentifier] = { $hour: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "minute":
                    var newIdentifier = context.identifier + '_mn';
                    context.aggAddFieldsStage[newIdentifier] = { $minute: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "second":
                    var newIdentifier = context.identifier + '_sc';
                    context.aggAddFieldsStage[newIdentifier] = { $second: '$' + context.identifier };
                    context.identifier = newIdentifier;
                    break;
                case "now":
                    console.log('now', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
                    context.literal = new Date();
                    break;
                case "mindatetime":
                    console.log('mindatetime', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
                    context.literal = new Date(-8640000000000000);
                    break;
                case "maxdatetime":
                    console.log('maxdatetime', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
                    context.literal = new Date(8640000000000000);
                    break;
                case "trim":
                    console.log('Trim, not sure how...');
                    break;
            }
        }
    };
    return Visitor;
}());
exports.Visitor = Visitor;
