import mongoose, { Document, Schema } from 'mongoose';

export interface PlatformRevenue extends Document {
    reference: string;
    sourceType: 'ORDER' | 'DELIVERY' | 'PACKAGE';
    sourceId: mongoose.Types.ObjectId;
    grossAmount: number;
    commissionRate: number;
    commissionAmount: number;
    netAmount: number; // Final profit after all deductions
    payer: mongoose.Types.ObjectId; // Customer ID
    payee: mongoose.Types.ObjectId; // Vendor or Rider ID
    status: 'PENDING' | 'SETTLED';
    createdAt: Date;
}

const platformRevenueSchema = new Schema<PlatformRevenue>(
    {
        reference: { type: String, required: true, unique: true, index: true },
        sourceType: {
            type: String,
            enum: ['ORDER', 'DELIVERY', 'PACKAGE'],
            required: true
        },
        sourceId: { type: Schema.Types.ObjectId, required: true, index: true },
        grossAmount: { type: Number, required: true },
        commissionRate: { type: Number, required: true },
        commissionAmount: { type: Number, required: true },
        netAmount: { type: Number, required: true },
        payer: { type: Schema.Types.ObjectId, ref: 'User' },
        payee: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['PENDING', 'SETTLED'],
            default: 'PENDING',
            index: true
        }
    },
    { timestamps: true }
);

export default mongoose.model<PlatformRevenue>(
    'PlatformRevenue',
    platformRevenueSchema
);
