"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const product_1 = __importDefault(require("../../../middlewares/validator/requirements/product"));
const VendorOrderController_1 = __importDefault(require("../../../controllers/vendors/VendorOrderController"));
const Order_1 = __importDefault(require("../../../models/Order"));
const advancedQuery_1 = __importDefault(require("../../../middlewares/data/advancedQuery"));
const vendorOrderRouter = (0, express_1.Router)();
vendorOrderRouter.get('/', (0, advancedQuery_1.default)(Order_1.default), VendorOrderController_1.default.getAll);
vendorOrderRouter.get('/:id', VendorOrderController_1.default.getSingle);
vendorOrderRouter.put('/:id', (0, validator_1.Validate)(product_1.default.update), VendorOrderController_1.default.update);
vendorOrderRouter.put('/:id/status', (0, validator_1.Validate)(product_1.default.updateStatus), VendorOrderController_1.default.updateStatus);
// vendorOrderRouter.put('/:id/cancel', VendorOrderController.cancel);
exports.default = vendorOrderRouter;
