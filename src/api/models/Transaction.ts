import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
    order?: mongoose.Types.ObjectId;

    // Roles involved
    userId: mongoose.Types.ObjectId; // customer (required)
    // vendorId?: mongoose.Types.ObjectId; // restaurant
    // riderId?: mongoose.Types.ObjectId; // courier
    role: 'user' | 'rider' | 'vendor';
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

        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ['user', 'vendor', 'rider'],
            required: true
        },

        // vendorId: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'User',
        //     index: true
        // },

        // riderId: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'User',
        //     index: true
        // },

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
