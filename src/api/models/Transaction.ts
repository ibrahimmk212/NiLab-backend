import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
    orderId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    amount: number;
    type: string;
    status: string;
}

const transactionSchema = new Schema<Transaction>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String },
        amount: { type: Number, required: true },
        status: { type: String, required: true }
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

const TransactionModel = mongoose.model<Transaction>(
    'Transaction',
    transactionSchema
);

export default TransactionModel;
