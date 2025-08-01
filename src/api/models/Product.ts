import mongoose, { Document, Schema } from 'mongoose';

export interface Product extends Document {
    name: string;
    price: number;
    available: boolean;
    description: string;
    vendor: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    ratings: number;
    images: string;
    thumbnail: string;
    status: string;
}

const productSchema = new Schema<Product>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        available: { type: Boolean, default: true },
        description: { type: String, required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        ratings: { type: Number, default: 0 },
        images: [{ type: String }],
        thumbnail: { type: String },
        status: { type: String, required: false, default: 'available' }
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

// reverse populate favourites
productSchema.virtual('favourites', {
    ref: 'Favourite',
    localField: '_id',
    foreignField: 'product',
    justOne: false
});

productSchema.post('save', async (product) => {
    const category = product.category;
    const vendorId = product.vendor;

    const vendor = await mongoose
        .model('Vendor')
        .findById(vendorId)
        .populate('categories');

    // check if this product category exists on in vendor profile.

    // if not exists, add
});

productSchema.index({ name: 'text', description: 'text' });

const ProductModel = mongoose.model<Product>('Product', productSchema);

export default ProductModel;
