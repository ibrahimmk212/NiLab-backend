import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface Category extends Document {
    name: string;
    slug?: string;
    description: string;
}

const categorySchema = new Schema<Category>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: false },
        description: { type: String, required: true }
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

categorySchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
});
const CategoryModel = mongoose.model<Category>('Category', categorySchema);

export default CategoryModel;
