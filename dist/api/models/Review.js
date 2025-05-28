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
const reviewSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor' },
    order: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order' },
    rider: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Rider' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
// Prevent users from submitting more than one review in an order
reviewSchema.index({ orderId: 1, user: 1 }, { unique: true });
reviewSchema.statics.getAverageRating = async function (vendorId) {
    // Calculating avg Rating...
    const obj = await this.aggregate([
        {
            $match: { vendor: vendorId }
        },
        {
            $group: {
                _id: '$vendor',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);
    try {
        await mongoose_1.default.model('Vendor').findByIdAndUpdate(vendorId, {
            ratings: obj[0].averageRating
        });
    }
    catch (error) {
        console.log(error);
    }
};
// // Call getAverage after save
reviewSchema.post('save', function (review) {
    this.constructor.getAverageRating(review.vendor);
});
// Call getAverage before remove
reviewSchema.post('deleteOne', function (review) {
    this.constructor.getAverageRating(review.vendor);
});
const ReviewModel = mongoose_1.default.model('Review', reviewSchema);
exports.default = ReviewModel;
