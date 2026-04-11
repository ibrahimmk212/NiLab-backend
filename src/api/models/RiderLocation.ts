import mongoose, { Document, Schema } from 'mongoose';

export interface RiderLocation extends Document {
    rider: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    location: {
        type: string;
        coordinates: number[];
    };
    timestamp: Date;
}

const RiderLocationSchema = new Schema(
    {
        rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: false, index: true },
        location: {
            type: { type: String, default: 'Point' },
            coordinates: { type: [Number], index: '2dsphere' }
        },
        timestamp: { type: Date, default: Date.now, index: true }
    },
    { timestamps: true }
);

// TTL index to automatically delete records older than 30 days (optional, but good for performance)
RiderLocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const RiderLocationModel = mongoose.model<RiderLocation>(
    'RiderLocation',
    RiderLocationSchema
);

export default RiderLocationModel;
