import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import AdminWalletController from '../../../controllers/admin/AdminWalletController';

const adminWalletRouter: Router = Router();

adminWalletRouter.get(
    '/monnify/balance',
    AdminWalletController.getMonnifyBalance
);
adminWalletRouter.get('/:walletId', AdminWalletController.getWallet);

adminWalletRouter.delete('/:walletId', AdminWalletController.deleteWallet);

adminWalletRouter.get('/', AdminWalletController.getAllWallets);
adminWalletRouter.post('/fund', AdminWalletController.fundUserAvailableWallet);
adminWalletRouter.post(
    '/deduct',
    AdminWalletController.deductUserAvailableWallet
);

export default adminWalletRouter;
