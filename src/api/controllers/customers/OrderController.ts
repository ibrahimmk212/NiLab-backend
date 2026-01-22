// controllers/customers/OrderController.ts
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../services/OrderService';
import PaymentService from '../../services/PaymentService';

class OrderController {
    getAllOrder = asyncHandler(async (req: any, res: Response) => {
        const { userdata }: any = req;
        const order = await OrderService.getAll({
            customerId: userdata.id,
            ...req.query
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
            }
        });
    });

    // Parcel/Package Delivery
    createDeliveryOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const order = await OrderService.createPackageOrder({
            ...req.body,
            user: userdata.id
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
            }
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
}

export default new OrderController();
