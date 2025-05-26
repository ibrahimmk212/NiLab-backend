import mongoose, { Document, Schema } from 'mongoose';

export interface Favourite extends Document {
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
}

const favoriteSchema = new Schema<Favourite>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        productId: { type: Schema.Types.ObjectId, ref: 'Product' }
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

const FavoriteModel = mongoose.model<Favourite>('Favorite', favoriteSchema);

export default FavoriteModel;
