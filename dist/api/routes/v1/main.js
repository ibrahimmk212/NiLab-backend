"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../../controllers/AuthController"));
const validator_1 = require("../../middlewares/validator");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const waitlist_1 = __importDefault(require("./public/waitlist"));
const file_1 = __importDefault(require("./file"));
const marketCategories_1 = __importDefault(require("./public/marketCategories"));
const products_1 = __importDefault(require("./public/products"));
const mainRouter = (0, express_1.Router)();
mainRouter
    .route('/email-verify')
    .post((0, validator_1.Validate)(validator_1.Requirements.emailVerify), AuthController_1.default.emailVerify);
mainRouter
    .route('/phone-verify')
    .post(AuthController_1.default.phoneVerify);
mainRouter
    .route('/login')
    .post((0, validator_1.Validate)(validator_1.Requirements.login), AuthController_1.default.login);
mainRouter
    .route('/customer/signup')
    .post((0, validator_1.Validate)(validator_1.Requirements.signup), AuthController_1.default.customerSignUp);
mainRouter
    .route('/vendor/signup')
    .post(AuthController_1.default.vendorSignUp);
mainRouter
    .route('/set-pin')
    .put((0, validator_1.Validate)(validator_1.Requirements.setPin), auth_1.default.authenticate, AuthController_1.default.setPin);
mainRouter
    .route('/current-user')
    .get(auth_1.default.authenticate, AuthController_1.default.currentUser);
mainRouter
    .route('/forgot-password')
    .post((0, validator_1.Validate)(validator_1.Requirements.forgotPassword), AuthController_1.default.forgotPassword);
mainRouter
    .route('/verify-otp')
    .post((0, validator_1.Validate)(validator_1.Requirements.otp), AuthController_1.default.otpVerify);
mainRouter
    .route('/reset-password')
    .put((0, validator_1.Validate)(validator_1.Requirements.resetPassword), AuthController_1.default.resetPassword);
mainRouter
    .route('/update-password')
    .put((0, validator_1.Validate)(validator_1.Requirements.updatePassword), AuthController_1.default.updatePassword);
mainRouter.route('/create-admin').get(AuthController_1.default.createAdmin);
// WAITLIST
mainRouter.use('/waitlists', waitlist_1.default);
// file upload
mainRouter.use('/file', file_1.default);
// market category
mainRouter.use(`/market-categories`, marketCategories_1.default);
// products
mainRouter.use(`/products`, products_1.default);
// generate admin
// mainRouter.get('/generate-admin', Auth);
exports.default = mainRouter;
