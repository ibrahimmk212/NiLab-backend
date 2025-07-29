import { Router } from 'express';
import ProfileController from '../../../controllers/riders/ProfileController';
import { Requirements, Validate } from '../../../middlewares/validator';
import auth from '../../../middlewares/auth';
import DeliveryController from '../../../controllers/riders/DeliveryController';

const mainRiderRouter: Router = Router();

mainRiderRouter
    .route('/email-verify')
    .post(Validate(Requirements.emailVerify), ProfileController.emailVerify);

mainRiderRouter
    .route('/login')
    .post(Validate(Requirements.login), ProfileController.login);

mainRiderRouter
    .route('/signup')
    .post(Validate(Requirements.riderSignup), ProfileController.signUp);

mainRiderRouter
    .route('/dashboard')
    .get(auth.isRider, DeliveryController.dashboard);

mainRiderRouter
    .route('/forgot-password')
    .post(
        Validate(Requirements.forgotPassword),
        ProfileController.forgotPassword
    );

mainRiderRouter
    .route('/verify-otp')
    .post(Validate(Requirements.otp), ProfileController.otpVerify);

mainRiderRouter
    .route('/reset-password')
    .put(Validate(Requirements.resetPassword), ProfileController.resetPassword);

mainRiderRouter
    .route('/update-password')
    .put(
        Validate(Requirements.updatePassword),
        ProfileController.updatePassword
    );

mainRiderRouter
    .route('/profile')
    .get(auth.isRider, ProfileController.currentUser);
mainRiderRouter
    .route('/availability')
    .get(auth.isRider, ProfileController.updateAvailability);
// mainRiderRouter
// .route('/withdraw')
// .post(auth.isRider, ProfileController.withdraw);
mainRiderRouter
    .route('/bank-details')
    .put(auth.isRider, ProfileController.updateBankDetails);
export default mainRiderRouter;
