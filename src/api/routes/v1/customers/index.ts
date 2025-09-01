import { Router } from 'express';
import customerCategoryRouter from './categories';
import customerVendorRouter from './vendors';
import customerReviewRouter from './reviews';
import customerNotificationRouter from './notifications';
import customerTransactionRouter from './transactions';
import customerOrderRouter from './orders';
import { Validate, Requirements } from '../../../middlewares/validator';
import ProfileController from '../../../controllers/customers/ProfileController';
import customerFavouriteRouter from './favourites';
import customerPromotionRouter from './promotions';
import customerMarketCategoryRouter from './marketCategory';
import customerProductRouter from './products';

const customersRouter: Router = Router();

// customersRouter.use('/products', customerProductRouter); only through reroute
customersRouter.use('/orders', customerOrderRouter);
customersRouter.use('/products', customerProductRouter); // Products are accessed through vendors
customersRouter.use('/vendors', customerVendorRouter);
customersRouter.use('/reviews', customerReviewRouter);
customersRouter.use('/promotions', customerPromotionRouter);
customersRouter.use('/categories', customerCategoryRouter);
customersRouter.use('/notifications', customerNotificationRouter);
customersRouter.use('/transactions', customerTransactionRouter);
customersRouter.use('/favourites', customerFavouriteRouter);
customersRouter.use('/favourites', customerFavouriteRouter);
customersRouter.use('/market-categories', customerMarketCategoryRouter);

customersRouter
    .route('/profile')
    .get(ProfileController.currentUser)
    .put(Validate(Requirements.updateProfile), ProfileController.updateProfile);
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
