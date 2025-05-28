"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const AdminVendorController_1 = __importDefault(require("../../../controllers/admin/AdminVendorController"));
const vendor_1 = __importDefault(require("../../../middlewares/validator/requirements/vendor"));
const adminVendorRouter = (0, express_1.Router)();
adminVendorRouter.post('/onboard', (0, validator_1.Validate)(vendor_1.default.onboard), AdminVendorController_1.default.create);
adminVendorRouter.get('/all', AdminVendorController_1.default.getAll);
adminVendorRouter.get('/:id', AdminVendorController_1.default.getSingle);
adminVendorRouter.put('/:id', (0, validator_1.Validate)(vendor_1.default.update), AdminVendorController_1.default.update);
adminVendorRouter.put('/:id/status', (0, validator_1.Validate)(vendor_1.default.updateStatus), AdminVendorController_1.default.update);
exports.default = adminVendorRouter;
