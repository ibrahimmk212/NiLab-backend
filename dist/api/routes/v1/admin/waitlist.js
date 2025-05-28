"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminWaitListController_1 = __importDefault(require("../../../controllers/admin/AdminWaitListController"));
const adminWaitlistRouter = (0, express_1.Router)();
adminWaitlistRouter.post('/create', 
// Validate(waitlistRequirement.createWaitlist),
AdminWaitListController_1.default.create);
adminWaitlistRouter.get('/', AdminWaitListController_1.default.getAll);
adminWaitlistRouter.get('/:id', AdminWaitListController_1.default.getSingle);
exports.default = adminWaitlistRouter;
