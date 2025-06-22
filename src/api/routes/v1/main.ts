import { Router } from 'express';
import AuthController from '../../controllers/AuthController';
import { Validate, Requirements } from '../../middlewares/validator';
import Auth from '../../middlewares/auth';
import waitlistRouter from './public/waitlist';
import FileController from '../../controllers/FileController';
import { upload } from '../../../utils/multer';
import fileRouter from './file';
import marketCategoryRouter from './public/marketCategories';
import productRouter from './public/products';

const mainRouter: Router = Router();

mainRouter
    .route('/email-verify')
    .post(Validate(Requirements.emailVerify), AuthController.emailVerify);


mainRouter
    .route('/phone-verify')
    .post(AuthController.phoneVerify);

mainRouter
    .route('/login')
    .post(Validate(Requirements.login), AuthController.login);

mainRouter
    .route('/customer/signup')
    .post(Validate(Requirements.signup), AuthController.customerSignUp);

mainRouter
    .route('/rider/signup')
    .post(Validate(Requirements.signup), AuthController.riderSignUp);

    mainRouter
    .route('/vendor/signup')
    .post(AuthController.vendorSignUp);

mainRouter
    .route('/set-pin')
    .put(
        Validate(Requirements.setPin),
        Auth.authenticate,
        AuthController.setPin
    );

mainRouter
    .route('/current-user')
    .get(Auth.authenticate, AuthController.currentUser);

mainRouter
    .route('/forgot-password')
    .post(Validate(Requirements.forgotPassword), AuthController.forgotPassword);

mainRouter
    .route('/verify-otp')
    .post(Validate(Requirements.otp), AuthController.otpVerify);

mainRouter
    .route('/reset-password')
    .put(Validate(Requirements.resetPassword), AuthController.resetPassword);
mainRouter
    .route('/update-password')
    .put(Validate(Requirements.updatePassword), AuthController.updatePassword);
mainRouter.route('/create-admin').get(AuthController.createAdmin);

// WAITLIST
mainRouter.use('/waitlists', waitlistRouter);

// file upload
mainRouter.use('/file', fileRouter);

// market category
mainRouter.use(`/market-categories`, marketCategoryRouter)

// products
mainRouter.use(`/products`, productRouter)

// generate admin
// mainRouter.get('/generate-admin', Auth);


export default mainRouter;
