"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = __importDefault(require("../../../controllers/customers/NotificationController"));
const advancedQuery_1 = __importDefault(require("../../../../api/middlewares/data/advancedQuery"));
const Notification_1 = __importDefault(require("../../../../api/models/Notification"));
const customerNotificationRouter = (0, express_1.Router)();
customerNotificationRouter.get('/', (0, advancedQuery_1.default)(Notification_1.default), NotificationController_1.default.getNotifications);
exports.default = customerNotificationRouter;
