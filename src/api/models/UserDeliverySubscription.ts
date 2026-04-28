import mongoose, { Document, Schema } from 'mongoose';

export interface UserDeliverySubscription extends Document {
    user: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'canceled';
    paymentReference: string;
    autoRenew: boolean;
}

const userDeliverySubscriptionSchema = new Schema<UserDeliverySubscription>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        plan: { type: Schema.Types.ObjectId, ref: 'DeliverySubscriptionPlan', required: true },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['active', 'expired', 'canceled'],
            default: 'active',
            index: true
        },
        paymentReference: { type: String, required: false },
        autoRenew: { type: Boolean, default: false }
    },
    { timestamps: true }
);

const UserDeliverySubscriptionModel = mongoose.model<UserDeliverySubscription>(
    'UserDeliverySubscription',
    userDeliverySubscriptionSchema
);

export default UserDeliverySubscriptionModel;
