import mongoose, { Document, Schema } from 'mongoose';

export interface Payout extends Document {
    amount: number;
    status: 'pending' | 'completed' | 'rejected';
    userId: mongoose.Types.ObjectId;
    rejectionReason: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

const payoutSchema = new Schema<Payout>(
    {
        amount: { type: Number, default: 0 },
        status: { type: String, required: true, default: 'pending' },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rejectionReason: { type: String, required: false },
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: true }
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

payoutSchema.virtual('user', {
    ref: 'User',
    localField: 'userId', // ✅ Payout.userId
    foreignField: '_id', // ✅ User._id
    justOne: true
});

const PayoutModel = mongoose.model<Payout>('Payout', payoutSchema);

export default PayoutModel;
