import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import TransactionService from '../../services/TransactionService';

class TransactionController {
    getTransactions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { rider }: any = req;

            const transactions =
                await TransactionService.getTransactionsByRider(rider.userId);
            // console.log(transactions);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Transactions Fetched successfully',
                data: transactions
            });
        }
    );

    getTransactionDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { rider }: any = req;
            const { transactionId } = req.params;

            const transaction = await TransactionService.getTransactionById(
                transactionId
            );

            if (!transaction || transaction.userId.toString() !== rider.userId.toString()) {
                res.status(STATUS.NOT_FOUND).send({
                    success: false,
                    message: 'Transaction not found'
                });
                return;
            }

            res.status(STATUS.OK).send({
                success: true,
                message: 'Transaction Fetched successfully',
                data: transaction
            });
        }
    );
}

export default new TransactionController();
