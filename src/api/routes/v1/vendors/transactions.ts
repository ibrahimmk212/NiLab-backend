import { Router } from 'express';
import VendorWalletController from '../../../controllers/vendors/VendorWalletController';

const vendorTransactionRouter: Router = Router();
vendorTransactionRouter.get('/', VendorWalletController.getTransactions);

export default vendorTransactionRouter;
