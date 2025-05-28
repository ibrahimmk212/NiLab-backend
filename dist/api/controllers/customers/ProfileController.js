"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const UserService_1 = __importDefault(require("../../services/UserService"));
const AuthService_1 = __importDefault(require("../../services/AuthService"));
class ProfileController {
    constructor() {
        this.currentUser = (0, async_1.asyncHandler)(async (req, res) => {
            const user = await UserService_1.default.findUserById(req.userdata.id);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                message: 'User fetched successfully',
                data: user
            });
        });
        this.updatePassword = (0, async_1.asyncHandler)(async (req, res) => {
            const pin = req.body.pin;
            const { userdata } = req;
            const { currentPassword, newPassword } = req.body;
            const user = await AuthService_1.default.updatePassword(userdata.id, currentPassword, newPassword);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'Password updated successfully'
            });
        });
        this.addNewAddress = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { userdata } = req;
            const payload = req.body;
            const user = await UserService_1.default.addNewAddress(userdata === null || userdata === void 0 ? void 0 : userdata.id, payload);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'New Address created successfully'
            });
        });
        this.updateAddress = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { userdata } = req;
            const { addressId } = req.params;
            const payload = req.body;
            const user = await UserService_1.default.updateAddress(userdata === null || userdata === void 0 ? void 0 : userdata.id, addressId, payload);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'Address updated successfully'
            });
        });
        this.deleteAddress = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { userdata } = req;
            const { addressId } = req.params;
            const user = await UserService_1.default.deleteAddress(userdata === null || userdata === void 0 ? void 0 : userdata.id, addressId);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'Address deleted successfully'
            });
        });
    }
}
exports.default = new ProfileController();
