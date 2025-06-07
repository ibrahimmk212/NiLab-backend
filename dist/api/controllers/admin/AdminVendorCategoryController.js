"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const VendorCategoryService_1 = __importDefault(require("../../services/VendorCategoryService"));
class AdminVendorCategoryController {
    constructor() {
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            const newCategory = await VendorCategoryService_1.default.create(req.body);
            if (!newCategory)
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create category'
                });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Category Created Successfully',
                data: newCategory
            });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const updated = await VendorCategoryService_1.default.update(id, req.body);
            if (!updated)
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to update Category'
                });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Category Updated Successfully.',
                data: updated
            });
        });
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const product = await VendorCategoryService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const product = await VendorCategoryService_1.default.find(id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Category fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new AdminVendorCategoryController();
