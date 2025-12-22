import mongoose, { Document, Schema } from 'mongoose';

export interface File extends Document {
    name: string;
    url: string;
    size: number;
    type: string;
    fileId: string;
}

const fileSchema = new Schema<File>(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, required: true },
        type: { type: String, required: true },
        fileId: { type: String, required: true }
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

const FileModel = mongoose.model<File>('File', fileSchema);

export default FileModel;
