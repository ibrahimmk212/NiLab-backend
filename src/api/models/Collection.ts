import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from 'src/utils/helpers';

export interface Collection extends Document {
    accountNumber: string;
    amount:number;
    fee:number;
    reference?: string;
    flwRef?:string;
    ipAddress?:string;
    description: string;
    deviceFingerprint?:string;
    type: string;
    accountId?: string;
    status: string;
}

const collectionSchema = new Schema<Collection>(
    {
        accountNumber: { type: String, required: true },
        amount: { type: Number, required: true },
        fee: { type: Number, required: true },
        reference: { type: String, required: true },
        flwRef: { type: String, required: false },
        ipAddress: { type: String, required: false },
        description: { type: String, required: false },
        deviceFingerprint: { type: String, required: false },
        type: { type: String, required: false },
        accountId: { type: String, required: false },
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

collectionSchema.pre('save', function (next) {
    // this.slug = slugify(this.name);
    next();
});
const CollectionModel = mongoose.model<Collection>('Collection', collectionSchema);

export default CollectionModel;
