import mongoose, { Document, Schema } from 'mongoose';

export interface VirtualAccount extends Document {
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    riderId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    accountNumber: string;
    accountName?: string;
    bankName?: string;
    amount?:number;
    reference?: string; 
    type: 'temporary'|'permanent';
    provider?: 'flutterwave'|"others";
    status: string;//created, expired, used,active
}

const virtualAccountSchema = new Schema<VirtualAccount>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false
        },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        accountNumber: { type: String, required: true },
        accountName: { type: String, required: false },
        bankName: { type: String, required: false },
        amount: { type: Number, required: false },
        reference: { type: String, required: true }, 
        type: { type: String, required: false },
        provider: { type: String, required: false },
        status: { type: String, required: false },
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
 
const VirtualAccountModel = mongoose.model<VirtualAccount>('VirtualAccount', virtualAccountSchema);

export default VirtualAccountModel;
