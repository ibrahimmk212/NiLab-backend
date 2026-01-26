import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import AdminWalletController from '../../../controllers/admin/AdminWalletController';

const adminWalletRouter: Router = Router();

adminWalletRouter.get('/:walletId', AdminWalletController.getWallet);
adminWalletRouter.post(
    `/merge-duplicates`,
    AdminWalletController.mergeDuplicateWallets
);

adminWalletRouter.get('/', AdminWalletController.getAllWallets);
adminWalletRouter.post('/fund', AdminWalletController.fundUserAvailableWallet);
adminWalletRouter.post(
    '/deduct',
    AdminWalletController.deductUserAvailableWallet
);

export default adminWalletRouter;
