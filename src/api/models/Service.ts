import mongoose, { Document, Schema } from 'mongoose';
import { slugify } from '../../utils/helpers';

export interface Service extends Document {
    name: string;
    slug?: string;
    description: string;
}

const serviceSchema = new Schema<Service>(
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

serviceSchema.pre('save', function (next) {
    this.slug = slugify(this.name);
    next();
});

const ServiceModel = mongoose.model<Service>('Service', serviceSchema);

export default ServiceModel;
