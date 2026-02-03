// models/Payout.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface Payout extends Document {
    amount: number;
    status: 'pending' | 'completed' | 'rejected';
    userId: mongoose.Types.ObjectId;
    walletId: mongoose.Types.ObjectId;
    rejectionReason?: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    currency?: string;
}

const payoutSchema = new Schema<Payout>(
    {
        amount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'completed', 'rejected'],
            default: 'pending'
        },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        walletId: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true
        },
        rejectionReason: { type: String },
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true },
        bankCode: { type: String },
        currency: { type: String, default: 'NGN' }
    },
    { timestamps: true }
);

const PayoutModel = mongoose.model<Payout>('Payout', payoutSchema);
export default PayoutModel;
