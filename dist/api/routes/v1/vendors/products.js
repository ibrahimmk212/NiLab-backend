"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../../../middlewares/validator");
const VendorProductController_1 = __importDefault(require("../../../controllers/vendors/VendorProductController"));
const product_1 = __importDefault(require("../../../middlewares/validator/requirements/product"));
const advancedQuery_1 = __importDefault(require("../../../middlewares/data/advancedQuery"));
const Product_1 = __importDefault(require("../../../models/Product"));
const vendorProductRouter = (0, express_1.Router)();
vendorProductRouter.put('/:id/upload-file', VendorProductController_1.default.upload);
vendorProductRouter.post('/create', (0, validator_1.Validate)(product_1.default.create), VendorProductController_1.default.create);
// vendorProductRouter.post(
//     '/create-category',
//     Validate(productRequirement.createCategory),
//     VendorProductController.createCategory
// );
vendorProductRouter.get('/', (0, advancedQuery_1.default)(Product_1.default), VendorProductController_1.default.getAll);
vendorProductRouter.get('/categories', VendorProductController_1.default.getAllCategories);
vendorProductRouter.get('/:id', VendorProductController_1.default.getSingle);
vendorProductRouter.put('/:id', (0, validator_1.Validate)(product_1.default.update), VendorProductController_1.default.update);
vendorProductRouter.put('/:id/status', (0, validator_1.Validate)(product_1.default.updateStatus), VendorProductController_1.default.update);
exports.default = vendorProductRouter;
