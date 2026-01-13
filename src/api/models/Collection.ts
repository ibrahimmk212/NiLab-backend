import mongoose, { Document, Schema } from 'mongoose';
export interface Collection extends Document {
    user: mongoose.Types.ObjectId;
    product: any;
    paymentReference: string;
    transactionReference: string;
    paidOn: string;
    paymentDescription: string;
    metaData: any;
    destinationAccountInformation: any;
    paymentSourceInformation: any;
    amountPaid: number;
    totalPayable: number;
    offlineProductInformation: any;
    cardDetails: any;
    paymentMethod: string;
    currency: string;
    settlementAmount: number;
    paymentStatus: string;
    customer: any;
    status: 'pending' | 'successful' | 'failed' | 'refunded';
    responseData?: any;
}

const collectionSchema = new Schema<Collection>(
    {
        user: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
        product: { type: Schema.Types.Map, required: false },
        paymentReference: { type: String, required: false },
        transactionReference: { type: String, required: false },
        paidOn: { type: String, required: false },
        paymentDescription: { type: String, required: false },
        metaData: { type: Schema.Types.Map, required: false },
        destinationAccountInformation: {
            type: Schema.Types.Map,
            required: false
        },
        paymentSourceInformation: { type: Schema.Types.Map, required: false },
        amountPaid: { type: Number, required: false },
        totalPayable: { type: Number, required: false },
        offlineProductInformation: { type: Schema.Types.Map, required: false },
        cardDetails: { type: Schema.Types.Map, required: false },
        paymentMethod: { type: String, required: false },
        currency: { type: String, required: false },
        settlementAmount: { type: Number, required: false },
        paymentStatus: { type: String, required: false },
        customer: { type: Schema.Types.Map, required: false },
        status: { type: String, required: false },
        responseData: { type: Schema.Types.Map, required: false }
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

const CollectionModel = mongoose.model<Collection>(
    'Collection',
    collectionSchema
);

export default CollectionModel;
