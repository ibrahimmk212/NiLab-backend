"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const ProductService_1 = __importDefault(require("../../services/ProductService"));
const CategoryService_1 = __importDefault(require("../../services/CategoryService"));
const VendorService_1 = __importDefault(require("../../../api/services/VendorService"));
const s3_1 = require("../../../utils/s3");
class VendorProductController {
    constructor() {
        this.upload = (0, async_1.asyncHandler)(async (req, res, next) => {
            var _a, _b;
            const { vendor, body } = req;
            const { id } = req.params;
            const product = await ProductService_1.default.findById(id);
            if (!product)
                throw Error('Product Not found');
            let file = (_a = req === null || req === void 0 ? void 0 : req.files) === null || _a === void 0 ? void 0 : _a.file;
            if (!((_b = req === null || req === void 0 ? void 0 : req.files) === null || _b === void 0 ? void 0 : _b.file))
                throw Error('File Not selected');
            file.name = `${Date.now()}_${file.name.replace(/ /g, '_')}`;
            const upload = await (0, s3_1.uploadFileToS3)(file, 'thumbnails/');
            const updated = await ProductService_1.default.update(id, {
                thumbnail: upload === null || upload === void 0 ? void 0 : upload.url
            });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Product Updated Successfully.',
                data: updated
            });
        });
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body } = req;
            const newProduct = await ProductService_1.default.create(Object.assign(Object.assign({}, body), { vendor: vendor.id }));
            if (!newProduct) {
                throw Error('Failed to create Product');
            }
            await VendorService_1.default.addCategory(vendor.id, body.category);
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Product Created Successfully',
                data: newProduct
            });
        });
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
            const { vendor } = req;
            // TODO set pagination and filter
            const product = await ProductService_1.default.getAllByVendor(vendor.id);
            // TODO populate categories
            res.status(constants_1.STATUS.OK).send({
                message: 'Products fetched successfully',
                data: product
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
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const { id } = params;
            const newProduct = await ProductService_1.default.update(id, body);
            if (!newProduct) {
                throw Error('Failed to update Product');
            }
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Product Updated Successfully',
                data: newProduct
            });
        });
    }
}
exports.default = new VendorProductController();
