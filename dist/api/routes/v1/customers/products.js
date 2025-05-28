"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = __importDefault(require("../../../controllers/customers/ProductController"));
const customerProductRouter = (0, express_1.Router)({ mergeParams: true });
customerProductRouter.get('/', ProductController_1.default.getProducts);
customerProductRouter.get('/search', ProductController_1.default.search);
exports.default = customerProductRouter;
