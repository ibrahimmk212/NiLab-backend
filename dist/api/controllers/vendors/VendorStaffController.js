"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const StaffService_1 = __importDefault(require("../../services/StaffService"));
const UserService_1 = __importDefault(require("../../services/UserService"));
class VendorStaffController {
    constructor() {
        this.create = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body } = req;
            const user = await UserService_1.default.findByEmailOrPhone(body.email, body.phone);
            if (user) {
                throw Error('Account already exist');
            }
            const newUser = await UserService_1.default.createUser(Object.assign(Object.assign({}, body), { role: 'staff' }));
            const staff = await StaffService_1.default.createStaff({
                userId: newUser.id,
                role: body.role,
                vendorId: vendor.id
            });
            if (!staff) {
                throw Error('Failed to create Product');
            }
            res.status(constants_1.STATUS.CREATED).json({
                success: true,
                message: 'Staff Created',
                data: vendor
            });
        });
        this.getAll = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor } = req;
            const staffs = await StaffService_1.default.findAllByKey('vendorId', vendor.id);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'STaff Feteched',
                data: staffs
            });
        });
        this.getSingle = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { id } = req.params;
            const { vendor } = req;
            const staffs = await StaffService_1.default.findById(id);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'STaff Feteched',
                data: staffs
            });
        });
        this.update = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor, body, params } = req;
            const { id } = params;
            // res.json(vendor)
            throw Error('Failed to update Product');
        });
    }
}
exports.default = new VendorStaffController();
