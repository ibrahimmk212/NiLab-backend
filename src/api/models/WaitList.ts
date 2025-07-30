import mongoose, { Document, Schema } from 'mongoose';

export interface WaitList extends Document {
    phone: string;
    email: string;
    firstname: string;
    lastname: string;
    state: string;
}

const waitListSchema = new Schema<WaitList>(
    {
        phone: { type: String, required: true },
        email: { type: String, required: false },
        firstname: { type: String, required: true },
        lastname: { type: String, required: false },
        state: { type: String, required: true },
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
const WaitListModel = mongoose.model<WaitList>('WaitList', waitListSchema);

export default WaitListModel;
