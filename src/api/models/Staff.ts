import mongoose, { Document, Schema } from 'mongoose';
import { deflate } from 'zlib';

export interface Staff extends Document {
    name: string;
    email: string;
    role: string;
    vendor: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    status: 'suspended' | 'active';
}

const staffSchema = new Schema<Staff>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, required: true, default: 'active' }
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

const StaffModel = mongoose.model<Staff>('Staff', staffSchema);

export default StaffModel;
