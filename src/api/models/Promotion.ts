import mongoose, { Document, Schema } from 'mongoose';

export interface Promotion extends Document {
    vendorId: mongoose.Types.ObjectId;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const promotionSchema = new Schema<Promotion>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        discountPercentage: { type: Number, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true }
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

const PromotionModel = mongoose.model<Promotion>('Promotion', promotionSchema);

export default PromotionModel;
