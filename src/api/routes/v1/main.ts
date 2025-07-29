import { Router } from 'express';
import AuthController from '../../controllers/AuthController';
import { Validate, Requirements } from '../../middlewares/validator';
import Auth from '../../middlewares/auth';
import PromotionController from '../../controllers/customers/PromotionController';

const mainRouter: Router = Router();

mainRouter.get('/configurations', AuthController.getConfiguration);
mainRouter
    .route('/promotions/validate')
    .post(PromotionController.validatePromotionCode);

mainRouter
    .route('/email-verify')
    .post(Validate(Requirements.emailVerify), AuthController.emailVerify);

mainRouter
    .route('/login')
    .post(Validate(Requirements.login), AuthController.login);

mainRouter
    .route('/signup')
    .post(Validate(Requirements.signup), AuthController.signUp);

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

mainRouter
    .route('/customer/signup')
    .post(Validate(Requirements.signup), AuthController.customerSignUp);

mainRouter
    .route('/rider/signup')
    .post(Validate(Requirements.signup), AuthController.riderSignUp);

mainRouter.route('/vendor/signup').post(AuthController.vendorSignUp);

export default mainRouter;
