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
const helpers_1 = require("./../../utils/helpers");
const dispatchSchema = new mongoose_1.Schema({
    riderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rider', required: true },
    deliveries: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Delivery',
            required: true,
            default: []
        }
    ],
    status: { type: String, required: true, default: 'created' },
    route: {
        summary: { type: String, required: true },
        estimatedDuration: { type: Number, required: true },
        estimatedDistance: { type: Number, required: true }
    },
    startTime: { type: Date, required: true, default: (0, helpers_1.currentTimestamp)() },
    endTime: { type: Date }
    // Additional fields...
}, { timestamps: true });
dispatchSchema.statics.findByRider = async function (riderId, { status, startDate, endDate }) {
    const query = { riderId };
    if (status)
        query.status = status;
    if (startDate && endDate)
        query.createdAt = { $gte: startDate, $lte: endDate };
    return this.find(query);
};
dispatchSchema.statics.findByRider = async function (riderId, { status, startDate, endDate }) {
    const query = { riderId };
    if (status)
        query.status = status;
    if (startDate && endDate)
        query.createdAt = { $gte: startDate, $lte: endDate };
    return this.find(query);
};
const DispatchModel = mongoose_1.default.model('Dispatch', dispatchSchema);
exports.default = DispatchModel;
