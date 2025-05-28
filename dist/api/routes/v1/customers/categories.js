"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = __importDefault(require("./products"));
const vendors_1 = __importDefault(require("./vendors"));
const advancedQuery_1 = __importDefault(require("../../../middlewares/data/advancedQuery"));
const Category_1 = __importDefault(require("../../../models/Category"));
const CategoryController_1 = __importDefault(require("../../../controllers/customers/CategoryController"));
const customerCategoryRouter = (0, express_1.Router)();
customerCategoryRouter.get('/', (0, advancedQuery_1.default)(Category_1.default), CategoryController_1.default.getCategories);
customerCategoryRouter.use('/:categoryId/vendors', vendors_1.default);
customerCategoryRouter.use('/:categoryId/products', products_1.default);
exports.default = customerCategoryRouter;
