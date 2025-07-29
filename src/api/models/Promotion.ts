import mongoose, { Document, Schema } from 'mongoose';
import {
    generatePromotionCode,
    generateRandomNumbers
} from '../../utils/helpers';

export interface Promotion extends Document {
    vendor: mongoose.Types.ObjectId;
    discountPercentage: number;
    discountAmount: number;
    discountType: 'percentage' | 'amount';
    title: string;
    description: string;
    code: string;
    daysToExpire: number;
    maxAmount: number;
    eligibleAmount: number;
    slots: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const promotionSchema = new Schema<Promotion>(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false
        },
        title: { type: String, required: true },
        description: { type: String, required: false, default: '' },
        code: { type: String, required: true },
        discountType: { type: String, required: true },
        slots: { type: Number, required: true },
        discountPercentage: { type: Number, required: false },
        discountAmount: { type: Number, required: false },

        maxAmount: { type: Number, required: false },
        eligibleAmount: { type: Number, required: true },
        daysToExpire: { type: Number, required: true },
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
