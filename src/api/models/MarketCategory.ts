import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface Category extends Document {
    name: string;
    slug?: string;
    description: string;
    thumbnail?: string;
}

const marketCategorySchema = new Schema<Category>(
    {
        name: { type: String, required: true },
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

marketCategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
})
const CategoryModel = mongoose.model<Category>('Category', marketCategorySchema);

export default CategoryModel;
