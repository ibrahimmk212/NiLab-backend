import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import WalletController from '../../../controllers/customers/WalletController';

const customerWalletRouter: Router = Router();

customerWalletRouter.use('/', WalletController.getMyWallet);

export default customerWalletRouter;
