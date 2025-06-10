"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = __importDefault(require("../../../controllers/public/ProductController"));
const advancedQuery_1 = __importDefault(require("../../../middlewares/data/advancedQuery"));
const Product_1 = __importDefault(require("../../../models/Product"));
const productRouter = (0, express_1.Router)();
productRouter.get('/', (0, advancedQuery_1.default)(Product_1.default), ProductController_1.default.getAll);
productRouter.get('/categories', ProductController_1.default.getAllCategories);
productRouter.get('/:id', ProductController_1.default.getSingle);
exports.default = productRouter;
