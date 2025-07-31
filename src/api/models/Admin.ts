import mongoose, { Document, Schema } from 'mongoose';

export interface Admin extends Document {
    name: string;
    role: 'admin' | 'agent';
    userId: mongoose.Types.ObjectId;
    status: 'suspended' | 'active';
    phone: string;
    email: string;
}

const adminSchema = new Schema<Admin>(
    {
        name: { type: String, required: true },
        role: { type: String, required: true },
        phone: { type: String, required: false },
        email: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

const AdminModel = mongoose.model<Admin>('Admin', adminSchema);

export default AdminModel;
