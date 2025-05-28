"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const AdminOrderController_1 = __importDefault(require("../../../controllers/admin/AdminOrderController"));
const orders_1 = __importDefault(require("../../../middlewares/validator/requirements/orders"));
const adminOrderRouter = (0, express_1.Router)();
adminOrderRouter.get('/', 
// advancedQuery(OrderModel),
AdminOrderController_1.default.getAll);
adminOrderRouter.get('/vendor/:id', AdminOrderController_1.default.getByVendor);
adminOrderRouter.get('/:id', AdminOrderController_1.default.getSingle);
adminOrderRouter.put('/:id/status', (0, validator_1.Validate)(orders_1.default.updateStatus), AdminOrderController_1.default.updateStatus);
adminOrderRouter.put('/:id', AdminOrderController_1.default.updateStatus);
exports.default = adminOrderRouter;
