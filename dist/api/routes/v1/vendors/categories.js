"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MarketCategoryController_1 = __importDefault(require("../../../controllers/vendors/MarketCategoryController"));
const vendorCategoryRouter = (0, express_1.Router)();
vendorCategoryRouter.get('/', MarketCategoryController_1.default.getAll);
vendorCategoryRouter.get('/:id', MarketCategoryController_1.default.getSingle);
// vendorCategoryRouter.put('/:id', VendorCategoryController)
exports.default = vendorCategoryRouter;
