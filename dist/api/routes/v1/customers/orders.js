"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const OrderController_1 = __importDefault(require("../../../controllers/customers/OrderController"));
const customerOrderRouter = (0, express_1.Router)();
customerOrderRouter
    .route('/')
    .get(OrderController_1.default.getOrders)
    .post((0, validator_1.Validate)(validator_1.Requirements.createOrder), OrderController_1.default.createOrder);
customerOrderRouter
    .route('/:orderId')
    .get((0, validator_1.Validate)(validator_1.Requirements.getOrderDetail), OrderController_1.default.getOrderDetails)
    .put((0, validator_1.Validate)(validator_1.Requirements.confirmOrCancleOrder), OrderController_1.default.updateOrder);
customerOrderRouter.post('/:orderId/checkout', OrderController_1.default.checkout);
customerOrderRouter.post('/:orderId/review', OrderController_1.default.submitReview);
exports.default = customerOrderRouter;
