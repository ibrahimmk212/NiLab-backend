import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    orderId: mongoose.Types.ObjectId;
    walletId: mongoose.Types.ObjectId;
    amount: number;
    type: string;
    balance: number;
    ledgerBalance: number;
    prevBalance: number;
    prevLegderBalance: number;
    transactions: mongoose.Types.ObjectId[];
}

const walletSchema = new Schema<Wallet>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
        walletId: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: false
        },
        type: { type: String },
        amount: { type: Number, default: 0 },
        balance: { type: Number, default: 0 },
        ledgerBalance: { type: Number, default: 0 },
        prevBalance: { type: Number, default: 0 },
        prevLegderBalance: { type: Number, default: 0 }
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

const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);

export default WalletModel;
