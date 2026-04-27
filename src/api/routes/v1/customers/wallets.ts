import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import WalletController from '../../../controllers/customers/WalletController';

const customerWalletRouter: Router = Router();

customerWalletRouter.get('/', WalletController.getMyWallet);
customerWalletRouter.post('/fund', WalletController.fundWallet);
customerWalletRouter.get('/virtual-account', WalletController.getVirtualAccount);

export default customerWalletRouter;
