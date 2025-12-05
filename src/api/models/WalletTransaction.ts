import mongoose, { Schema } from 'mongoose';

export interface WalletTransaction extends Document {
    wallet: mongoose.Types.ObjectId;
    amount: number;
    type: 'credit' | 'debit';
    category: 'order_payment' | 'withdrawal' | 'delivery_earning' | 'refund';
    reference: string;
    description?: string;
    status: 'pending' | 'success' | 'failed';
    meta?: any;
}

const transactionSchema = new Schema<WalletTransaction>(
    {
        wallet: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
        amount: { type: Number, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        description: { type: String },
        reference: { type: String, unique: true },
        status: { type: String, default: 'pending' },
        meta: { type: Object }
    },
    { timestamps: true }
);

export default mongoose.model('WalletTransaction', transactionSchema);
