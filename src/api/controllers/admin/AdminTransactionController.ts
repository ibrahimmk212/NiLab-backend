import { NextFunction, Request, Response } from 'express';
import TransactionService from '../../services/TransactionService';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class AdminTransactionController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const {
                page,
                limit,
                search,
                status,
                type,
                category,
                user,
                reference,
                amount,
                sortBy,
                sortOrder,
                startDate,
                endDate
            } = req.query;

            const transaction = await TransactionService.getAll({
                page,
                limit,
                search,
                status,
                type,
                category,
                user,
                reference,
                amount,
                sortBy,
                sortOrder,
                startDate,
                endDate
            });

            res.status(STATUS.OK).send({
                success: true,
                message: 'Transactions fetched successfully',
                ...transaction
            });
        }
    );
    getByVendor = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const transaction =
                await TransactionService.getTransactionsByVendor(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Transactions fetched successfully',
                data: transaction
            });
        }
    );
    getSingle = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const order = await TransactionService.getTransactionById(id);
            if (!order) throw new Error('Transaction not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Transaction fetched successfully',
                data: order
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await TransactionService.updateTransaction(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        }
    );
    updateStatus = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await TransactionService.updateTransaction(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        }
    );
}

export default new AdminTransactionController();
