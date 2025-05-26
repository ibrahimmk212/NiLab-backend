import mongoose, { Document, Schema } from 'mongoose';

export interface Notification extends Document {
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    riderId: mongoose.Types.ObjectId;
    message: string;
    status: 'unread' | 'read';
}

const notificationSchema = new Schema<Notification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider' },
        message: { type: String, required: true },
        status: { type: String, required: true }
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

const NotificationModel = mongoose.model<Notification>(
    'Notification',
    notificationSchema
);

export default NotificationModel;
