import mongoose, { Document, Schema } from 'mongoose';

export interface Product extends Document {
    name: string;
    price: number;
    available: boolean;
    description: string;
    vendor: mongoose.Types.ObjectId;
    unitOfMeasure?: string;
    stock: number;
    category: mongoose.Types.ObjectId;
    ratings: number;
    images: string[];
    thumbnail: string;
    status: 'active' | 'inactive';
    isDeleted: boolean;
    deletedAt?: Date | null;
}

const productSchema = new Schema<Product>(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        available: { type: Boolean, required: true, default: true },
        description: { type: String, required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        unitOfMeasure: { type: String, default: 'pieces' },
        stock: { type: Number, required: true, default: 0 },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        ratings: { type: Number, default: 0, min: 0, max: 5 },
        images: [{ type: String }],
        thumbnail: { type: String },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true
        },
        isDeleted: { type: Boolean, default: false, index: true },
        deletedAt: { type: Date, default: null }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

productSchema.index({ name: 'text', description: 'text' });

// Reverse populate favorites
productSchema.virtual('favourites', {
    ref: 'Favourite',
    localField: '_id',
    foreignField: 'product'
});

/**
 * Hook: Ensure Category is valid before saving
 * This will now trigger on both Create and Update (using .save())
 */
productSchema.pre('save', async function (next) {
    if (this.isModified('category')) {
        const category = await mongoose.model('Category').findOne({
            _id: this.category,
            isDeleted: false,
            status: 'active'
        });
        if (!category)
            return next(new Error('Selected category is inactive or deleted.'));
    }
    next();
});

const ProductModel = mongoose.model<Product>('Product', productSchema);
export default ProductModel;
