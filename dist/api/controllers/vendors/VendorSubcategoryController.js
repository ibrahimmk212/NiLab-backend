"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const SubcategoryService_1 = __importDefault(require("../../services/SubcategoryService"));
class VendorSubcategoryController {
    constructor() {
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            const user = req.userdata;
            const newSubcategory = await SubcategoryService_1.default.create(Object.assign(Object.assign({}, req.body), { userId: user.id }));
            if (!newSubcategory)
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Product Subcategory'
                });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Product Subcategory Created Successfully',
                data: newSubcategory
            });
        });
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const product = await SubcategoryService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const product = await SubcategoryService_1.default.find(id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new VendorSubcategoryController();
