"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendorSubcategoryController_1 = __importDefault(require("../../../controllers/vendors/VendorSubcategoryController"));
const vendorSubcategoryRouter = (0, express_1.Router)();
vendorSubcategoryRouter.get('/', VendorSubcategoryController_1.default.getAll);
vendorSubcategoryRouter.get('/:id', VendorSubcategoryController_1.default.getSingle);
vendorSubcategoryRouter.post('/', VendorSubcategoryController_1.default.create);
// vendorSubcategoryRouter.put('/:id', VendorSubcategoryController)
exports.default = vendorSubcategoryRouter;
