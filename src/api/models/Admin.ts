import mongoose, { Document, Schema } from 'mongoose';

export interface Admin extends Document {
    name: string;
    role: string;
    userId?: mongoose.Types.ObjectId;
}

const adminSchema = new Schema<Admin>(
    {
        name: { type: String, required: true },
        role: { type: String, required: true },
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

const AdminModel = mongoose.model<Admin>('Admin', adminSchema);

export default AdminModel;
