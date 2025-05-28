"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const product_1 = __importDefault(require("../../../middlewares/validator/requirements/product"));
const AdminCategoryController_1 = __importDefault(require("../../../controllers/admin/AdminCategoryController"));
const adminCategoryRouter = (0, express_1.Router)();
adminCategoryRouter.post('/create', (0, validator_1.Validate)(product_1.default.createCategory), AdminCategoryController_1.default.create);
adminCategoryRouter.put('/:id', 
// Validate(productRequirement.),
AdminCategoryController_1.default.update);
adminCategoryRouter.get('/all', AdminCategoryController_1.default.getAll);
adminCategoryRouter.get('/:id', AdminCategoryController_1.default.getSingle);
exports.default = adminCategoryRouter;
