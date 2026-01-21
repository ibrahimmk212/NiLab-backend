/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import WalletService from '../../services/WalletService';
import PaymentService from '../../services/PaymentService'; // Import PaymentService
import CollectionRepository from '../../repositories/CollectionRepository';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import TransactionRepository from '../../repositories/TransactionRepository';

class CustomerWalletController {
    // Existing: Get Balance
    getMyWallet = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.userdata;
            const user = await WalletService.getMyWallet({
                role: 'user',
                owner: id
            });
            res.status(STATUS.OK).send({
                message: 'Wallet details fetched successfully',
                data: user
            });
        }
    );

    /**
     * NEW: Initiate Monnify Top-up
     * POST /api/v1/wallets/fund
     */

    fundWallet = asyncHandler(async (req: any, res: Response) => {
        const { userdata } = req;
        const { amount } = req.body;

        // Call the logic we built in PaymentService
        const paymentResult = await PaymentService.initiateWalletTopup(
            amount,
            userdata
        );

        res.status(STATUS.OK).json({
            success: true,
            message: 'Funding link generated',
            data: paymentResult.payment
        });
    });

    /**
     * NEW: Get Transaction History
     * GET /api/v1/wallets/history
     */
    getHistory = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const { id } = req.userdata;

            // Fetch records from the Collection model we built
            const history = await TransactionRepository.findAll({
                userId: id
            });

            res.status(STATUS.OK).json({
                success: true,
                data: history
            });
        }
    );
}

export default new CustomerWalletController();
