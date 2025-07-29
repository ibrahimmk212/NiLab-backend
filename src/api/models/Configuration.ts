import mongoose, { Document, Schema } from 'mongoose';

export interface IState {
    name: string;
    slug: string;
    coordinates: number[];
}
export interface ICity {
    name: string;
    slug: string;
    coordinates: number[];
    state: string;
}
export interface Configuration extends Document {
    // vendorId: mongoose.Types.ObjectId;
    // commissionFee: number;
    // riderId: mongoose.Types.ObjectId;
    nearbyDistance: number;
    serviceFee: number;
    maxServiceFee: number;
    packageDeliveryCommision: number;
    maxPackageDeliveryCommision: number;
    payOnDeliveryDiscount: number;
    vatRate: number;
    deliveryFee: number;
    maxDeliveryFee: number;
    serviceStates: IState[];
    serviceCities: ICity[];
    openingHour: string;
    closingHour: string;
}

const configurationSchema = new Schema<Configuration>(
    {
        nearbyDistance: { type: Number, required: false, default: 2000 },
        serviceFee: { type: Number, required: false, default: 100 },
        maxServiceFee: { type: Number, required: false, default: 100 },
        vatRate: { type: Number, required: false, default: 1.5 },
        packageDeliveryCommision: {
            type: Number,
            required: false,
            default: 40
        },
        maxPackageDeliveryCommision: {
            type: Number,
            required: false,
            default: 500
        },
        deliveryFee: { type: Number, required: false, default: 40 },
        maxDeliveryFee: { type: Number, required: false, default: 500 },
        payOnDeliveryDiscount: { type: Number, required: false, default: 2 },
        serviceStates: [
            {
                name: String,
                slug: String,
                coordinates: [Number]
            }
        ],
        serviceCities: [
            {
                name: String,
                slug: String,
                coordinates: [Number],
                state: String
            }
        ],
        openingHour: { type: String, required: false, default: '9:00' },
        closingHour: { type: String, required: false, default: '20:00' }
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
