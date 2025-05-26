import mongoose, { Document, Schema } from 'mongoose';

export interface Payment extends Document {
    userId?: mongoose.Types.ObjectId;
    vendorId?: mongoose.Types.ObjectId;
    riderId?: mongoose.Types.ObjectId;
    walletId?: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    amount: number;
    url?: string;
    mode: string;
    trx_ref: string;
    channel: string;
    purpose: string;
    status?: string;
    transactionId?: mongoose.Types.ObjectId;
    metaData?: object | null; // Optional field for metadata
}

const paymentSchema = new Schema<Payment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false
        },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider', required: false },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
        walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: false },
        url: { type: String, required: false },
        mode: { type: String, required: false },
        amount: { type: Number, default: 0 },
        trx_ref: { type: String, required: true },
        channel: { type: String, required: true },
        purpose: { type: String, required: true },
        status: { type: String, required: false, default: 'pending' },
        metaData: { type: Object, required: false }
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

paymentSchema.post('save', async function (payment: Payment) {
    //   Keep Record
    if (payment.isNew) {
        console.log(payment);
    }
});
const PaymentModel = mongoose.model<Payment>('Payment', paymentSchema);

export default PaymentModel;
