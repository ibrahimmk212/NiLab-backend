"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const WaitListService_1 = __importDefault(require("../../services/WaitListService"));
class AdminWaitListController {
    constructor() {
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            const existingRecord = await WaitListService_1.default.findByEmailOrPhone(req.body.email, req.body.phone);
            if (existingRecord && existingRecord.phone === req.body.phone) {
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Phone number already registered'
                });
            }
            if (existingRecord && existingRecord.email === req.body.email) {
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Email number already registered'
                });
            }
            const newWaitList = await WaitListService_1.default.create(req.body);
            if (!newWaitList)
                res.status(constants_1.STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Waitlist'
                });
            res.status(constants_1.STATUS.CREATED).send({
                success: true,
                message: 'Waitlist Created Successfully',
                data: newWaitList
            });
        });
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const product = await WaitListService_1.default.getAll();
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const product = await WaitListService_1.default.find(id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        });
    }
}
exports.default = new AdminWaitListController();
