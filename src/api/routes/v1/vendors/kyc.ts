import { Router } from 'express';
import VendorKycController from '../../../controllers/vendors/VendorKycController';
import { upload } from '../../../services/FileService';

const vendorKycRouter = Router();

vendorKycRouter
    .route('/')
    .post(VendorKycController.createKyc)
    .get(VendorKycController.getKyc);

vendorKycRouter.post('/upload-file', upload.single('file'), VendorKycController.upload);

export default vendorKycRouter;
