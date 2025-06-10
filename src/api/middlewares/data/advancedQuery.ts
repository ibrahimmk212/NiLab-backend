import { Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';

interface QueryOptions {
    select?: string;
    sort?: string;
    page?: string;
    limit?: string;
}

interface PaginationResult {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
}

const advancedQuery =
    (model: Model<Document> | any, populate?: string) =>
    async (req: Request, res: Response | any, next: NextFunction) => {
        let query;

        // Copy request query
        const reqQuery: QueryOptions = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over remove fields and delete them from reqQuery
        removeFields.forEach(
            (param) => delete reqQuery[param as keyof QueryOptions]
        );

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, $lt, etc)
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`
        );

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
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const total = await model.countDocuments();
        const page = parseInt(req.query.page?.toString() || '1', 10);
        const limit = parseInt(req.query.limit?.toString() || `${total}`, 10);
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
        const pagination: PaginationResult = {};
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

export const pagination =
    (model: Model<Document> | any, populate?: string) =>
    async (req: Request, res: Response | any, next: NextFunction) => {
        let query;

        // Copy request query8
        const reqQuery: QueryOptions = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over remove fields and delete them from reqQuery
        removeFields.forEach(
            (param) => delete reqQuery[param as keyof QueryOptions]
        );

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, $lt, etc)
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`
        );

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
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const total = await model.countDocuments();
        const page = parseInt(req.query.page?.toString() || '1', 10);
        const limit = parseInt(req.query.limit?.toString() || `${total}`, 10);
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
        const pagination: PaginationResult = {};
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
export default advancedQuery;
