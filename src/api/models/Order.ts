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
    code: string;
    commission: number;
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
    paymentType: 'card' | 'transfer' | 'cash' | 'wallet' | 'online' | 'pay-for-me';
    paymentReference: string; // The NanoID Reference (ORD-XXXXXXXX)
    transactionReference: string; // Reference for the Wallet Transaction
    payForMeToken?: string;
    payForMeExpiresAt?: Date;
    payForMePayer?: mongoose.Types.ObjectId;
    payForMeStatus?: 'pending' | 'completed' | 'expired';
    paymentCompleted: boolean;
    vat: number;
    deliveryAccepted: boolean;
    deliveryAddress: string;
    deliveryLocation: number[];
    pickup: OrderAddress;
    deliveryTime?: string;
    destination: OrderAddress;
    senderDetails: { name: string; contactNumber: string };
    receiverDetails: { name: string; contactNumber: string };
    pickupTime: string;
    acceptedAt: number;
    preparedAt: number;
    dispatchedAt: number;
    deliveredAt: Date;
    canceledAt: number;
    canceledReason: string;
    completed: boolean;
    refunded: boolean;
    refundedAt: Date;
    remark: string;
    isSettled: boolean;
    settledAt: Date;
    status:
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
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', index: true },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider', index: true },
        dispatch: { type: Schema.Types.ObjectId, ref: 'Dispatch' },
        discount: { type: Schema.Types.ObjectId, ref: 'Discount' },
        package: {
            description: { type: String },
            image: { type: String }
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
        // Unique Clean Code for Customer/Rider (e.g., 6-digit or NanoID)
        code: { type: String, required: true, unique: true, index: true },

        status: {
            type: String,
            required: true,
            default: 'pending',
            enum: [
                'pending',
                'preparing',
                'prepared',
                'dispatched',
                'delivered',
                'canceled'
            ],
            index: true
        },
        orderType: {
            type: String,
            required: true,
            default: 'products',
            enum: ['products', 'package']
        },
        paymentCompleted: { type: Boolean, default: false },
        amount: { type: Number, required: true },
        commission: { type: Number, default: 0 },
        deliveryFee: { type: Number, required: true, default: 0 },
        serviceFee: { type: Number, required: true, default: 0 },
        discountAmount: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: true },
        paymentType: {
            type: String,
            required: true,
            enum: ['card', 'transfer', 'cash', 'wallet', 'online', 'pay-for-me']
        },
        // Using NanoID for these unique references
        paymentReference: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        transactionReference: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        // Pay For Me Fields
        payForMeToken: {
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        payForMeExpiresAt: {
            type: Date
        },
        payForMePayer: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        payForMeStatus: {
            type: String,
            enum: ['pending', 'completed', 'expired'],
            default: 'pending'
        },

        vat: { type: Number, required: true, default: 0 },
        pickupLocation: {
            type: [Number],
            default: [],
            index: '2dsphere',
            required: true
        },
        rated: { type: Boolean, default: false },
        delivery: { type: Boolean, default: false },
        deliveryAccepted: { type: Boolean, default: false },
        deliveryAddress: { type: String },
        deliveryLocation: {
            type: [Number],
            default: [],
            index: '2dsphere',
            required: true
        },

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
        deliveryTime: {
            type: String,
            required: false,
            default: null
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
        receiverDetails: { name: String, contactNumber: String },
        senderDetails: { name: String, contactNumber: String },
        pickupTime: String,

        completed: { type: Boolean, default: false, index: true },
        completedBy: { type: String, enum: ['user', 'vendor', 'rider'] },
        acceptedAt: { type: Number },
        preparedAt: { type: Number },
        dispatchedAt: { type: Number },
        deliveredAt: { type: Date },
        canceledAt: { type: Number },
        isSettled: {
            type: Boolean,
            default: false
        },
        settledAt: {
            type: Date
        },
        canceledReason: { type: String },
        refunded: { type: Boolean, default: false },
        refundedAt: { type: Date },
        remark: { type: String, required: false }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for common queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, vendor: 1 });

// Pre-save hook for status timestamps and side-effects
orderSchema.pre<Order>('save', async function (next) {
    // Logic for when vendor accepts order
    const userId = (this.user as any)._id
        ? (this.user as any)._id.toString()
        : this.user.toString();
    if (
        this.isModified('status') &&
        this.status === 'preparing' &&
        this.orderType === 'products'
    ) {
        this.acceptedAt = currentTimestamp();

        try {
            const delivery = await DeliveryService.createDelivery(this._id);
            if (!delivery) throw new Error('Delivery creation failed');

            const customer = await UserService.getUserDetail(userId);
            if (customer?.deviceToken) {
                await sendPushNotification(
                    customer.deviceToken,
                    'Order Accepted',
                    `Dear ${customer.firstName}, your order has been accepted and is being prepared.`
                );
            }
        } catch (error: any) {
            return next(error);
        }
    }

    // Logic for when food is ready
    else if (this.isModified('status') && this.status === 'prepared') {
        this.preparedAt = currentTimestamp();
        const customer = await UserService.getUserDetail(userId);
        if (customer?.deviceToken) {
            await sendPushNotification(
                customer.deviceToken,
                'Food is ready',
                `Dear ${customer.firstName}, your order is ready for pickup.`
            );
        }
        (this.constructor as IOrderModel).getAverageReadyTime(this.vendor);
    }

    next();
});

orderSchema.statics.getAverageReadyTime = async function (vendorId: any) {
    const obj = await this.aggregate([
        {
            $match: {
                vendor: vendorId,
                preparedAt: { $exists: true },
                acceptedAt: { $exists: true }
            }
        },
        {
            $group: {
                _id: '$vendor',
                averageReadyTime: {
                    $avg: { $subtract: ['$preparedAt', '$acceptedAt'] }
                }
            }
        }
    ]);

    if (obj.length > 0) {
        await mongoose.model('Vendor').findByIdAndUpdate(vendorId, {
            averageReadyTime: obj[0].averageReadyTime
        });
    }
};

const OrderModel = mongoose.model<Order, IOrderModel>('Order', orderSchema);

export default OrderModel;
