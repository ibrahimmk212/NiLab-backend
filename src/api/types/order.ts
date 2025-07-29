import mongoose from 'mongoose';
import { OrderAddress, OrderItem } from '../models/Order';

export type CreateOrderType = {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    products: OrderItem[];
    amount: number;
    // deliveryAddress: string;
    // deliveryLocation: number[];
    // pickupLocation: number[];
    paymentType: 'card' | 'transfer' | 'cash';
    code: number;
    // deliveryFee: number;
    // serviceFee: number;
    distance?: number;
    couponId?: string;
    vat: number;
    addressId?: mongoose.Types.ObjectId;
};

export type CreatePackageOrderType = {
    user: mongoose.Types.ObjectId;
    package: {
        description: string;
        image: string;
    };
    pickup: OrderAddress;
    destination: OrderAddress;
    // pickup: mongoose.Types.ObjectId;
    // destination: mongoose.Types.ObjectId;
    senderDetails: {
        name: string;
        contactNumber: string;
    };
    receiverDetails: {
        name: string;
        contactNumber: string;
    };
    // pickupTime: string;
    code?: number;
    // deliveryFee: number;
    // serviceFee: number;
    distance: number;
    vat: number;
    paymentType: 'card' | 'transfer' | 'cash';
};

export type UpdateOrderType = {
    status?: 'accepted' | 'preparing' | 'dispatched' | 'delivered' | 'canceled';
};
