"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const ProductService_1 = __importDefault(require("../../../api/services/ProductService"));
class ProductController {
    constructor() {
        this.getProducts = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { categoryId, vendorId } = req.params;
            // check if categoryId exist, and then get products by category
            if (categoryId) {
                const products = await ProductService_1.default.getAllByCategory(categoryId);
                res.status(constants_1.STATUS.OK).json({
                    success: true,
                    data: products
                });
                // check if categoryId exist, and then get products by category
            }
            else if (vendorId) {
                const products = await ProductService_1.default.getAllByVendor(vendorId);
                res.status(constants_1.STATUS.OK).json({
                    success: true,
                    data: products
                });
            }
            else {
                const { advancedResults } = res;
                res.status(constants_1.STATUS.OK).json(advancedResults);
            }
        });
        this.search = (0, async_1.asyncHandler)(async (req, res, next) => {
            const query = req.query;
            const product = await ProductService_1.default.search(query);
            res.status(constants_1.STATUS.OK).send({
                message: 'Products fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new ProductController();
