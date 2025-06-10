"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const product_1 = __importDefault(require("../../../middlewares/validator/requirements/product"));
const AdminMarketCategoryController_1 = __importDefault(require("../../../controllers/admin/AdminMarketCategoryController"));
const adminMarketCategoryRouter = (0, express_1.Router)();
adminMarketCategoryRouter.post('/create', (0, validator_1.Validate)(product_1.default.createCategory), AdminMarketCategoryController_1.default.create);
adminMarketCategoryRouter.put('/:id', 
// Validate(productRequirement.),
AdminMarketCategoryController_1.default.update);
adminMarketCategoryRouter.get('/', AdminMarketCategoryController_1.default.getAll);
adminMarketCategoryRouter.put('/', AdminMarketCategoryController_1.default.update);
adminMarketCategoryRouter.post('/', AdminMarketCategoryController_1.default.create);
adminMarketCategoryRouter.get('/:id', AdminMarketCategoryController_1.default.getSingle);
exports.default = adminMarketCategoryRouter;
