"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const walletSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false
    },
    riderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rider', required: false },
    balance: { type: Number, default: 0 },
    ledgerBalance: { type: Number, default: 0 },
    prevBalance: { type: Number, default: 0 },
    prevLegderBalance: { type: Number, default: 0 }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
walletSchema.post('save', async function (wallet) {
    //   Keep Record
    if (wallet.isNew) {
        console.log(wallet);
    }
    // await WalletHistoryRepository.create({
    //     walletId: userWallet.id,
    //     reference: reference,
    //     amount: amount,
    //     currentBalance: updateData.balance,
    //     prevBalance: currentBalance,
    //     currentLockedBalance: updateData.lockedBalance,
    //     prevLockedBalance: userWallet.lockedBalance,
    //     currentLedgerBalance: userWallet.ledgerBalance,
    //     prevLedgerBalance: userWallet.ledgerBalance,
    //     balanceType: 'available',
    //     remark,
    //     transactionType,
    //     transactionId,
    //     action: 'debit',
    //     createdAt: Utils.currentTimestamp(),
    //     updatedAt: Utils.currentTimestamp()
    // });
});
const WalletModel = mongoose_1.default.model('Wallet', walletSchema);
exports.default = WalletModel;
