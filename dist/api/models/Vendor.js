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
const vendorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: false },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Enter a valid email address'
        ]
    },
    categories: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
    ],
    phone: { type: String, required: true },
    ratings: { type: Number, default: 0 },
    logo: { type: String },
    banner: { type: String },
    location: {
        // GeoJSON Point
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String
    },
    openingHour: { type: String, required: true, default: '09:30' },
    closingHour: { type: String, required: true, default: '18:00' },
    isAvailable: { type: Boolean, required: true, default: false },
    averageReadyTime: { type: Number, required: true, default: 54000000 },
    acceptDelivery: { type: Boolean, required: true, default: false },
    bankAccount: { type: Map, required: false, default: null },
    // lat: { type: Number },
    // lng: { type: Number },
    status: { type: String, required: false, default: 'inactive' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
// reverse populate orders
vendorSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});
// reverse populate products
vendorSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'vendor',
    justOne: false
});
// reverse populate reviews
vendorSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});
// reverse populate transactions
vendorSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});
// reverse populate staffs
vendorSchema.virtual('staffs', {
    ref: 'Staff',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: false
});
const VendorModel = mongoose_1.default.model('Vendor', vendorSchema);
// VendorModel.ensureIndexes();
exports.default = VendorModel;
