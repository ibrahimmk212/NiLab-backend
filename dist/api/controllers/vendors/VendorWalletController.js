"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const WalletRepository_1 = __importDefault(require("../../repositories/WalletRepository"));
class VendorWalletController {
    constructor() {
        this.get = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor } = req;
            const wallet = await WalletRepository_1.default.getWalletByKey('vendorId', vendor.id);
            if (!wallet) {
                throw new Error('Wallet not available');
            }
            res.status(constants_1.STATUS.OK).send({
                message: 'Vendor wallet Fetchd successfully',
                data: wallet
            });
        });
        this.getTransactions = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { vendor } = req;
            res.status(constants_1.STATUS.OK).send({
                message: 'Transactions Fetchd successfully',
                data: []
            });
        });
    }
}
exports.default = new VendorWalletController();
