import mongoose, { Document, Schema } from 'mongoose';

export interface BankAccount extends Document {
    userId: mongoose.Types.ObjectId;
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    isDefault: boolean;
}

const bankAccountSchema = new Schema<BankAccount>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
        bankCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
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

// Optional: you can ensure that only one default bank account exists per user if needed.
// However, standard pre-save hooks or controller logic is usually easier for cross-document updates.

const BankAccountModel = mongoose.model<BankAccount>('BankAccount', bankAccountSchema);

export default BankAccountModel;
