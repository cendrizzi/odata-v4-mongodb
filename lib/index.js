"use strict";
var visitor_1 = require("./visitor");
var visitor_aggregation_1 = require("./visitor-aggregation");
var odata_v4_parser_1 = require("odata-v4-parser");
function createQuery(odataQuery) {
    var ast = (typeof odataQuery == "string" ? odata_v4_parser_1.query(odataQuery) : odataQuery);
    // console.log('ast', JSON.stringify(ast, null, 4));
    // console.log('createQuery', odataQuery);
    var visitObj = new visitor_1.Visitor().Visit(ast);
    // console.log('visitObj', visitObj);
    return visitObj;
}
exports.createQuery = createQuery;
function createFilter(odataFilter) {
    var context = {
        query: {},
        aggMatchStage: {},
        aggAddFieldsStage: {}
    };
    var ast = (typeof odataFilter == "string" ? odata_v4_parser_1.filter(odataFilter) : odataFilter);
    console.log('ast', JSON.stringify(ast, null, 4));
    new visitor_1.Visitor().Visit(ast, context);
    console.log('context', JSON.stringify(context, null, 4));
    return context.query;
}
exports.createFilter = createFilter;
function createQueryAggregation(odataQuery) {
    var ast = (typeof odataQuery == "string" ? odata_v4_parser_1.query(odataQuery) : odataQuery);
    // console.log('ast', JSON.stringify(ast, null, 4));
    // console.log('createQuery', odataQuery);
    var visitObj = new visitor_aggregation_1.VisitorAggregation().Visit(ast);
    // console.log('visitObj', visitObj);
    return visitObj;
}
exports.createQueryAggregation = createQueryAggregation;
function createFilterAggregation(odataFilter) {
    var context = {
        query: {},
        aggMatchStage: {},
        aggAddFieldsStage: {}
    };
    var ast = (typeof odataFilter == "string" ? odata_v4_parser_1.filter(odataFilter) : odataFilter);
    console.log('ast', JSON.stringify(ast, null, 4));
    new visitor_aggregation_1.VisitorAggregation().Visit(ast, context);
    console.log('context', JSON.stringify(context, null, 4));
    return context.query;
}
exports.createFilterAggregation = createFilterAggregation;
