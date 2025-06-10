"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const MarketCategoryService_1 = __importDefault(require("../../services/MarketCategoryService"));
class MarketCategoryController {
    constructor() {
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const product = await MarketCategoryService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const product = await MarketCategoryService_1.default.find(id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new MarketCategoryController();
