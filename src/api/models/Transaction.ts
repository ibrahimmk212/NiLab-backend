import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
    order?: mongoose.Types.ObjectId;

    // Roles involved
    user: mongoose.Types.ObjectId; // customer (required)
    vendor?: mongoose.Types.ObjectId; // restaurant
    rider?: mongoose.Types.ObjectId; // courier

    reference: string;
    amount: number;

    type: 'CREDIT' | 'DEBIT';
    status: 'pending' | 'successful' | 'failed' | 'reversed';
    remark?: string;
}

const transactionSchema = new Schema<Transaction>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },

        rider: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
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

        type: {
            type: String,
            enum: ['CREDIT', 'DEBIT'],
            required: true
        },

        remark: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ['pending', 'successful', 'failed', 'reversed'],
            required: true
        }
    },
    { timestamps: true }
);

const TransactionModel = mongoose.model<Transaction>(
    'Transaction',
    transactionSchema
);
export default TransactionModel;
