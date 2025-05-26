import mongoose, { Document, Schema } from 'mongoose';

export interface Staff extends Document {
    // name: string;
    // email: string;
    role: string;
    vendorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
}

const staffSchema = new Schema<Staff>(
    {
        // name: { type: String, required: true },
        // email: { type: String, required: true },
        role: { type: String, required: true },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
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
// reverse populate staffs
staffSchema.virtual('user', {
    ref: 'User',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

// reverse populate staffs
staffSchema.virtual('vendor', {
    ref: 'Vendor',
    localField: '_id',
    foreignField: 'vendorId',
    justOne: true
});

const StaffModel = mongoose.model<Staff>('Staff', staffSchema);

export default StaffModel;
