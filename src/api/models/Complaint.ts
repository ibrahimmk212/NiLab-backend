import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
    user: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    category: 'wrong_item' | 'missing_item' | 'late_delivery' | 'payment_issue' | 'other';
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    images: string[];
    resolution?: string;
    resolvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        order: { type: Schema.Types.ObjectId, ref: 'Order' },
        category: {
            type: String,
            enum: [
                'wrong_item',
                'missing_item',
                'late_delivery',
                'payment_issue',
                'other'
            ],
            required: true
        },
        subject: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['open', 'in_progress', 'resolved', 'rejected'],
            default: 'open'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        images: [{ type: String }],
        resolution: { type: String },
        resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
