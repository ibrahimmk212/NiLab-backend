import mongoose, { Document, Schema } from 'mongoose';

export interface Admin extends Document {
    name: string;
    role: 'superadmin' | 'admin' | 'customer_care' | 'finance' | 'agent';
    userId: mongoose.Types.ObjectId;
    status: 'suspended' | 'active';
    permissions: string[];
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

const AdminModel = mongoose.model<Admin>('Admin', adminSchema);

export default AdminModel;
