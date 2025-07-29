import mongoose, { Document, Schema } from 'mongoose';
import { currentTimestamp } from './../../utils/helpers';

export interface Dispatch extends Document {
    rider: mongoose.Types.ObjectId;
    deliveries: mongoose.Types.ObjectId[]; // Array of delivery IDs
    status: 'created' | 'in-progress' | 'completed' | 'cancelled';
    route?: {
        summary: string; // A brief summary of the route
        estimatedDuration: number; // In minutes
        estimatedDistance: number; // In kilometers
    };
    startTime?: Date; // When the dispatch started
    endTime?: Date; // When the dispatch was completed
    // Additional fields...
}

const dispatchSchema = new Schema(
    {
        rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: true },
        deliveries: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Delivery',
                required: true,
                default: []
            }
        ],
        status: { type: String, required: true, default: 'created' },
        route: {
            summary: { type: String, required: false },
            estimatedDuration: { type: Number, required: false },
            estimatedDistance: { type: Number, required: false }
        },
        startTime: { type: Date, required: true, default: currentTimestamp() },
        endTime: { type: Date }
        // Additional fields...
    },
    { timestamps: true }
);

dispatchSchema.statics.findByRider = async function (
    rider,
    { status, startDate, endDate }
) {
    const query: any = { rider };
    if (status) query.status = status;
    if (startDate && endDate)
        query.createdAt = { $gte: startDate, $lte: endDate };

    return this.find(query);
};

dispatchSchema.statics.findByRider = async function (
    rider,
    { status, startDate, endDate }
) {
    const query: any = { rider };
    if (status) query.status = status;
    if (startDate && endDate)
        query.createdAt = { $gte: startDate, $lte: endDate };

    return this.find(query);
};

const DispatchModel = mongoose.model<Dispatch>('Dispatch', dispatchSchema);

export default DispatchModel;
