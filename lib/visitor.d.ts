import { Token } from "odata-v4-parser/lib/lexer";
export declare class Visitor {
    query: any;
    sort: any;
    skip: number;
    limit: number;
    projection: any;
    collection: string;
    ast: Token;
    constructor();
    Visit(node: Token, context?: any): this;
    protected VisitODataUri(node: Token, context: any): void;
    protected VisitEntitySetName(node: Token, context: any): void;
    protected VisitQueryOptions(node: Token, context: any): void;
    protected VisitFilter(node: Token, context: any): void;
    protected VisitOrderBy(node: Token, context: any): void;
    protected VisitSkip(node: Token, context: any): void;
    protected VisitTop(node: Token, context: any): void;
    protected VisitOrderByItem(node: Token, context: any): void;
    protected VisitSelect(node: Token, context: any): void;
    protected VisitSelectItem(node: Token, context: any): void;
    protected VisitAndExpression(node: Token, context: any): void;
    protected VisitOrExpression(node: Token, context: any): void;
    protected VisitBoolParenExpression(node: Token, context: any): void;
    protected VisitCommonExpression(node: Token, context: any): void;
    protected VisitFirstMemberExpression(node: Token, context: any): void;
    protected VisitMemberExpression(node: Token, context: any): void;
    protected VisitPropertyPathExpression(node: Token, context: any): void;
    protected VisitSingleNavigationExpression(node: Token, context: any): void;
    protected VisitODataIdentifier(node: Token, context: any): void;
    protected VisitEqualsExpression(node: Token, context: any): void;
    protected VisitNotEqualsExpression(node: Token, context: any): void;
    protected VisitLesserThanExpression(node: Token, context: any): void;
    protected VisitLesserOrEqualsExpression(node: Token, context: any): void;
    protected VisitGreaterThanExpression(node: Token, context: any): void;
    protected VisitGreaterOrEqualsExpression(node: Token, context: any): void;
    protected VisitLiteral(node: Token, context: any): void;
    protected VisitMethodCallExpression(node: Token, context: any): void;
}
