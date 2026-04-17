import mongoose, { Document, Schema } from 'mongoose';

export interface Staff extends Document {
    name: string;
    email: string;
    role: string;
    vendor: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    status: 'suspended' | 'active';
    permissions: string[];
}

const staffSchema = new Schema<Staff>(
    {
        name: { type: String },
        email: { type: String },
        role: { type: String, required: true, default: 'staff' },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, required: true, default: 'active' },
        permissions: [{ type: String, default: [] }]
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
