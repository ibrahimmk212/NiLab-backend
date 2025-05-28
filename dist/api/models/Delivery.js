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
const Dispatch_1 = __importDefault(require("./Dispatch"));
const helpers_1 = require("./../../utils/helpers");
const OrderRepository_1 = __importDefault(require("../repositories/OrderRepository"));
const deliverySchema = new mongoose_1.Schema({
    orderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true },
    riderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rider', required: true },
    package: {},
    dispatchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Dispatch',
        required: true
    },
    status: { type: String, required: true },
    deliveryCode: { type: Number, required: true },
    pickup: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        long: { type: Number, required: true }
    },
    destination: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        long: { type: Number, required: true }
    },
    receiverDetails: {
        name: { type: String, required: true },
        contactNumber: { type: String, required: true }
    },
    senderDetails: {
        name: { type: String, required: true },
        contactNumber: { type: String, required: true }
    },
    specialInstructions: { type: String },
    estimatedDeliveryTime: { type: Date, required: true },
    actualDeliveryTime: { type: Date }
    // Additional fields...
}, { timestamps: true });
deliverySchema.post('save', async function () {
    // Check if the current update is marking the delivery as delivered
    if (this.status === 'delivered') {
        const allDelivered = (await DeliveryModel.find({
            dispatchId: this.dispatchId,
            status: { $ne: 'delivered' }
        }).countDocuments()) === 0;
        if (allDelivered) {
            await Dispatch_1.default.findByIdAndUpdate(this.dispatchId, {
                status: 'completed',
                endTime: (0, helpers_1.currentTimestamp)()
            });
        }
    }
    else if (this.status === 'in-transit') {
        await OrderRepository_1.default.updateOrder(this.orderId.toString(), {
            dispatchedAt: (0, helpers_1.currentTimestamp)()
        });
    }
});
deliverySchema.statics.findForRider = async function (riderId, { startDate, endDate }) {
    return this.find({
        riderId,
        createdAt: { $gte: startDate, $lte: endDate }
    });
};
deliverySchema.statics.updateStatusForDispatch = async function (dispatchId, status) {
    return this.updateMany({ dispatchId }, { status });
};
const DeliveryModel = mongoose_1.default.model('Delivery', deliverySchema);
exports.default = DeliveryModel;
