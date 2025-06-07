import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface VendorCategory extends Document {
    name: string;
    slug?: string;
    description: string;
    thumbnail?: string;
}

const vendorCategorySchema = new Schema<VendorCategory>(
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

vendorCategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
})
const VendorCategoryModel = mongoose.model<VendorCategory>('VendorCategory', vendorCategorySchema);

export default VendorCategoryModel;
