import { Router } from 'express';

const ridersRouter: Router = Router();

// import { Validate, Requirements } from '../../../middlewares/validator';
import riderTransactionRouter from './transactions';
// import riderOrderRouter from './dispatches';
import riderNotificationRouter from './notifications';
import riderReviewRouter from './reviews';
import riderDeliveryRouter from './deliveries';
import mainRiderRouter from './main';
import auth from '../../../middlewares/auth';
import riderWalletRouter from './wallet';
import riderKycRouter from './kyc';
import riderPayoutRouter from './payout';

ridersRouter.use('/', mainRiderRouter);
ridersRouter.use('/deliveries', auth.isRider, riderDeliveryRouter);
// ridersRouter.use('/dispatches', riderOrderRouter);
ridersRouter.use('/reviews', auth.isRider, riderReviewRouter);
ridersRouter.use('/notifications', auth.isRider, riderNotificationRouter);
ridersRouter.use('/transactions', auth.isRider, riderTransactionRouter);
ridersRouter.use('/wallet', auth.isRider, riderWalletRouter);
ridersRouter.use('/kyc', auth.isRider, riderKycRouter);
ridersRouter.use('/payouts', auth.isRider, riderPayoutRouter);

// ridersRouter
//     .route('/update-password')
//     .put(
//         Validate(Requirements.updatePassword),
//         ProfileController.updatePassword
//     );

export default ridersRouter;
