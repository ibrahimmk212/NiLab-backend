"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const ProductService_1 = __importDefault(require("../../services/ProductService"));
const CategoryService_1 = __importDefault(require("../../services/CategoryService"));
class ProductController {
    constructor() {
        // createCategory = asyncHandler(
        //     async (
        //         req: Request | any,
        //         res: Response,
        //         next: NextFunction
        //     ): Promise<void> => {
        //         const newCategory = await CategoryService.create({
        //             ...req.body,
        //             vendor: req.vendor._id
        //         });
        //         if (!newCategory)
        //             res.status(STATUS.BAD_REQUEST).send({
        //                 success: false,
        //                 message: 'Failed to create Product'
        //             });
        //         res.status(STATUS.OK).send({
        //             success: true,
        //             message: 'Product Created Successfully',
        //             data: newCategory
        //         });
        //     }
        // );
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            // TODO set pagination and filter
            const products = await ProductService_1.default.getAll();
            // TODO populate categories
            res.status(constants_1.STATUS.OK).send({
                message: 'Products fetched successfully',
                data: products
            });
        });
        this.search = (0, async_1.asyncHandler)(async (req, res, next) => {
            const query = req.query;
            const product = await ProductService_1.default.search(query);
            res.status(constants_1.STATUS.OK).send({
                message: 'Products fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const product = await ProductService_1.default.findById(id);
            if (!product)
                throw new Error('Product not foud');
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Product fetched successfully',
                data: product
            });
        });
        this.getAllCategories = (0, async_1.asyncHandler)(async (req, res, next) => {
            const categories = await CategoryService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                message: 'Categories fetched successfully',
                data: categories
            });
        });
    }
}
exports.default = new ProductController();
