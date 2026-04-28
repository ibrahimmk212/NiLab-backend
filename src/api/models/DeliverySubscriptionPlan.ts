import mongoose, { Document, Schema } from 'mongoose';

export interface DeliverySubscriptionPlan extends Document {
    title: string;
    description: string;
    price: number;
    durationType: 'daily' | 'weekly' | 'monthly';
    durationInDays: number;
    status: 'active' | 'inactive';
    perks: string[];
}

const deliverySubscriptionPlanSchema = new Schema<DeliverySubscriptionPlan>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        durationType: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true
        },
        durationInDays: { type: Number, required: true },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        perks: [{ type: String }]
    },
    { timestamps: true }
);

const DeliverySubscriptionPlanModel = mongoose.model<DeliverySubscriptionPlan>(
    'DeliverySubscriptionPlan',
    deliverySubscriptionPlanSchema
);

export default DeliverySubscriptionPlanModel;
