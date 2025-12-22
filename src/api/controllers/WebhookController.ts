import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { LoginType, SignUpType, VerifyOTP } from '../types/auth';
import { STATUS } from '../../constants';
import { asyncHandler } from '../middlewares/handlers/async';
import JWT from '../../utils/jwt';
import UserService from '../services/UserService';
import UserRepository from '../repositories/UserRepository';
import AdminService from '../services/AdminService';
import MonnifyApi from '../libraries/monnify/config';
import monnify from '../libraries/monnify';
import MonnifyEventHandler from '../libraries/monnify/MonnifyEventHandler';
import OrderService from '../services/OrderService';
import TransactionService from '../services/TransactionService';
import CollectionService from '../services/CollectionService';
import emails from '../libraries/emails';

class WebhookController {
    monnifyEvent = asyncHandler(async (req: Request, res: Response) => {
        const hashValue = req.headers['monnify-signature'];
        const payload = req.body;

        // const computedHash = MonnifyEventHandler.computedHash(payload);
        // if (hashValue !== computedHash) {
        //     console.log('hash', hashValue, '-', computedHash);
        //     return res.sendStatus(STATUS.BAD_REQUEST);
        // }

        const { eventType, eventData } = payload;

        console.log('eventData', eventData);
        const collection = await CollectionService.createCollection({
            ...eventData,
            userId: eventData.metaData?.userId
        });
        console.log('collection', collection);
        // get order
        const order = await OrderService.getOrderByReference(
            eventData.paymentReference
        );
        console.log('order', order);
        if (!order) return res.sendStatus(STATUS.BAD_REQUEST);

        if (order.paymentCompleted) return res.sendStatus(STATUS.BAD_REQUEST);

        order.paymentCompleted = true;
        await order.save();

        const transaction = await TransactionService.createTransaction({
            amount: eventData.amountPaid,
            user: order.user,
            order: order.id,
            type: 'DEBIT',
            remark: 'Order Payment',
            status: 'successful',
            reference: order.paymentReference
        });

        console.log(order);
        //  notify vendor
        const vendor: any = order.vendor;
        emails.vendorOrder(vendor?.email, {
            orderDetailsUrl: `https://mdsxpress.com/vendor/order-details/${order.id}`,
            orderId: order.code,
            orderItems: order.products,
            vendorName: vendor.name
        });
        return res.sendStatus(STATUS.OK);
    });
}

export default new WebhookController();
