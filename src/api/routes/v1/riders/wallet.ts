import { Router } from 'express';
import RiderWalletController from '../../../controllers/riders/WalletController';

const riderWalletRouter: Router = Router();
riderWalletRouter.get('/', RiderWalletController.get);
riderWalletRouter.get('/banks', RiderWalletController.getBanks);
riderWalletRouter.post('/banks/enquiry', RiderWalletController.accountEnquiry);

riderWalletRouter.post('/withdraw', RiderWalletController.withdraw);

export default riderWalletRouter;
