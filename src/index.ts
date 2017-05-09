import { Visitor } from "./visitor"
import { VisitorAggregation } from "./visitor-aggregation"
import { filter, query } from "odata-v4-parser"
import { Token } from "odata-v4-parser/lib/lexer"

/**
 * Creates MongoDB collection, query, projection, sort, skip and limit from an OData URI string
 * @param {string} queryString - An OData query string
 * @return {Visitor} Visitor instance object with collection, query, projection, sort, skip and limit
 * @example
 * const query = createQuery("$filter=Size eq 4&$orderby=Orders&$skip=10&$top=5");
 * collections[query.collection].find(query.query).project(query.projection).sort(query.sort).skip(query.skip).limit(query.limit).toArray(function(err, data){ ... });
 */
export function createQuery(odataQuery:string);
export function createQuery(odataQuery:Token);
export function createQuery(odataQuery:string | Token){
    let ast:Token = <Token>(typeof odataQuery == "string" ? query(<string>odataQuery) : odataQuery);
    // console.log('ast', JSON.stringify(ast, null, 4));
    // console.log('createQuery', odataQuery);
    let visitObj =  new Visitor().Visit(ast);
    // console.log('visitObj', visitObj);
    return visitObj;
}

/**
 * Creates a MongoDB query object from an OData filter expression string
 * @param {string} odataFilter - A filter expression in OData $filter format
 * @return {Object}  MongoDB query object
 * @example
 * const filter = createFilter("Size eq 4 and Age gt 18");
 * collection.find(filter, function(err, data){ ... });
 */
export function createFilter(odataFilter:string);
export function createFilter(odataFilter:Token);
export function createFilter(odataFilter:string | Token):Object{
    let context = {
        query: {},
        aggMatchStage: {},
        aggAddFieldsStage: {}
    };
    let ast:Token = <Token>(typeof odataFilter == "string" ? filter(<string>odataFilter) : odataFilter);
    console.log('ast', JSON.stringify(ast, null, 4));
    new Visitor().Visit(ast, context);
    console.log('context', JSON.stringify(context, null, 4));
    return context.query;
}

/**
 * Creates MongoDB collection, query, projection, sort, skip and limit from an OData URI string
 * @param {string} queryString - An OData query string
 * @return {Visitor} Visitor instance object with collection, query, projection, sort, skip and limit
 * @example
 * const query = createQuery("$filter=Size eq 4&$orderby=Orders&$skip=10&$top=5");
 * collections[query.collection].find(query.query).project(query.projection).sort(query.sort).skip(query.skip).limit(query.limit).toArray(function(err, data){ ... });
 */
export function createQueryAggregation(odataQuery:string);
export function createQueryAggregation(odataQuery:Token);
export function createQueryAggregation(odataQuery:string | Token){
    let ast:Token = <Token>(typeof odataQuery == "string" ? query(<string>odataQuery) : odataQuery);
    // console.log('ast', JSON.stringify(ast, null, 4));
    // console.log('createQuery', odataQuery);
    let visitObj =  new VisitorAggregation().Visit(ast);
    // console.log('visitObj', visitObj);
    return visitObj;
}

/**
 * Creates a MongoDB query object from an OData filter expression string
 * @param {string} odataFilter - A filter expression in OData $filter format
 * @return {Object}  MongoDB query object
 * @example
 * const filter = createFilter("Size eq 4 and Age gt 18");
 * collection.find(filter, function(err, data){ ... });
 */
export function createFilterAggregation(odataFilter:string);
export function createFilterAggregation(odataFilter:Token);
export function createFilterAggregation(odataFilter:string | Token):Object{
    let context = {
        query: {},
        aggMatchStage: {},
        aggAddFieldsStage: {}
    };
    let ast:Token = <Token>(typeof odataFilter == "string" ? filter(<string>odataFilter) : odataFilter);
    console.log('ast', JSON.stringify(ast, null, 4));
    new VisitorAggregation().Visit(ast, context);
    console.log('context', JSON.stringify(context, null, 4));
    return context.query;
}