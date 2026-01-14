import mongoose, { Document, Schema } from 'mongoose';

export interface Payment extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;

    provider: 'MONNIFY' | 'WALLET';
    channel?: 'CARD' | 'TRANSFER' | 'USSD';

    paymentReference: string;
    transactionReference?: string;

    amount: number;
    currency: 'NGN';

    status: 'pending' | 'success' | 'failed';

    rawResponse?: any; // webhook payload
}

const paymentSchema = new Schema<Payment>(
    {
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        provider: { type: String, enum: ['MONNIFY', 'WALLET'], required: true },
        channel: { type: String },

        paymentReference: { type: String, required: true, unique: true },
        transactionReference: { type: String },

        amount: { type: Number, required: true },
        currency: { type: String, default: 'NGN' },

        status: {
            type: String,
            enum: ['pending', 'success', 'failed`'],
            default: 'pending'
        },

        rawResponse: { type: Schema.Types.Mixed }
    },
    { timestamps: true }
);

const paymentModel = mongoose.model<Payment>('Payment', paymentSchema);

export default paymentModel;
