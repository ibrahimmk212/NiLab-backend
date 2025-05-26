import { Router } from 'express';

const ridersRouter: Router = Router();

import { Validate, Requirements } from '../../../middlewares/validator';
import ProfileController from '../../../controllers/riders/ProfileController';
import riderTransactionRouter from './transactions';
// import riderOrderRouter from './dispatches';
import riderNotificationRouter from './notifications';
import riderReviewRouter from './reviews';
import riderDeliveryRouter from './deliveries';

// ridersRouter.use('/products', riderProductRouter); only through reroute
ridersRouter.use('/deliveries', riderDeliveryRouter);
// ridersRouter.use('/dispatches', riderOrderRouter);
ridersRouter.use('/reviews', riderReviewRouter);
ridersRouter.use('/notifications', riderNotificationRouter);
ridersRouter.use('/transactions', riderTransactionRouter);

ridersRouter.route('/profile').get(ProfileController.currentUser);
ridersRouter.route('/withdraw').post(ProfileController.withdraw);
ridersRouter.route('/bank-details').put(ProfileController.updateBankDetails);

ridersRouter
    .route('/update-password')
    .put(
        Validate(Requirements.updatePassword),
        ProfileController.updatePassword
    );

export default ridersRouter;
