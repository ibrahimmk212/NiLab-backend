import mongoose, { Document, Schema } from 'mongoose';

export interface Favourite extends Document {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
}

const FavouriteSchema = new Schema<Favourite>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        product: { type: Schema.Types.ObjectId, ref: 'Product' }
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

const FavouriteModel = mongoose.model<Favourite>('Favourite', FavouriteSchema);

export default FavouriteModel;
