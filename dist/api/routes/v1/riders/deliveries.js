"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DeliveryController_1 = __importDefault(require("../../../controllers/riders/DeliveryController"));
const riderDeliveryRouter = (0, express_1.Router)();
riderDeliveryRouter.get('/histories', DeliveryController_1.default.getMyDeliveries);
riderDeliveryRouter.get('/active', DeliveryController_1.default.getActiveDeliveries);
riderDeliveryRouter.get('/available', DeliveryController_1.default.availableDeliveries);
riderDeliveryRouter.post('accept/:deliveryId', DeliveryController_1.default.acceptDelivery);
// riderDeliveryRouter.get('route/:deliveryId');
riderDeliveryRouter.put('update-status/:deliveryId', DeliveryController_1.default.updateDeliveryStatus);
riderDeliveryRouter.post('confirm/:deliveryId', DeliveryController_1.default.confirmDelivery);
exports.default = riderDeliveryRouter;
