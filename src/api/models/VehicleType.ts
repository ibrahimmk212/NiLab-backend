import mongoose, { Document, Schema } from 'mongoose';

export interface VehicleType extends Document {
    name: string;
    slug: string;
    feePerKm: number;
    icon: string;
    active: boolean;
}

const VehicleTypeSchema = new Schema(
    {
        name: { type: String, required: true }, // 'Bike', 'Mini-Van'
        slug: { type: String, required: true, unique: true }, // 'bike', 'mini-van'
        feePerKm: { type: Number, required: true },
        icon: String,
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const VehicleTypeModel = mongoose.model<VehicleType>(
    'VehicleType',
    VehicleTypeSchema
);

export default VehicleTypeModel;
