import { Router } from 'express';
import customerCategoryRouter from './categories';
import customerVendorRouter from './vendors';
import customerProductRouter from './products';
import customerReviewRouter from './reviews';
import customerNotificationRouter from './notifications';
import customerTransactionRouter from './transactions';
import customerOrderRouter from './orders';
import { Validate, Requirements } from '../../../middlewares/validator';
import ProfileController from '../../../controllers/customers/ProfileController';
import customerWalletRouter from './wallets';

const customersRouter: Router = Router();

// customersRouter.use('/products', customerProductRouter); only through reroute
customersRouter.use('/orders', customerOrderRouter);
customersRouter.use('/wallet', customerWalletRouter);
customersRouter.use('/vendors', customerVendorRouter);
customersRouter.use('/reviews', customerReviewRouter);
customersRouter.use('/categories', customerCategoryRouter);
customersRouter.use('/notifications', customerNotificationRouter);
customersRouter.use('/transactions', customerTransactionRouter);

customersRouter.route('/profile').get(ProfileController.currentUser);
customersRouter
    .route('/update-password')
    .put(
        Validate(Requirements.updatePassword),
        ProfileController.updatePassword
    );

customersRouter
    .route('/address')
    .post(
        Validate(Requirements.addNewAddress),
        ProfileController.addNewAddress
    );

customersRouter
    .route('/address/:addressId')
    .put(Validate(Requirements.updateAddress), ProfileController.updateAddress)
    .delete(
        Validate(Requirements.deleteAddress),
        ProfileController.deleteAddress
    );

export default customersRouter;
