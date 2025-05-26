import mongoose, { Document, Schema } from 'mongoose';

export interface PerformanceMetrics extends Document {
    riderId: mongoose.Types.ObjectId;
    deliveryTime: number;
    acceptanceRate: number;
}

const performanceMetricsSchema = new Schema<PerformanceMetrics>(
    {
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider', required: true },
        deliveryTime: { type: Number, required: true },
        acceptanceRate: { type: Number, required: true }
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

const PerformanceMetricsModel = mongoose.model<PerformanceMetrics>(
    'PerformanceMetrics',
    performanceMetricsSchema
);

export default PerformanceMetricsModel;
