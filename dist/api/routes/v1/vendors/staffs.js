"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const staff_1 = __importDefault(require("../../../middlewares/validator/requirements/staff"));
const VendorStaffController_1 = __importDefault(require("../../../controllers/vendors/VendorStaffController"));
const vendorStaffRouter = (0, express_1.Router)();
vendorStaffRouter.post('/new', (0, validator_1.Validate)(staff_1.default.createStaff), VendorStaffController_1.default.create);
vendorStaffRouter.get('/', VendorStaffController_1.default.getAll);
vendorStaffRouter.get('/:id', VendorStaffController_1.default.getSingle);
exports.default = vendorStaffRouter;
