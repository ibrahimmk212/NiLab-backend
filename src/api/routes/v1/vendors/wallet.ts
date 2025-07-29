import { Router } from 'express';
import VendorWalletController from '../../../controllers/vendors/VendorWalletController';

const vendorWalletRouter: Router = Router();
vendorWalletRouter.get('/', VendorWalletController.get);
vendorWalletRouter.get('/banks', VendorWalletController.getBanks);
vendorWalletRouter.post(
    '/banks/enquiry',
    VendorWalletController.accountEnquiry
);

vendorWalletRouter.post('/withdraw', VendorWalletController.withdraw);

export default vendorWalletRouter;
