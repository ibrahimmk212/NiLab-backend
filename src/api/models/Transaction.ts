import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
    order?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string;
    role: 'user' | 'rider' | 'vendor' | 'system';
    reference: string;
    amount: number;
    fromWallet?: mongoose.Types.ObjectId;
    toWallet?: mongoose.Types.ObjectId;
    type: 'CREDIT' | 'DEBIT';
    category: 'COMMISSION' | 'ORDER' | 'DELIVERY' | 'ADMIN' | 'SETTLEMENT';
    status: 'pending' | 'successful' | 'failed' | 'reversed';
    remark?: string;
    balanceBefore?: number;
    balanceAfter?: number;
    idempotencyKey?: string;
}

const transactionSchema = new Schema<Transaction>(
    {
        idempotencyKey: {
            type: String,
            index: true,
            sparse: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: false
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: function () {
                return this.role !== 'system';
            },
            index: true
        },
        role: {
            type: String,
            enum: ['user', 'vendor', 'rider', 'system'],
            required: true
        },

        reference: {
            type: String,
            required: true,
            unique: true
        },

        amount: {
            type: Number,
            required: true,
            min: 1
        },
        balanceBefore: { type: Number },
        balanceAfter: { type: Number },

        fromWallet: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: false
        },

        toWallet: {
            type: Schema.Types.ObjectId,
            ref: 'Wallet',
            required: false
        },

        type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
            required: true
        },
        category: {
            type: String,
            enum: ['COMMISSION', 'ORDER', 'DELIVERY', 'ADMIN', 'SETTLEMENT'],
            required: true
        },

        remark: {
            type: String,
            required: false
        },

        status: {
            type: String,
            enum: ['pending', 'successful', 'failed', 'reversed'],
            required: true
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

transactionSchema.index({ role: 1, createdAt: -1 });
transactionSchema.index({ order: 1 });

transactionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

const TransactionModel = mongoose.model<Transaction>(
    'Transaction',
    transactionSchema
);
export default TransactionModel;
