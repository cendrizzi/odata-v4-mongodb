import { Token } from "odata-v4-parser/lib/lexer";
import { Literal } from "odata-v4-literal";

export class Visitor{
	query: any
	sort: any
	skip: number
	limit: number
	projection: any
	collection: string
	navigationProperty: string
	includes:Visitor[]
	inlinecount: boolean
	ast:Token

	aggAddFieldsStage: any
	aggProjectStage: any
	aggMatchStage: any
	aggSkipStage: any
	aggLimitStage: any
	aggSortStage: any


	constructor(){
		this.query = {};
		this.sort = {};
		this.projection = {};
		this.includes = [];

		this.aggAddFieldsStage = {}; // $addFields:{}
		this.aggProjectStage = {}; // $project:{}
		this.aggMatchStage = {}; // $match:{}
		this.aggSkipStage = {};  // $skip:{}
		this.aggLimitStage = {}; // $limit:{}
		this.aggSortStage = {};  // $sort:{}

		let _ast;
		Object.defineProperty(this, "ast", {
			get: () => { return _ast; },
			set: (v) => { _ast = v; },
			enumerable: false
		});
	}

	Visit(node:Token, context?:any){
		this.ast = this.ast || node;
		context = context || {};

		if (node){
			var visitor = this[`Visit${node.type}`];
			if (visitor) visitor.call(this, node, context);
		}

		return this;
	}

	protected VisitODataUri(node:Token, context:any){
		this.Visit(node.value.resource, context);
		this.Visit(node.value.query, context);
	}

	protected VisitEntitySetName(node:Token, context:any){
		this.collection = node.value.name;
	}

	protected VisitExpand(node: Token, context: any) {
        var innerContexts:any = {};
        node.value.items.forEach((item) => {
            var expandPath = item.value.path.raw;
            var innerVisitor = this.includes.filter(v => v.navigationProperty === expandPath)[0];
            if (!innerVisitor){
                innerVisitor = new Visitor();

                innerContexts[expandPath] = {
                    query: {},
                    sort: {},
                    projection: {},
                    options: {}
                };

                this.includes.push(innerVisitor);
            }

            let innerContext:any = innerContexts[expandPath] || {};
            innerVisitor.Visit(item, innerContext);

            innerVisitor.query = innerContext.query || innerVisitor.query || {};
            innerVisitor.sort = innerContext.sort || innerVisitor.sort;
            innerVisitor.projection = innerContext.projection || innerVisitor.projection;
        });
    }

    protected VisitExpandItem(node: Token, context: any) {
        this.Visit(node.value.path, context);
        node.value.options && node.value.options.forEach((item) => this.Visit(item, context));
    }

    protected VisitExpandPath(node: Token, context: any) {
        this.navigationProperty = node.raw;
    }

	protected VisitQueryOptions(node:Token, context:any){
		console.log("HERE");
		var self = this;

		context.options = {};
		node.value.options.forEach((option) => this.Visit(option, context));

		this.query = context.query || {};
		this.aggMatchStage = context.aggMatchStage || {};
		this.aggAddFieldsStage = context.aggAddFieldsStage || {};
		delete context.query;
		delete context.aggMatchStage;
		delete context.aggAddFieldsStage;

		this.sort = context.sort;
		delete context.sort;
	}

	protected VisitInlineCount(node:Token, context:any){
		this.inlinecount = Literal.convert(node.value.value, node.value.raw);
	}

	protected VisitFilter(node:Token, context:any){
		context.query = {};
		context.aggMatchStage = {};
		context.aggAddFieldsStage = {};
		this.Visit(node.value, context);
		delete context.identifier;
		delete context.literal;
	}

	protected VisitOrderBy(node:Token, context:any){
		context.sort = {};
		context.aggSortStage = {};
		node.value.items.forEach((item) => this.Visit(item, context));
	}

