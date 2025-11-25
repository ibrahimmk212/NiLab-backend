import { Request, Response } from 'express';
import { PaymentService } from '../../services/PaymentService';

export const monnifyWebhook = async (req: Request, res: Response) => {
    try {
        const event = req.body;

        const {
            paymentReference,
            transactionReference,
            paymentStatus,
            amountPaid
        } = event?.transactionDetails || {};

        if (!paymentReference) {
            return res
                .status(400)
                .json({ message: 'Missing paymentReference' });
        }

        // Update the order
        const order = await PaymentService.completeOrderPayment({
            paymentReference,
            transactionReference,
            amountPaid,
            status: paymentStatus
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({
            message: 'Webhook received',
            status: order.paymentCompleted ? 'updated' : 'ignored'
        });
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(500).json({ message: 'Internal error' });
    }
};
