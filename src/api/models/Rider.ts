import mongoose, { Document, Schema } from 'mongoose';
export interface BankAccount {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    documents?: [];
}

export interface Rider extends Document {
    // name: string;
    userId: string;
    ratings: number;
    status: 'unverified' | 'verified' | 'suspended';
    available: boolean;
    bankAccount?: BankAccount;
    documents?: [];
}

const riderSchema = new Schema<Rider>(
    {
        // name: { type: String, required: true },
        ratings: { type: Number, default: 0 },
        status: { type: String, required: true, default: 'unverified' },
        available: {
            type: Boolean,
            required: true,
            default: false
        },
        documents: { type: Array, required: false },
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

// reverse populate orders
riderSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'riderId',
    justOne: false
});

// reverse populate dispatches
riderSchema.virtual('dispatches', {
    ref: 'Dispatch',
    localField: '_id',
    foreignField: 'riderId',
    justOne: false
});

// reverse populate reviews
riderSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'riderId',
    justOne: false
});

// reverse populate transactions
riderSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'riderId',
    justOne: false
});

const RiderModel = mongoose.model<Rider>('Rider', riderSchema);

export default RiderModel;
