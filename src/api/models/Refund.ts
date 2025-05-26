import mongoose, { Document, Schema } from 'mongoose';

export interface Refund extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
}

const refundSchema = new Schema<Refund>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true }
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

const RefundModel = mongoose.model<Refund>('Refund', refundSchema);

export default RefundModel;
