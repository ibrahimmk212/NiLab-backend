import mongoose, { Document, Schema } from 'mongoose';
import DispatchModel from './Dispatch';
import { currentTimestamp } from './../../utils/helpers';
import OrderRepository from '../repositories/OrderRepository';

export interface Delivery extends Document {
    orderId: mongoose.Types.ObjectId;
    riderId?: mongoose.Types.ObjectId | null;
    dispatchId: mongoose.Types.ObjectId | null;
    deliveryCode: number;
    status: 'pending' | 'in-transit' | 'delivered' | 'canceled';
    pickup: {
        name: string; // e.g., "Home", "Office"
        address: string; // Full address
        lat: number;
        long: number;
    };
    destination: {
        name: string; // e.g., "Home", "Office"
        address: string; // Full address
        lat: number;
        long: number;
    };
    senderDetails: {
        name: string;
        contactNumber: string;
    };
    receiverDetails: {
        name: string;
        contactNumber: string;
    };
    specialInstructions: string; // Any special delivery instructions
    estimatedDeliveryTime: number; // Estimated delivery time
    actualDeliveryTime?: number; // Actual delivery time, if available
    // Additional fields...
}

const deliverySchema = new Schema(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider', required: true },
        package: {},
        dispatchId: {
            type: Schema.Types.ObjectId,
            ref: 'Dispatch',
            required: true
        },
        status: { type: String, required: true },
        deliveryCode: { type: Number, required: true },
        pickup: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            lat: { type: Number, required: true },
            long: { type: Number, required: true }
        },
        destination: {
            name: { type: String, required: true },
            address: { type: String, required: true },
            lat: { type: Number, required: true },
            long: { type: Number, required: true }
        },
        receiverDetails: {
            name: { type: String, required: true },
            contactNumber: { type: String, required: true }
        },
        senderDetails: {
            name: { type: String, required: true },
            contactNumber: { type: String, required: true }
        },
        specialInstructions: { type: String },
        estimatedDeliveryTime: { type: Date, required: true },
        actualDeliveryTime: { type: Date }
        // Additional fields...
    },
    { timestamps: true }
);

deliverySchema.post('save', async function () {
    // Check if the current update is marking the delivery as delivered
    if (this.status === 'delivered') {
        const allDelivered =
            (await DeliveryModel.find({
                dispatchId: this.dispatchId,
                status: { $ne: 'delivered' }
            }).countDocuments()) === 0;
        if (allDelivered) {
            await DispatchModel.findByIdAndUpdate(this.dispatchId, {
                status: 'completed',
                endTime: currentTimestamp()
            });
        }
    } else if (this.status === 'in-transit') {
        await OrderRepository.updateOrder(this.orderId.toString(), {
            dispatchedAt: currentTimestamp()
        });
    }
});

deliverySchema.statics.findForRider = async function (
    riderId,
    { startDate, endDate }
) {
    return this.find({
        riderId,
        createdAt: { $gte: startDate, $lte: endDate }
    });
};

deliverySchema.statics.updateStatusForDispatch = async function (
    dispatchId,
    status
) {
    return this.updateMany({ dispatchId }, { status });
};

const DeliveryModel = mongoose.model<Delivery>('Delivery', deliverySchema);

export default DeliveryModel;
