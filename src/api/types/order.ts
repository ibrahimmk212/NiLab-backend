import mongoose from 'mongoose';
import { OrderItem } from '../models/Order';

export type CreateOrderType = {
    user: mongoose.Types.ObjectId;
    vendor: mongoose.Types.ObjectId;
    products: OrderItem[];
    amount: number;
    deliveryAddress: string;
    deliveryLocation: number[];
    paymentType: 'card' | 'transfer' | 'cash' | 'wallet' | 'virtual' | 'online'
    code: number;
    deliveryFee: number;
    serviceFee: number;
    reference: string;
    paymentCompleted?: boolean;
    vat: number;
};

export type UpdateOrderType = {
    status?: 'accepted' | 'preparing' | 'dispatched' | 'delivered' | 'canceled';
};