	protected VisitOrderByItem(node:Token, context:any){
		this.Visit(node.value.expr, context);
		if (context.identifier) {
			context.sort[context.identifier] = node.value.direction;
			context.aggSortStage[context.identifier] = node.value.direction;
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitSkip(node:Token, context:any){
		this.skip = +node.value.raw;
		this.aggSkipStage = +node.value.raw;
	}

	protected VisitTop(node:Token, context:any){
		this.limit = +node.value.raw;
		this.aggLimitStage = +node.value.raw;
	}

	protected VisitSelect(node:Token, context:any){
		context.projection = {};
		context.aggProjectStage = {};
		node.value.items.forEach((item) => this.Visit(item, context));

		this.projection = context.projection;
		delete context.projection;
	}

	protected VisitSelectItem(node:Token, context:any){
		context.projection[node.raw.replace(/\//g, '.')] = 1;
		context.aggProjectStage[node.raw.replace(/\//g, '.')] = 1;
	}

	protected VisitAndExpression(node:Token, context:any){
		// console.log('and expression', node);
		var query = context.query;
		var leftQuery = {};
		context.query = leftQuery;
		this.Visit(node.value.left, context);

		var rightQuery = {};
		context.query = rightQuery;
		this.Visit(node.value.right, context);

		if (Object.keys(leftQuery).length > 0 && Object.keys(rightQuery).length > 0){
			query.$and = [leftQuery, rightQuery];
		}
		context.query = query;
		context.aggMatchStage = query;
	}

	protected VisitOrExpression(node:Token, context:any){
		// console.log('or expression', node);
		var query = context.query;
		var leftQuery = {};
		context.query = leftQuery;
		this.Visit(node.value.left, context);

		var rightQuery = {};
		context.query = rightQuery;
		this.Visit(node.value.right, context);

		if (Object.keys(leftQuery).length > 0 && Object.keys(rightQuery).length > 0){
			query.$or = [leftQuery, rightQuery];
		}
		context.query = query;
		context.aggMatchStage = query;
	}

	protected VisitBoolParenExpression(node:Token, context:any){
		this.Visit(node.value, context);
	}

	protected VisitParenExpression(node:Token, context:any){
		this.Visit(node.value, context);
	}

	protected VisitCommonExpression(node:Token, context:any){
		this.Visit(node.value, context);
	}

	protected VisitFirstMemberExpression(node:Token, context:any){
		this.Visit(node.value, context);
	}

	protected VisitMemberExpression(node:Token, context:any){
		this.Visit(node.value, context);
	}

	protected VisitPropertyPathExpression(node:Token, context:any){
		if (node.value.current && node.value.next){
			this.Visit(node.value.current, context);
			if (context.identifier) context.identifier += ".";
			this.Visit(node.value.next, context);
		}else this.Visit(node.value, context);
	}

	protected VisitSingleNavigationExpression(node:Token, context:any){
		if (node.value.current && node.value.next){
			this.Visit(node.value.current, context);
			this.Visit(node.value.next, context);
		}else this.Visit(node.value, context);
	}

	protected VisitODataIdentifier(node:Token, context:any){
		console.log(context.identifier + ' ' +  node.value.name);
		let prefx: string = (context && context.identifier && context.identifier.indexOf(".") != -1) ? context.identifier : '';
		context.identifier = prefx + node.value.name;
	}

	protected VisitEqualsExpression(node:Token, context:any){
		console.log('EQUALS');
		this.Visit(node.value.left, context);
		this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = context.literal;
			context.aggMatchStage[context.identifier] = context.literal;
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitNotEqualsExpression(node:Token, context:any){
		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = { $ne: context.literal };
			context.aggMatchStage[context.identifier] = { $ne: context.literal };
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitLesserThanExpression(node:Token, context:any){
		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = { $lt: context.literal };
			context.aggMatchStage[context.identifier] = { $lt: context.literal };
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitLesserOrEqualsExpression(node:Token, context:any){
		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = { $lte: context.literal };
			context.aggMatchStage[context.identifier] = { $lte: context.literal };
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitGreaterThanExpression(node:Token, context:any){
		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = { $gt: context.literal };
			context.aggMatchStage[context.identifier] = { $gt: context.literal };
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitGreaterOrEqualsExpression(node:Token, context:any){
		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, context);

		if (context.identifier) {
			context.query[context.identifier] = { $gte: context.literal };
			context.aggMatchStage[context.identifier] = { $gte: context.literal };
		}
		delete context.identifier;
		delete context.literal;
	}

	protected VisitLiteral(node:Token, context:any){
		context.literal = Literal.convert(node.value, node.raw);
	}



	protected VisitCommonArithmetic(node: Token, context: any, arithmetic: string){
		console.log(arithmetic, JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));

		var rightContext = JSON.parse(JSON.stringify(context));

		var left = this.Visit(node.value.left, context);
		var right = this.Visit(node.value.right, rightContext);

		console.log(arithmetic, JSON.stringify(context, null, 4), '\n', JSON.stringify(rightContext, null, 4));

		let leftParam: string = (context.identifier) ? '$'+context.identifier : context.literal
		let rightParam: string = (rightContext.identifier) ? '$'+rightContext.identifier : rightContext.literal

		let LeftTitle: string = (context.identifier) ? context.identifier : context.literal
		let rightTitle: string = (rightContext.identifier) ? rightContext.identifier : rightContext.literal

		let newIdentifier = LeftTitle+'_'+rightTitle+'_'+arithmetic;

		context.aggAddFieldsStage[newIdentifier] = {};
		context.aggAddFieldsStage[newIdentifier]['$'+arithmetic] = [leftParam, rightParam];
		context.identifier = newIdentifier;
	}

	protected VisitAddExpression(node: Token, context: any) {
		this.VisitCommonArithmetic(node, context, 'add');

	}

	protected VisitSubExpression(node: Token, context: any) {
		this.VisitCommonArithmetic(node, context, 'subtract');

	}
	protected VisitMulExpression(node: Token, context: any) {
		this.VisitCommonArithmetic(node, context, 'multiply');

	}
	protected VisitDivExpression(node: Token, context: any) {
		this.VisitCommonArithmetic(node, context, 'divide');

	}
	protected VisitModExpression(node: Token, context: any) {
		this.VisitCommonArithmetic(node, context, 'mod');

	}



	protected VisitMethodCallExpression(node:Token, context:any){
		var method = node.value.method;
		console.log('\n\nmethod', method);

		var params = (node.value.parameters || []).forEach(p => this.Visit(p, context));
		if (context.identifier){
			console.log('\n\nmethod', method);
			switch (method){
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
					var newIdentifier = context.identifier+'_len';
					context.aggAddFieldsStage[newIdentifier] = {$strLenCP: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "indexof":
					// console.log('INDEX OF!!', context, node);
					var newIdentifier = context.identifier+'_io';
					context.aggAddFieldsStage[newIdentifier] = {$indexOfCP: ['$'+context.identifier, context.literal]};
					context.identifier = newIdentifier;
					break;
				case "substring":
					// console.log('SUBSTRING', context, node);
					var newIdentifier = context.identifier+'_sub';
					context.aggAddFieldsStage[newIdentifier] = {$substrBytes: ['$'+context.identifier, context.literal]};
					context.identifier = newIdentifier;
					break;
				case "substringof":
					console.log('no idea');
					break;
				case "concat":
					var newIdentifier = context.identifier + '';
					context.aggAddFieldsStage[newIdentifier] = {$concat: ['$'+context.identifier, context.literal]};
					context.identifier = newIdentifier;
					break;
				case "round":
					console.log('Round yo');
					break;
				case "tolower":
					var newIdentifier = context.identifier + '_lc';
					context.aggAddFieldsStage[newIdentifier] = {$tolower: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "toupper":
					var newIdentifier = context.identifier + '_uc';
					context.aggAddFieldsStage[newIdentifier] = {$toUpper: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "floor":
					var newIdentifier = context.identifier + '_fr';
					context.aggAddFieldsStage[newIdentifier] = {$floor: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "ceiling":
					var newIdentifier = context.identifier + '_cl';
					context.aggAddFieldsStage[newIdentifier] = {$ceil: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "year":
					var newIdentifier = context.identifier + '_yr';
					context.aggAddFieldsStage[newIdentifier] = {$year: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "month":
					var newIdentifier = context.identifier + '_mo';
					context.aggAddFieldsStage[newIdentifier] = {$month: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "day":
					var newIdentifier = context.identifier + '_dy';
					context.aggAddFieldsStage[newIdentifier] = {$day: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "hour":
					var newIdentifier = context.identifier + '_hr';
					context.aggAddFieldsStage[newIdentifier] = {$hour: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "minute":
					var newIdentifier = context.identifier + '_mn';
					context.aggAddFieldsStage[newIdentifier] = {$minute: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "second":
					var newIdentifier = context.identifier + '_sc';
					context.aggAddFieldsStage[newIdentifier] = {$second: '$'+context.identifier};
					context.identifier = newIdentifier;
					break;
				case "now":
					console.log('now', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
					context.literal = new Date()

					break;
				case "mindatetime":
					console.log('mindatetime', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
					context.literal = new Date(-8640000000000000)

					break;
				case "maxdatetime":
					console.log('maxdatetime', JSON.stringify(context, null, 4), '\n', JSON.stringify(node, null, 4));
					context.literal = new Date(8640000000000000)

					break;
				case "trim":
					console.log('Trim, not sure how...');
					break;

			}
		}
	}

}
