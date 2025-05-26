import { Router } from 'express';
import VendorWalletController from '../../../controllers/vendors/VendorWalletController';

const vendorWalletRouter: Router = Router();
vendorWalletRouter.get(
    '/',
    VendorWalletController.get
);

export default vendorWalletRouter;
