import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface MarketCategory extends Document {
    name: string;
    slug?: string;
    description: string;
    thumbnail?: string;
}

const MarketCategorySchema = new Schema<MarketCategory>(
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

MarketCategorySchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
})
const MarketCategoryModel = mongoose.model<MarketCategory>('MarketCategory', MarketCategorySchema);

export default MarketCategoryModel;
