import { Router } from 'express';
import AdminKycController from '../../../controllers/admin/AdminKycController';

const adminKycRouter = Router();

adminKycRouter.get('/', AdminKycController.getKycs);
adminKycRouter.get('/:id', AdminKycController.getKycDetails);
adminKycRouter.put('/:id/status', AdminKycController.updateKycStatus);
adminKycRouter.put('/:id/address', AdminKycController.updateKycAddress);
adminKycRouter.put('/:id/identity', AdminKycController.updateKycIdentity);
adminKycRouter.put('/:id/nextofkin', AdminKycController.updateKycNextOfKin);
adminKycRouter.put('/:id/guarantor', AdminKycController.updateKycGuarantor);

export default adminKycRouter;
