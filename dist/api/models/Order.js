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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const DeliveryService_1 = __importDefault(require("../services/DeliveryService"));
const helpers_1 = require("../../utils/helpers");
const orderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    rider: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rider' },
    dispatch: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Dispatch' },
    products: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: { type: String, required: true },
            category: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    code: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending' },
    paymentCompleted: { type: Boolean, required: false, default: false },
    amount: { type: Number, required: true },
    commision: { type: Number, required: false },
    deliveryFee: { type: Number, required: true, default: 0 },
    tip: { type: Number, required: false, default: 0 },
    serviceFee: { type: Number, required: true, default: 0 },
    paymentType: { type: String, required: true },
    paymentReference: { type: String, required: false },
    transactionReference: { type: String, required: false },
    vat: { type: Number, required: true, default: 0 },
    pickupLocation: { type: [Number], required: false },
    rated: { type: Boolean, required: true, default: false },
    delivery: { type: Boolean, required: true, default: false },
    deliveryAccepted: { type: Boolean, required: true, default: false },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: { type: [Number], required: true },
    completed: { type: Boolean, required: true, default: false },
    completedBy: { type: String, required: false },
    acceptedAt: { type: Number, required: false },
    preparedAt: { type: Number, required: false },
    dispatchedAt: { type: Number, required: false },
    deliveredAt: { type: Number, required: false },
    canceledAt: { type: Number, required: false }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
// Pre-save hook
orderSchema.pre('save', async function (next) {
    if (this.isModified('status') && this.status === 'preparing') {
        this.acceptedAt = (0, helpers_1.currentTimestamp)();
        const delivery = await DeliveryService_1.default.createDelivery(this._id);
        if (!delivery)
            throw new Error('Delivery not created, please try again.');
    }
    else if (this.isModified('status') && this.status === 'prepared') {
        this.preparedAt = (0, helpers_1.currentTimestamp)();
        // Cast this.constructor to IOrderModel to access custom static methods
        this.constructor.getAverageCost(this.vendor);
    }
    next();
});
// Static method
orderSchema.statics.getAverageCost = async function (vendorId) {
    const obj = await this.aggregate([
        { $match: { vendor: vendorId } },
        {
            $group: {
                _id: '$vendor',
                averageReadyTime: {
                    $avg: {
                        $subtract: ['$preparedAt', '$acceptedAt']
                    }
                }
            }
        }
    ]);
    if (obj.length > 0) {
        try {
            await mongoose_1.default.model('Vendor').findByIdAndUpdate(vendorId, {
                averageReadyTime: obj[0].averageReadyTime
            });
        }
        catch (error) {
            console.error(error);
        }
    }
};
const OrderModel = mongoose_1.default.model('Order', orderSchema);
exports.default = OrderModel;
