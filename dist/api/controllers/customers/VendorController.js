"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const VendorService_1 = __importDefault(require("../../../api/services/VendorService"));
const appConfig_1 = __importDefault(require("../../../config/appConfig"));
class VendorController {
    constructor() {
        this.getVendors = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { categoryId } = req.params;
            if (categoryId) {
                const vendors = await VendorService_1.default.getVendorsByOption({
                    categoryId
                    // status: 'active'
                });
                res.status(constants_1.STATUS.OK).json({ success: true, data: vendors });
            }
            else {
                const { advancedResults } = res;
                res.status(constants_1.STATUS.OK).json(advancedResults);
            }
        });
        this.getVendorsByCategory = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { categoryId } = req.params;
            const vendors = await VendorService_1.default.getVendorsByCategory(categoryId);
            res.status(constants_1.STATUS.OK).json({ success: true, data: vendors });
        });
        this.getNearbyVendors = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { longitude, latitude, maxDistance = appConfig_1.default.app.defaultNearbyDistance } = req.query;
            const vendors = await VendorService_1.default.getNearbyVendors(Number(longitude), Number(latitude), Number(maxDistance));
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: vendors
            });
        });
        this.getVendorDetails = (0, async_1.asyncHandler)(async (req, res, next) => {
            const vendor = await VendorService_1.default.getById(req.params.vendorId);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: vendor
            });
        });
    }
}
exports.default = new VendorController();
