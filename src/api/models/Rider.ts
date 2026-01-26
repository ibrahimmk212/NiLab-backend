import mongoose, { Document, Schema } from 'mongoose';
import WalletService from '../services/WalletService';
export interface BankAccount {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
}

export interface Rider extends Document {
    name: string;
    userId: mongoose.Types.ObjectId;
    ratings: number;
    phoneNumber: string;
    email: string;
    city: string;
    state: string;
    vehicle: string;
    status: 'unverified' | 'verified' | 'suspended';
    available: boolean;
    gender: string;
    bankAccount?: BankAccount;
}

const riderSchema = new Schema<Rider>(
    {
        name: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        phoneNumber: { type: String, required: false },
        email: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: true, default: 'Kano' },
        gender: { type: String, required: false, default: 'male' },
        vehicle: { type: String, required: true, default: 'bicycle' },
        ratings: { type: Number, default: 0 },
        status: { type: String, required: true, default: 'verified' },
        available: {
            type: Boolean,
            required: true,
            default: false
        },
        bankAccount: {
            accountName: String,
            accountNumber: String,
            bankName: String,
            bankCode: String
        }
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

riderSchema.virtual('user', {
    ref: 'User',
    localField: 'userId', // ✅ Vendor.userId
    foreignField: '_id', // ✅ User._id
    justOne: true
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

riderSchema.post('save', async function (rider) {
    try {
        if (rider.isNew) {
            await WalletService.createWallet({
                role: 'rider',
                owner: rider.id
            });
        }
    } catch (error: any) {
        console.log(`Wallet not created: ${error.message}`);
    }
});

const RiderModel = mongoose.model<Rider>('Rider', riderSchema);

export default RiderModel;
