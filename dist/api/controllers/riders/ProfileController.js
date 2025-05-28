"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const UserService_1 = __importDefault(require("../../services/UserService"));
const AuthService_1 = __importDefault(require("../../services/AuthService"));
const RiderService_1 = __importDefault(require("../../../api/services/RiderService"));
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
            const { userdata } = req;
            const { currentPassword, newPassword } = req.body;
            const user = await AuthService_1.default.updatePassword(userdata.id, currentPassword, newPassword);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: user,
                message: 'Password updated successfully'
            });
        });
        this.updateBankDetails = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            // const { accountNumber, bankCode, accountName, bankName } = req.body;
            const rider = await RiderService_1.default.updateRiderBank(userdata.id, req.body);
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: rider,
                message: 'Bank details updated successfully'
            });
        });
        this.withdraw = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            const rider = await RiderService_1.default.getRiderDetail(userdata.id);
            const { amount } = req.body;
            if (!rider)
                throw Error('Rider not found!');
            if (!rider.bankAccount) {
                throw Error('Please add your bank details and try again.');
            }
            const { accountNumber, bankCode, accountName, bankName } = rider.bankAccount;
            // TODO create pending withdrawal
            // TODO debit ledger balance
            // TODO submit transfer request
            // TODO debit available balance
            // TODO update withdrawal record status
            res.status(constants_1.STATUS.OK).send({
                success: true,
                data: rider,
                message: `Withdrawal of ${amount} has been processed succeefully.`
            });
        });
    }
}
exports.default = new ProfileController();
