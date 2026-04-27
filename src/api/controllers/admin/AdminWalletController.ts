import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import WalletService from '../../services/WalletService';
import VirtualAccountService from '../../services/VirtualAccountService';
import appConfig from '../../../config/appConfig';
import WalletModel from '../../models/Wallet';

class AdminWalletController {
    getMonnifyBalance = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                // Get the wallet account number from appConfig (or env)
                // Assuming it's in appConfig.monnify.walletAccountNumber
                const walletNumber = appConfig.monnify.walletAccountNumber;

                if (!walletNumber) {
                    throw new Error(
                        'Monnify Wallet Account Number not configured'
                    );
                }

                const balance = await WalletService.getSystemWalletBalance(
                    walletNumber
                );

                res.status(200).send(balance);
            } catch (error) {
                next(error);
            }
        }
    );

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

    getSystemWallet = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            try {
                const { default: WalletModel } = await import('../../models/Wallet');
                const wallet = await WalletModel.findOne({ role: 'system' });
                
                res.status(200).send({
                    success: true,
                    message: 'System wallet fetched successfully',
                    data: wallet
                });
            } catch (error) {
                next(error);
            }
        }
    );

    getVirtualAccount = asyncHandler(async (req: Request, res: Response) => {
        const { walletId } = req.params;
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
        if (!wallet.owner) return res.status(400).json({ message: 'Wallet owner not found' });

        const virtualAccount = await VirtualAccountService.getOrCreateVirtualAccount(wallet.owner.toString());
        res.status(200).json({ success: true, data: virtualAccount });
    });

    regenerateVirtualAccount = asyncHandler(async (req: Request, res: Response) => {
        const { walletId } = req.params;
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
        if (!wallet.owner) return res.status(400).json({ message: 'Wallet owner not found' });

        const virtualAccount = await VirtualAccountService.getOrCreateVirtualAccount(wallet.owner.toString(), true);
        res.status(200).json({ success: true, message: 'Account regenerated', data: virtualAccount });
    });
}

export default new AdminWalletController();
