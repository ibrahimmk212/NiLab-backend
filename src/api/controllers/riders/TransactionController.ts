import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class TransactionController {
    getTransactions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { advancedResults }: any = res;

            res.status(STATUS.OK).json(advancedResults);
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
