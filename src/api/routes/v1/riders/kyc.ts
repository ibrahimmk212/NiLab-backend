import { Router } from 'express';
import KycController from '../../../controllers/riders/KycController';

const riderKycRouter = Router();

riderKycRouter
    .route('/')
    .post(KycController.createKyc)
    .get(KycController.getKyc)
    .put(KycController.updateKyc);

riderKycRouter.post('/upload-file', KycController.upload);

export default riderKycRouter;
