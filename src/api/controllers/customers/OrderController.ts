// controllers/customers/OrderController.ts
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../services/OrderService';
import PaymentService from '../../services/PaymentService';
import UserService from '../../services/UserService';
import { sendPushNotification } from '../../libraries/firebase';

class OrderController {
    getAllOrder = asyncHandler(async (req: any, res: Response) => {
        const { userdata }: any = req;
        const {
            page,
            limit,
            search,
            status,
            paymentType,
            vendorId,
            riderId,
            code,
            reference,
            startDate,
            endDate,
            sortBy,
            sortOrder,
            paymentCompleted,
            orderType
        } = req.query;

        const order = await OrderService.getAll({
            customerId: userdata.id,
            page,
            limit,
            search,
            status,
            paymentType,
            vendorId,
            riderId,
            code,
            reference,
            startDate,
            endDate,
            sortBy,
            sortOrder,
            paymentCompleted,
            orderType
        });

        res.status(STATUS.OK).json({
            success: true,
            ...order
        });
    });
    // Standard Product Order
    createOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const order = await OrderService.createOrder({
            ...req.body,
            user: userdata.id
        });
        const paymentResult: any = await PaymentService.initiateCheckout(
            order,
            userdata
        );

        res.status(STATUS.CREATED).json({
            message: 'Order created successfully',
            success: true,
            data: {
                ...order.toJSON(),
                vendor: req.body.vendor,
                user: userdata.id,
                payment: paymentResult.payment
            },
            //temporary
            payment: paymentResult.payment
        });
    });

    // Parcel/Package Delivery
    createDeliveryOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const order = await OrderService.createPackageOrder({
            ...req.body,
            user: userdata.id,
            deliveryLocation: req.body.destination?.coordinates,
            pickupLocation: req.body.pickup?.coordinates,
        });
        const paymentResult: any = await PaymentService.initiateCheckout(
            order,
            userdata
        );

        res.status(STATUS.CREATED).json({
            success: true,
            data: order,
            payment: paymentResult.payment
        });
    });

    // Fetch Details (for tracking)
    getOrderDetails = asyncHandler(async (req: Request, res: Response) => {
        const order = await OrderService.getOrderById(req.params.orderId);
        res.status(STATUS.OK).json({ success: true, data: order });
    });

    // Re-trigger checkout if first attempt failed
    checkout = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const order = await OrderService.getOrderById(req.params.orderId);
        if (!order) throw Error('Order not found');

        if (order.paymentCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Payment already confirmed for this order.'
            });
        }

        const paymentResult: any = await PaymentService.initiateCheckout(
            order,
            userdata
        );
        res.status(STATUS.OK).json({
            success: true,
            data: {
                ...order.toJSON(),
                user: userdata.id,
                vendor: order.vendor.id,
                payment: paymentResult.payment
            },
            //temporary
            payment: paymentResult.payment
        });
    });

    // Update (Confirm/Cancel)
    updateOrder = asyncHandler(async (req: Request, res: Response) => {
        const updatedOrder = await OrderService.updateOrder(
            req.params.orderId,
            req.body
        );
        res.status(STATUS.OK).json({ success: true, data: updatedOrder });
    });

    // Stub for Review (Logic would go to ReviewService)
    submitReview = asyncHandler(async (req: Request, res: Response) => {
        res.status(STATUS.OK).json({
            success: true,
            message: 'Review submitted'
        });
    });

    // Stub for Upload (Logic would go to S3/Cloudinary service)
    upload = asyncHandler(async (req: Request, res: Response) => {
        res.status(STATUS.OK).json({
            success: true,
            url: 'https://cloud.com/image.jpg'
        });
    });

    // --- PAY FOR ME ENDPOINTS ---

    getPayForMeDetails = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.params;
        const order = await OrderService.getOrderByPayForMeToken(token);
        res.status(STATUS.OK).json({
            success: true,
            message: 'Order retrieved successfully',
            data: order
        });
    });

    completePayForMe = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const { orderId, paymentMethod } = req.body;

        const result = await OrderService.completePayForMeOrder(
            orderId,
            userdata.id,
            paymentMethod
        );

        // If result has 'valid' property, it means it's an online payment initiation
        if (result.valid && result.payment) {
             return res.status(STATUS.OK).json({
                success: true,
                message: 'Payment link generated',
                data: result
            });
        }

        // Otherwise it's the completed Order object (Wallet payment)
        const updatedOrder = result;

        // Fetch Requester (Owner of the order)
        // updatedOrder.user is populated (based on OrderRepository.updateOrder)
        // We can cast it to 'any' to access fields safely at runtime
        const requesterDetails = updatedOrder.user as any;
        const payer = userdata; 

        // 1. Notify Requester
        if (requesterDetails?.deviceToken) {
            await sendPushNotification(
                requesterDetails.deviceToken,
                'Order Paid!',
                `Great news! ${payer.firstName} has paid for your order.`
            );
        }

        // 2. Notify Payer (Confirmation)
        if (payer?.deviceToken) {
            await sendPushNotification(
                payer.deviceToken,
                'Payment Successful',
                `You have successfully paid for ${requesterDetails?.firstName || 'User'}'s order.`
            );
        }

        res.status(STATUS.OK).json({
            success: true,
            message: 'Order paid successfully via Pay For Me'
        });
    });
}

export default new OrderController();
