import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface Subcategory extends Document {
    name: string;
    vendorId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    slug?: string;
    description: string;
    thumbnail?: string;
}

const subcategorySchema = new Schema<Subcategory>(
    {
        name: { type: String, required: true },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        vendorId: {
            type: Schema.Types.ObjectId, 
            ref: 'Vendor',
            required: true
        },
        slug: { type: String, required: false },
        description: { type: String, required: true },
        thumbnail: { type: String, required: false }
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

subcategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
});
const SubcategoryModel = mongoose.model<Subcategory>('Subcategory', subcategorySchema);

export default SubcategoryModel;
