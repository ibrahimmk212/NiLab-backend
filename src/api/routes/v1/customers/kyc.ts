import { Router } from 'express';
import KycController from '../../../controllers/customers/KycController';
import Auth from '../../../middlewares/auth';

const customerKycRouter = Router();

customerKycRouter.use(Auth.authenticate);

customerKycRouter
    .route('/')
    .post(KycController.createKyc)
    .get(KycController.getKyc)
    .put(KycController.updateKyc);

customerKycRouter.post('/upload-file', KycController.upload);

export default customerKycRouter;
