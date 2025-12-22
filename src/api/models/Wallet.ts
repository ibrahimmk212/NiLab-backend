import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    role: 'user' | 'rider' | 'vendor';
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
            enum: ['user', 'rider', 'vendor'],
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
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
// walletSchema.index({ role: 1, owner: 1 }, { unique: true });

// Save previous values before update
walletSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.prevAvailableBalance = this.availableBalance;
        this.prevPendingBalance = this.pendingBalance;
    }
    next();
});

export default mongoose.model<Wallet>('Wallet', walletSchema);
