"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendorController_1 = __importDefault(require("../../../controllers/customers/VendorController"));
const products_1 = __importDefault(require("./products"));
const advancedQuery_1 = __importDefault(require("../../../../api/middlewares/data/advancedQuery"));
const Vendor_1 = __importDefault(require("../../../../api/models/Vendor"));
const VendorProductController_1 = __importDefault(require("../../../controllers/vendors/VendorProductController"));
const customerVendorRouter = (0, express_1.Router)({ mergeParams: true });
customerVendorRouter.get('/', (0, advancedQuery_1.default)(Vendor_1.default, 'categories'), VendorController_1.default.getVendors);
customerVendorRouter.get('/nearby', VendorController_1.default.getNearbyVendors);
customerVendorRouter.get('/:vendorId', VendorController_1.default.getVendorDetails);
customerVendorRouter.get('/:categoryId/category', VendorController_1.default.getVendorsByCategory);
customerVendorRouter.use('/:vendorId/products', products_1.default);
customerVendorRouter.use('/:vendorId/products/search', VendorProductController_1.default.search);
exports.default = customerVendorRouter;
