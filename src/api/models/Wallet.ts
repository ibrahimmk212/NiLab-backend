import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    role: 'user' | 'rider' | 'vendor' | 'system';
    owner: mongoose.Types.ObjectId;
    availableBalance: number; // withdrawable
    pendingBalance: number; // escrow / waiting for order completion

    prevAvailableBalance: number;
    prevPendingBalance: number;
}

const walletSchema = new Schema<Wallet>(
    {
        role: {
            type: String,
            enum: ['user', 'rider', 'vendor', 'system'],
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        availableBalance: { type: Number, default: 0 },
        pendingBalance: { type: Number, default: 0 },

        prevAvailableBalance: { type: Number, default: 0 },
        prevPendingBalance: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Ensure one wallet per user role
walletSchema.index({ role: 1, owner: 1 }, { unique: true });

walletSchema.pre('findOneAndUpdate', async function (next) {
    const doc = await this.model.findOne(this.getQuery());

    if (doc) {
        this.set({
            prevAvailableBalance: doc.availableBalance,
            prevPendingBalance: doc.pendingBalance
        });
    }

    next();
});

const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);
export default WalletModel;
