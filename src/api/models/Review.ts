import mongoose, { Document, Model, Schema } from 'mongoose';

export type ReviewTargetType = 'vendor' | 'rider' | 'product';

export interface Review extends Document {
    user: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    vendor?: mongoose.Types.ObjectId;
    rider?: mongoose.Types.ObjectId;
    product?: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    images?: string[];
    targetType: ReviewTargetType;
}

interface IReviewModel extends Model<Review> {
    getAverageRating(targetId: any, targetType: ReviewTargetType): Promise<void>;
}

const reviewSchema = new Schema<Review>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true },
        images: [{ type: String }],
        targetType: {
            type: String,
            enum: ['vendor', 'rider', 'product'],
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// One review per order per user per target type
reviewSchema.index({ order: 1, user: 1, targetType: 1 }, { unique: true });

/**
 * Recalculates and persists the average rating for the given target (vendor/rider/product).
 */
reviewSchema.statics.getAverageRating = async function (
    targetId: any,
    targetType: ReviewTargetType
) {
    const matchField = targetType; // 'vendor' | 'rider' | 'product'

    const obj = await this.aggregate([
        { $match: { [matchField]: targetId, targetType } },
        {
            $group: {
                _id: `$${matchField}`,
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    const avg = obj.length > 0 ? Math.round(obj[0].averageRating * 10) / 10 : 0;

    try {
        const modelMap: Record<ReviewTargetType, string> = {
            vendor: 'Vendor',
            rider: 'Rider',
            product: 'Product'
        };
        await mongoose.model(modelMap[targetType]).findByIdAndUpdate(targetId, {
            ratings: avg
        });
    } catch (error) {
        console.error(`[Review] Failed to update ${targetType} rating:`, error);
    }
};

// Re-calculate after every save
reviewSchema.post('save', async function (review) {
    const Model = this.constructor as IReviewModel;
    const targetType = review.targetType;
    const targetId = review[targetType];
    if (targetId) {
        await Model.getAverageRating(targetId, targetType);
    }
});

// Re-calculate after delete
reviewSchema.post('deleteOne', { document: true, query: false }, async function (review) {
    const Model = this.constructor as IReviewModel;
    const targetType = review.targetType;
    const targetId = review[targetType];
    if (targetId) {
        await Model.getAverageRating(targetId, targetType);
    }
});

const ReviewModel = mongoose.model<Review, IReviewModel>('Review', reviewSchema);

export default ReviewModel;
