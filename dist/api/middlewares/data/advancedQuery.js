"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = void 0;
const advancedQuery = (model, populate) => async (req, res, next) => {
    var _a, _b;
    let query;
    // Copy request query
    const reqQuery = Object.assign({}, req.query);
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    // Create operators ($gt, $gte, $lt, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    // Finding resource
    query = model.find(JSON.parse(queryStr));
    // Select fields
    if (req.query.select) {
        const fields = req.query.select.toString().split(',').join(' ');
        query = query.select(fields);
    }
    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.toString().split(',').join(' ');
        query = query.sort(sortBy);
    }
    else {
        query = query.sort('-createdAt');
    }
    // Pagination
    const total = await model.countDocuments();
    const page = parseInt(((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || '1', 10);
    const limit = parseInt(((_b = req.query.limit) === null || _b === void 0 ? void 0 : _b.toString()) || `${total}`, 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    query = query.skip(startIndex).limit(limit);
    // Populate
    if (populate) {
        query = query.populate(populate);
    }
    // Executing query
    const results = await query;
    // Pagination results
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };
    next();
};
const pagination = (model, populate) => async (req, res, next) => {
    var _a, _b;
    let query;
    // Copy request query8
    const reqQuery = Object.assign({}, req.query);
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    // Create operators ($gt, $gte, $lt, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    // Finding resource
    query = model.find(JSON.parse(queryStr));
    // Select fields
    if (req.query.select) {
        const fields = req.query.select.toString().split(',').join(' ');
        query = query.select(fields);
    }
    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.toString().split(',').join(' ');
        query = query.sort(sortBy);
    }
    else {
        query = query.sort('-createdAt');
    }
    // Pagination
    const total = await model.countDocuments();
    const page = parseInt(((_a = req.query.page) === null || _a === void 0 ? void 0 : _a.toString()) || '1', 10);
    const limit = parseInt(((_b = req.query.limit) === null || _b === void 0 ? void 0 : _b.toString()) || `${total}`, 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    query = query.skip(startIndex).limit(limit);
    // Populate
    if (populate) {
        query = query.populate(populate);
    }
    // Executing query
    const results = await query;
    // Pagination results
    const pagination = {};
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };
    next();
};
exports.pagination = pagination;
exports.default = advancedQuery;
