"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const WalletRepository_1 = __importDefault(require("../../repositories/WalletRepository"));
class CustomerWalletController {
    constructor() {
        this.get = (0, async_1.asyncHandler)(async (req, res, next) => {
            const user = req.userdata;
            console.log(user);
            let wallet;
            wallet = await WalletRepository_1.default.getWalletByKey('userId', user.id);
            if (!wallet) {
                wallet = await WalletRepository_1.default.createWallet({
                    userId: user.id
                });
            }
            res.status(constants_1.STATUS.OK).send({
                message: 'Customer wallet Fetched successfully',
                data: wallet
            });
        });
        this.getTransactions = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { user } = req;
            res.status(constants_1.STATUS.OK).send({
                message: 'Transactions Fetchd successfully',
                data: []
            });
        });
    }
}
exports.default = new CustomerWalletController();
