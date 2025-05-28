"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = __importDefault(require("./products"));
const orders_1 = __importDefault(require("./orders"));
const staffs_1 = __importDefault(require("./staffs"));
const validator_1 = require("../../../middlewares/validator");
const VendorInfoController_1 = __importDefault(require("../../../controllers/vendors/VendorInfoController"));
const vendor_1 = __importDefault(require("../../../middlewares/validator/requirements/vendor"));
const wallet_1 = __importDefault(require("./wallet"));
const subcategories_1 = __importDefault(require("./subcategories"));
const categories_1 = __importDefault(require("./categories"));
const vendorsRouter = (0, express_1.Router)();
vendorsRouter.get('/', VendorInfoController_1.default.get);
// vendorsRouter.get('/wallet', VendorInfoController.getWallet);
vendorsRouter.put('/', (0, validator_1.Validate)(vendor_1.default.update), VendorInfoController_1.default.update);
vendorsRouter.put('/bank', (0, validator_1.Validate)(vendor_1.default.updateBank), VendorInfoController_1.default.updateBank);
vendorsRouter.put('/location', 
// Validate(vendorRequirement.updateBank),
VendorInfoController_1.default.updateLocation);
vendorsRouter.put('/banner', VendorInfoController_1.default.uploadBanner);
vendorsRouter.use('/products', products_1.default);
vendorsRouter.use('/subcategories', subcategories_1.default);
vendorsRouter.use('/categories', categories_1.default);
vendorsRouter.use('/orders', orders_1.default);
vendorsRouter.use('/staffs', staffs_1.default);
vendorsRouter.use('/wallet', wallet_1.default);
exports.default = vendorsRouter;
