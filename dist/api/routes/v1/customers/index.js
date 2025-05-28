"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = __importDefault(require("./categories"));
const vendors_1 = __importDefault(require("./vendors"));
const reviews_1 = __importDefault(require("./reviews"));
const notifications_1 = __importDefault(require("./notifications"));
const transactions_1 = __importDefault(require("./transactions"));
const orders_1 = __importDefault(require("./orders"));
const validator_1 = require("../../../middlewares/validator");
const ProfileController_1 = __importDefault(require("../../../controllers/customers/ProfileController"));
const wallets_1 = __importDefault(require("./wallets"));
const customersRouter = (0, express_1.Router)();
// customersRouter.use('/products', customerProductRouter); only through reroute
customersRouter.use('/orders', orders_1.default);
customersRouter.use('/wallet', wallets_1.default);
customersRouter.use('/vendors', vendors_1.default);
customersRouter.use('/reviews', reviews_1.default);
customersRouter.use('/categories', categories_1.default);
customersRouter.use('/notifications', notifications_1.default);
customersRouter.use('/transactions', transactions_1.default);
customersRouter.route('/profile').get(ProfileController_1.default.currentUser);
customersRouter
    .route('/update-password')
    .put((0, validator_1.Validate)(validator_1.Requirements.updatePassword), ProfileController_1.default.updatePassword);
customersRouter
    .route('/address')
    .post((0, validator_1.Validate)(validator_1.Requirements.addNewAddress), ProfileController_1.default.addNewAddress);
customersRouter
    .route('/address/:addressId')
    .put((0, validator_1.Validate)(validator_1.Requirements.updateAddress), ProfileController_1.default.updateAddress)
    .delete((0, validator_1.Validate)(validator_1.Requirements.deleteAddress), ProfileController_1.default.deleteAddress);
exports.default = customersRouter;
