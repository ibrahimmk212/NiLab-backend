"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const VendorCategoryService_1 = __importDefault(require("../../services/VendorCategoryService"));
class MarketCategoryController {
    constructor() {
        this.getAll = (0, async_1.asyncHandler)(async (req, res) => {
            const product = await VendorCategoryService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const product = await VendorCategoryService_1.default.find(id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new MarketCategoryController();
