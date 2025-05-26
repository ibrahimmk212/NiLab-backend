import mongoose, { Document, Schema } from 'mongoose';

export interface Configuration extends Document {
    vendorId: mongoose.Types.ObjectId;
    commissionFee: number;
    riderId: mongoose.Types.ObjectId;
}

const configurationSchema = new Schema<Configuration>(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        commissionFee: { type: Number, required: true },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider' }
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

const ConfigurationModel = mongoose.model<Configuration>(
    'Configuration',
    configurationSchema
);

export default ConfigurationModel;
