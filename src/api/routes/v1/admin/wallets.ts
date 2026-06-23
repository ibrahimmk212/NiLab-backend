import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import AdminWalletController from '../../../controllers/admin/AdminWalletController';

const adminWalletRouter: Router = Router();

adminWalletRouter.get(
    '/paystack/balance',
    AdminWalletController.getPaystackBalance
);
adminWalletRouter.get('/:walletId', AdminWalletController.getWallet);
adminWalletRouter.get('/:walletId/virtual-account', AdminWalletController.getVirtualAccount);
adminWalletRouter.post('/:walletId/virtual-account/regenerate', AdminWalletController.regenerateVirtualAccount);

adminWalletRouter.get('/platform/system-wallet', AdminWalletController.getSystemWallet);
adminWalletRouter.delete('/:walletId', AdminWalletController.deleteWallet);

adminWalletRouter.get('/', AdminWalletController.getAllWallets);
adminWalletRouter.post('/fund', AdminWalletController.fundUserAvailableWallet);
adminWalletRouter.post(
    '/deduct',
    AdminWalletController.deductUserAvailableWallet
);

export default adminWalletRouter;
