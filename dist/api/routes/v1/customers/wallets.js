"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerWalletController_1 = __importDefault(require("../../../controllers/customers/CustomerWalletController"));
const customerWalletRouter = (0, express_1.Router)();
customerWalletRouter
    .route('/')
    .get(CustomerWalletController_1.default.get);
// customerWalletRouter
//     .route('/:orderId')
//     .get(Validate(Requirements.getOrderDetail), orderController.getOrderDetails)
//     .put(
//         Validate(Requirements.confirmOrCancleOrder),
//         orderController.updateOrder
//     );
exports.default = customerWalletRouter;
