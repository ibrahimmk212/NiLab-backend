import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import TransactionModel from '../../models/Transaction';

class TransactionController {
    getTransactions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;

            // Build query scoped to the authenticated user
            const page = parseInt(req.query.page?.toString() || '1', 10);
            const limit = parseInt(req.query.limit?.toString() || '20', 10);
            const startIndex = (page - 1) * limit;

            const filter: any = { userId: userdata.id };

            // Optional category filter
            if (req.query.category) {
                filter.category = req.query.category;
            }
            // Optional type filter (CREDIT/DEBIT)
            if (req.query.type) {
                filter.type = req.query.type;
            }
            // Optional status filter
            if (req.query.status) {
                filter.status = req.query.status;
            }

            const total = await TransactionModel.countDocuments(filter);
            const transactions = await TransactionModel.find(filter)
                .sort(req.query.sort?.toString() || '-createdAt')
                .skip(startIndex)
                .limit(limit)
                .populate('order');

            const endIndex = page * limit;
            const pagination: any = {};
            if (endIndex < total) {
                pagination.next = { page: page + 1, limit };
            }
            if (startIndex > 0) {
                pagination.prev = { page: page - 1, limit };
            }

            res.status(STATUS.OK).json({
                success: true,
                count: transactions.length,
                total,
                pagination,
                data: transactions
            });
        }
    );

    createTransaction = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
        }
    );

    getTransactionDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
        }
    );

    updateTransaction = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
        }
    );
}

export default new TransactionController();
