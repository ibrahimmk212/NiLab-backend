"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendorCategoryController_1 = __importDefault(require("../../../controllers/vendors/VendorCategoryController"));
const vendorCategoryRouter = (0, express_1.Router)();
vendorCategoryRouter.get('/', VendorCategoryController_1.default.getAll);
vendorCategoryRouter.get('/:id', VendorCategoryController_1.default.getSingle);
// vendorCategoryRouter.put('/:id', VendorCategoryController)
exports.default = vendorCategoryRouter;
