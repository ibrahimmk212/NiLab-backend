import mongoose, { Document, Model, Schema } from 'mongoose';
import DeliveryService from '../services/DeliveryService';
import { currentTimestamp } from '../../utils/helpers';
import { sendPushNotification } from '../libraries/firebase';
import UserService from '../services/UserService';

export interface OrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    category: string;
    quantity: number;
    price: number;
}

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
export interface Order extends Document {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    rider?: mongoose.Types.ObjectId;
    dispatch?: mongoose.Types.ObjectId;
    code: number;
    commision?: number;
    products: OrderItem[];
    package: {
        description: string;
        image: string;
    };
    completedBy?: 'user' | 'vendor' | 'rider';
    amount: number;
    pickupLocation: number[];
    delivery: boolean;
    rated: boolean;
    deliveryFee: number;
    serviceFee: number;
    discountAmount: number;
    discount?: mongoose.Types.ObjectId;
    totalAmount: number;
    orderType: 'products' | 'package';
    paymentType: 'card' | 'transfer' | 'cash' | 'wallet' | 'online';
    paymentReference: string;
    transactionReference: string;
    paymentCompleted: boolean;
    vat: number;
    deliveryAccepted: boolean;
    deliveryAddress: string;
    deliveryLocation: number[];

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
    pickupTime: string;
    acceptedAt: number;
    preparedAt: number;
    dispatchedAt: number;
    deliveredAt: number;
    canceledAt: number;
    canceledReason: string;

    completed?: boolean;
    status?:
        | 'pending'
        | 'preparing'
        | 'prepared'
        | 'dispatched'
        | 'delivered'
        | 'canceled';
}

interface IOrderModel extends Model<Order> {
    getAverageReadyTime(vendorId: any): Promise<void>;
}

const orderSchema = new Schema<Order>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor'
        },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
        dispatch: { type: Schema.Types.ObjectId, ref: 'Dispatch' },
        discount: { type: Schema.Types.ObjectId, ref: 'Discount' },
        package: {
            description: { type: String, required: false },
            image: { type: String, required: false }
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                name: { type: String, required: true },
                category: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        code: { type: Number, required: true },
        status: { type: String, required: true, default: 'pending' },
        orderType: { type: String, required: true, default: 'products' },
        paymentCompleted: { type: Boolean, required: false, default: false },
        amount: { type: Number, required: true },
        commision: { type: Number, required: false },
        deliveryFee: { type: Number, required: true, default: 0 },
        serviceFee: { type: Number, required: true, default: 0 },
        discountAmount: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: false },
        paymentType: { type: String, required: true },
        paymentReference: { type: String, required: false },
        transactionReference: { type: String, required: false },
        vat: { type: Number, required: true, default: 0 },
        pickupLocation: { type: [Number], required: false },
        rated: { type: Boolean, required: true, default: false },
        delivery: { type: Boolean, required: true, default: false },
        deliveryAccepted: { type: Boolean, required: true, default: false },
        deliveryAddress: { type: String, required: false },
        deliveryLocation: { type: [Number], required: false },

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
            name: String,
            contactNumber: String
        },
        senderDetails: {
            name: String,
            contactNumber: String
        },
        pickupTime: String,

        completed: { type: Boolean, required: true, default: false },
        completedBy: { type: String, required: false },
        acceptedAt: { type: Number, required: false },
        preparedAt: { type: Number, required: false },
        dispatchedAt: { type: Number, required: false },
        deliveredAt: { type: Number, required: false },
        canceledAt: { type: Number, required: false },
        canceledReason: { type: String, required: false }
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

// Pre-save hook
orderSchema.pre<Order>('save', async function (next) {
    if (
        this.isModified('status') &&
        this.status === 'preparing' &&
        this.orderType == 'products'
    ) {
        this.acceptedAt = currentTimestamp();

        const delivery = await DeliveryService.createDelivery(this._id);
        if (!delivery) {
            console.log(delivery);
            throw new Error('Delivery not created, please try again.');
        }
        const customer = await UserService.getUserDetail(
            this.user._id.toString()
        );
        if (customer && customer.deviceToken) {
            await sendPushNotification(
                customer.deviceToken,
                'Order Accepted',
                `Dear ${customer.firstName}/nYour order has been accepted and currently being prepared.`
            );
        }
    } else if (this.isModified('status') && this.status === 'prepared') {
        this.preparedAt = currentTimestamp();
        const customer = await UserService.getUserDetail(
            this.user._id.toString()
        );
        if (customer && customer.deviceToken) {
            await sendPushNotification(
                customer.deviceToken,
                'Food is ready',
                `Dear ${customer.firstName}/nYour order has been prepared. waiting for rider to come and pick it up.`
            );
        }
        // Cast this.constructor to IOrderModel to access custom static methods
        (this.constructor as IOrderModel).getAverageReadyTime(this.vendor);
    }
    next();
});

// Static method
orderSchema.statics.getAverageReadyTime = async function (vendorId: any) {
    const obj = await this.aggregate([
        { $match: { vendor: vendorId } },
        {
            $group: {
                _id: '$vendor',
                averageReadyTime: {
                    $avg: {
                        $subtract: ['$preparedAt', '$acceptedAt']
                    }
                }
            }
        }
    ]);

    if (obj.length > 0) {
        try {
            await mongoose.model('Vendor').findByIdAndUpdate(vendorId, {
                averageReadyTime: obj[0].averageReadyTime
            });
        } catch (error) {
            console.error(error);
        }
    }
};

const OrderModel = mongoose.model<Order>('Order', orderSchema);

export default OrderModel;
