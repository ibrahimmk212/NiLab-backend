import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Review extends Document {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    rider: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}

interface IReviewModel extends Model<Review> {
    getAverageRating(vendorId: any): Promise<void>;
}

const reviewSchema = new Schema<Review>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        order: { type: Schema.Types.ObjectId, ref: 'Order' },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

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
        await mongoose.model('Vendor').findByIdAndUpdate(vendorId, {
            ratings: obj[0].averageRating
        });
    } catch (error) {
        console.log(error);
    }
};

// // Call getAverage after save
reviewSchema.post('save', function (review) {
    (this.constructor as IReviewModel).getAverageRating(review.vendor);
});

// Call getAverage before remove
reviewSchema.post('deleteOne', function (review) {
    (this.constructor as IReviewModel).getAverageRating(review.vendor);
});

const ReviewModel = mongoose.model<Review>('Review', reviewSchema);

export default ReviewModel;
