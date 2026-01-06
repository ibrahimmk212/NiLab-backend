import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface Category extends Document {
    name: string;
    slug?: string;
    description?: string;
    vendor?: mongoose.Types.ObjectId;
    status: 'active' | 'inactive';
    isDeleted: boolean;
    deletedAt?: Date | null;
}

const categorySchema = new Schema<Category>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: false },
        description: { type: String, required: true },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: false },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true
        },
        isDeleted: { type: Boolean, required: true, default: false },
        deletedAt: {
            type: Date,
            default: null,
            index: true
        }
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
    if (!this.slug || this.isModified('name')) {
        this.slug = slugify(this.name);
    }
    next();
});

function excludeDeleted(this: any, next: any) {
    this.where({ deletedAt: null });
    next();
}

categorySchema.pre(/^find/, excludeDeleted);
const CategoryModel = mongoose.model<Category>('Category', categorySchema);

export default CategoryModel;
