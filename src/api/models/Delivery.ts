import mongoose, { Document, Schema } from 'mongoose';
import DispatchModel from './Dispatch';
import { currentTimestamp } from './../../utils/helpers';
import OrderRepository from '../repositories/OrderRepository';
import UserService from '../services/UserService';
import { sendPushNotification } from '../libraries/firebase';

export type OrderAddress = {
    coordinates: number[];
    street: string;
    city: string;
    state: string;
    postcode: string;
    buildingNumber: string;
    label: string;
    additionalInfo: string;
};

export interface Delivery extends Document {
    order: mongoose.Types.ObjectId;
    rider?: mongoose.Types.ObjectId | null;
    dispatch: mongoose.Types.ObjectId | null;
    deliveryCode: string;
    deliveryFee: number;
    status:
        | 'pending'
        | 'accepted'
        | 'picked'
        | 'in-transit'
        | 'delivered'
        | 'canceled';
    pickup: OrderAddress;
    destination: OrderAddress;
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
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: false },
        package: {},
        dispatch: {
            type: Schema.Types.ObjectId,
            ref: 'Dispatch',
            required: false
        },
        status: { type: String, required: true, default: 'pending' },
        deliveryCode: { type: String, required: false },
        deliveryFee: { type: Number, required: true },
        pickup: {
            coordinates: [Number],
            street: String,
            city: String,
            state: String,
            postcode: String,
            buildingNumber: String,
            label: String,
            additionalInfo: String
        },
        destination: {
            coordinates: [Number],
            street: String,
            city: String,
            state: String,
            postcode: String,
            buildingNumber: String,
            label: String,
            additionalInfo: String
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
        estimatedDeliveryTime: { type: Date, required: false },
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
                dispatch: this.dispatch,
                status: { $ne: 'delivered' }
            }).countDocuments()) === 0;
        if (allDelivered) {
            await DispatchModel.findByIdAndUpdate(this.dispatch, {
                status: 'completed',
                endTime: currentTimestamp()
            });
        }
    } else if (this.status === 'in-transit') {
        const order = await OrderRepository.updateOrder(
            this.order._id.toString(),
            {
                status: 'dispatched',
                dispatchedAt: currentTimestamp()
            }
        );
        if (order) {
            const customer = await UserService.getUserDetail(
                order?.user?._id.toString()
            );
            if (customer && customer.deviceToken) {
                await sendPushNotification(
                    customer.deviceToken,
                    'Your food is on the way',
                    `Dear ${customer.firstName}/nYour order has been dispatched to your destination.`
                );
            }
        }
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
    dispatch,
    status
) {
    return this.updateMany({ dispatch }, { status });
};

const DeliveryModel = mongoose.model<Delivery>('Delivery', deliverySchema);

export default DeliveryModel;
