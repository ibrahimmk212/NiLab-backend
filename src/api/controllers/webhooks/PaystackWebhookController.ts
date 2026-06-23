import { Request, Response } from 'express';
import crypto from 'crypto';
import PaymentService from '../../services/PaymentService';
import { asyncHandler } from '../../middlewares/handlers/async';
import appConfig from '../../../config/appConfig';

class PaystackWebhookController {
    handleWebhook = asyncHandler(async (req: Request, res: Response) => {
        const signature = req.headers['x-paystack-signature'] as string;
        const secretKey = appConfig.paystack.secretKey;

        // Signature Validation (Bypass in Development for easy local testing)
        const isDev = appConfig.app.isDevelopment;
        
        if (isDev) {
            console.log('[Paystack Webhook] Signature verification bypassed in development mode.');
        } else if (!this.isValidSignature(req.body, signature, secretKey)) {
            console.warn('[Paystack Webhook] Invalid Signature received.');
            return res.status(401).json({ message: 'Invalid signature' });
        }

        const payload = req.body;

        if (payload.event === 'charge.success') {
            await PaymentService.handlePaystackWebhook(payload);
        } else if (
            payload.event === 'transfer.success' ||
            payload.event === 'transfer.failed' ||
            payload.event === 'transfer.reversed'
        ) {
            await PaymentService.handlePaystackDisbursementWebhook(payload);
        }

        // Always return 200 to prevent retries
        res.status(200).send('Ok');
    });

    private isValidSignature(
        payload: any,
        signature: string,
        secret: string
    ): boolean {
        if (!signature || !secret) return false;
        const text = JSON.stringify(payload);
        const hash = crypto
            .createHmac('sha512', secret)
            .update(text)
            .digest('hex');
        return hash === signature;
    }
}

export default new PaystackWebhookController();
