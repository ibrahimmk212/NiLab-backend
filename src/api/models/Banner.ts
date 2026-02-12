import mongoose, { Document, Schema } from 'mongoose';

export interface Banner extends Document {
    name: string;
    image: string;
    link?: string;
    type: 'home_top' | 'home_middle' | 'home_bottom' | 'category';
    status: 'active' | 'inactive';
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const bannerSchema = new Schema<Banner>(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        link: { type: String, required: false },
        type: {
            type: String,
            enum: ['home_top', 'home_middle', 'home_bottom', 'category'],
            default: 'home_top',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            index: true
        },
        isDeleted: { type: Boolean, default: false }
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

/*
bannerSchema.pre(/^find/, function (this: any, next) {
    this.where({ isDeleted: false });
    next();
});
*/

const BannerModel = mongoose.model<Banner>('Banner', bannerSchema);

export default BannerModel;
