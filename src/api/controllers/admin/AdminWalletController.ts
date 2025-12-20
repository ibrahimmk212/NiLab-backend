import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletService from '../../services/WalletService';

class AdminWalletController {
    getWallet = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const wallet = await WalletService.getWallet(req.params.id);
                res.status(200).send({
                    message: 'Users fetched successfully',
                    ...wallet
                });
            } catch (error) {
                next(error);
            }
        }
    );

    fundUserAvailableWallet = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { amount, owner, role } = req.body;
            try {
                const wallet = await WalletService.adminFundAvailableWallet({
                    amount,
                    owner,
                    role
                });
                res.status(200).send({
                    message: 'Users fetched successfully',
                    ...wallet
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

export default new AdminWalletController();
