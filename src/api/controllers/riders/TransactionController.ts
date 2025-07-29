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
                await TransactionService.getTransactionsByRider(rider.id);
            // console.log(transactions);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Transactions Fetchd successfully',
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
            // console.log(transaction);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Transaction Fetchd successfully',
                data: transaction
            });
        }
    );
}

export default new TransactionController();
