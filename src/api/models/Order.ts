import mongoose, { Document, Model, Schema } from 'mongoose';
import DeliveryService from '../services/DeliveryService';
import { currentTimestamp } from '../../utils/helpers';

export interface OrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    category: string;
    quantity: number;
    price: number;
}
export interface Order extends Document {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    rider?: mongoose.Types.ObjectId;
    dispatch?: mongoose.Types.ObjectId;
    code: number;
    commision?: number;
    products: OrderItem[];
    completedBy?: 'user' | 'vendor' | 'rider';
    amount: number;
    pickupLocation: number[];
    delivery: boolean;
    rated: boolean;
    deliveryFee: number;
    tip: number;
    serviceFee: number;
    paymentType: 'card' | 'transfer' | 'cash' | 'wallet' | 'virtual' | 'online';
    paymentReference: string;
    transactionReference: string;
    paymentCompleted: boolean;
    vat: number;
    deliveryAccepted: boolean;
    deliveryAddress: string;
    deliveryLocation: number[];

    acceptedAt: number;
    preparedAt: number;
    dispatchedAt: number;
    deliveredAt: number;
    canceledAt: number;

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
    getAverageCost(vendorId: any): Promise<void>;
}

const orderSchema = new Schema<Order>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },
        rider: { type: Schema.Types.ObjectId, ref: 'Rider' },
        dispatch: { type: Schema.Types.ObjectId, ref: 'Dispatch' },

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
        paymentCompleted: { type: Boolean, required: false, default: false },
        amount: { type: Number, required: true },
        commision: { type: Number, required: false },
        deliveryFee: { type: Number, required: true, default: 0 },
        tip: { type: Number, required: false, default: 0 },
        serviceFee: { type: Number, required: true, default: 0 },
        paymentType: { type: String, required: true },
        paymentReference: { type: String, required: false },
        transactionReference: { type: String, required: false },
        vat: { type: Number, required: true, default: 0 },
        pickupLocation: { type: [Number], required: false },
        rated: { type: Boolean, required: true, default: false },
        delivery: { type: Boolean, required: true, default: false },
        deliveryAccepted: { type: Boolean, required: true, default: false },
        deliveryAddress: { type: String, required: true },
        deliveryLocation: { type: [Number], required: true },
        completed: { type: Boolean, required: true, default: false },
        completedBy: { type: String, required: false },

        acceptedAt: { type: Number, required: false },
        preparedAt: { type: Number, required: false },
        dispatchedAt: { type: Number, required: false },
        deliveredAt: { type: Number, required: false },
        canceledAt: { type: Number, required: false }
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
    if (this.isModified('status') && this.status === 'preparing') {
        this.acceptedAt = currentTimestamp();
        const delivery = await DeliveryService.createDelivery(this._id);
        if (!delivery)
            throw new Error('Delivery not created, please try again.');
    } else if (this.isModified('status') && this.status === 'prepared') {
        this.preparedAt = currentTimestamp();
        // Cast this.constructor to IOrderModel to access custom static methods
        (this.constructor as IOrderModel).getAverageCost(this.vendor);
    }
    next();
});

// Static method
orderSchema.statics.getAverageCost = async function (vendorId: any) {
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
