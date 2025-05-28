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
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    description: { type: String, required: true },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: false
    },
    ratings: { type: Number, default: 0 },
    images: [{ type: String }],
    thumbnail: { type: String },
    status: { type: String, required: false, default: 'available' }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
productSchema.post('save', async (product) => {
    const category = product.category;
    const vendorId = product.vendor;
    const vendor = await mongoose_1.default
        .model('Vendor')
        .findById(vendorId)
        .populate('categories');
    // check if this product category exists on in vendor profile.
    // if not exists, add
});
const ProductModel = mongoose_1.default.model('Product', productSchema);
exports.default = ProductModel;
