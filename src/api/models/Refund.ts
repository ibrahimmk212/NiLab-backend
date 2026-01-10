import mongoose, { Document, Schema } from 'mongoose';

export interface Refund extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;

    amount: number;
    refundType: 'full' | 'partial';

    reason:
        | 'order_canceled'
        | 'payment_failed'
        | 'vendor_rejected'
        | 'system_error'
        | 'other';

    status: 'pending' | 'completed' | 'failed';

    initiatedBy: 'user' | 'vendor' | 'admin' | 'system';

    paymentReference: string;
    refundReference?: string;

    requestedAt: number;
    processedAt?: number;
    failedAt?: number;
}

const refundSchema = new Schema<Refund>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },

        amount: { type: Number, required: true },
        refundType: {
            type: String,
            enum: ['full', 'partial'],
            default: 'full'
        },

        reason: {
            type: String,
            enum: [
                'order_canceled',
                'payment_failed',
                'vendor_rejected',
                'system_error',
                'other'
            ],
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },

        initiatedBy: {
            type: String,
            enum: ['user', 'vendor', 'admin', 'system'],
            required: true
        },

        paymentReference: { type: String, required: true },
        refundReference: { type: String },

        requestedAt: { type: Number, required: true },
        processedAt: { type: Number },
        failedAt: { type: Number }
    },
    { timestamps: true }
);

export default mongoose.model<Refund>('Refund', refundSchema);
