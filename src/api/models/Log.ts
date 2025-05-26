import mongoose, { Document, Schema } from 'mongoose';

export interface Log extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
}

const logSchema = new Schema<Log>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true }
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

const LogModel = mongoose.model<Log>('Log', logSchema);

export default LogModel;
