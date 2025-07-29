import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    rider: mongoose.Types.ObjectId;
    reference: string;
    amount: number;
    type: string;
    remark: string;
    status: 'pending' | 'successful' | 'failed' | 'reversed';
}

const transactionSchema = new Schema<Transaction>(
    {
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        vendor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        rider: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        type: { type: String },
        remark: { type: String },
        reference: { type: String, required: true },
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
