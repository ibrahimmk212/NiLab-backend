import { Router } from 'express';
import AdminKycController from '../../../controllers/admin/AdminKycController';

const adminKycRouter = Router();

adminKycRouter.get('/', AdminKycController.getKycs);
adminKycRouter.get('/user/:id', AdminKycController.getKycDetails);
adminKycRouter.put('/:id/status', AdminKycController.updateKycStatus);
adminKycRouter.put('/:id/bvn-status', AdminKycController.updateBvnStatus);

export default adminKycRouter;
