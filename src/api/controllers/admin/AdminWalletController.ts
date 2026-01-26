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
                const wallet = await WalletService.getWallet(
                    req.params.walletId
                );
                res.status(200).send({
                    message: 'Wallet fetched successfully',
                    data: wallet
                });
            } catch (error) {
                next(error);
            }
        }
    );

    getAllWallets = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const wallet = await WalletService.getAllWallets(req.query);
                res.status(200).send({
                    message: 'Wallets fetched successfully',
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
            const { amount, owner, role, remark } = req.body;
            try {
                const wallet = await WalletService.adminFundAvailableWallet({
                    amount,
                    owner,
                    role,
                    remark
                });
                res.status(200).send(wallet);
            } catch (error) {
                next(error);
            }
        }
    );

    deductUserAvailableWallet = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { amount, owner, role, remark } = req.body;
            try {
                const wallet = await WalletService.adminDeductAvailableWallet({
                    amount,
                    owner,
                    role,
                    remark
                });
                res.status(200).send(wallet);
            } catch (error) {
                next(error);
            }
        }
    );

    mergeDuplicateWallets = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const wallet = await WalletService.mergeDuplicateWallets();
            res.status(200).send({
                message: 'Wallets merged successfully',
                data: wallet
            });
        }
    );

    deleteWallet = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const wallet = await WalletService.deleteWallet(
                req.params.walletId
            );
            res.status(200).send({
                message: 'Wallet deleted successfully',
                data: wallet
            });
        }
    );
}

export default new AdminWalletController();
