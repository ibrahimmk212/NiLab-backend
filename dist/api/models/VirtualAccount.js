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
const virtualAccountSchema = new mongoose_1.Schema({
    // userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    // vendorId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Vendor',
    //     required: false
    // },
    // riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
    walletId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Wallet' },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: false },
    bankName: { type: String, required: false },
    amount: { type: Number, required: false },
    reference: { type: String, required: true },
    type: { type: String, required: false },
    provider: { type: String, required: false },
    status: { type: String, required: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
const VirtualAccountModel = mongoose_1.default.model('VirtualAccount', virtualAccountSchema);
exports.default = VirtualAccountModel;
