"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ridersRouter = (0, express_1.Router)();
const validator_1 = require("../../../middlewares/validator");
const ProfileController_1 = __importDefault(require("../../../controllers/riders/ProfileController"));
const transactions_1 = __importDefault(require("./transactions"));
// import riderOrderRouter from './dispatches';
const notifications_1 = __importDefault(require("./notifications"));
const reviews_1 = __importDefault(require("./reviews"));
const deliveries_1 = __importDefault(require("./deliveries"));
// ridersRouter.use('/products', riderProductRouter); only through reroute
ridersRouter.use('/deliveries', deliveries_1.default);
// ridersRouter.use('/dispatches', riderOrderRouter);
ridersRouter.use('/reviews', reviews_1.default);
ridersRouter.use('/notifications', notifications_1.default);
ridersRouter.use('/transactions', transactions_1.default);
ridersRouter.route('/profile').get(ProfileController_1.default.currentUser);
ridersRouter.route('/withdraw').post(ProfileController_1.default.withdraw);
ridersRouter.route('/bank-details').put(ProfileController_1.default.updateBankDetails);
ridersRouter
    .route('/update-password')
    .put((0, validator_1.Validate)(validator_1.Requirements.updatePassword), ProfileController_1.default.updatePassword);
exports.default = ridersRouter;
