import { Request, Response } from 'express';
import crypto from 'crypto';
import PaymentService from '../../services/PaymentService';
import { asyncHandler } from '../../middlewares/handlers/async';
import appConfig from '../../../config/appConfig';
import { STATUS } from '../../../constants';

class MonnifyWebhookController {
    /**
     * POST /api/v1/webhooks/monnify
     */
    handleWebhook = asyncHandler(async (req: Request, res: Response) => {
        const monnifySignature = req.headers['x-monnify-signature'] as string;
        const secretKey = appConfig.monnify.monnifySecretKey;

        // 1. Security: Validate Signature
        if (!this.isValidSignature(req.body, monnifySignature, secretKey)) {
            console.error('[WEBHOOK_ERROR] Invalid signature detected');
            return res
                .status(STATUS.UNAUTHORIZED)
                .json({ message: 'Invalid signature' });
        }

        const { eventType, eventData } = req.body;

        console.log(
            `[WEBHOOK_RECEIVED] Type: ${eventType} | Ref: ${eventData.paymentReference}`
        );

        // 2. Route the event
        // Monnify sends SUCCESSFUL_TRANSACTION for both Card and Transfer
        if (eventType === 'SUCCESSFUL_TRANSACTION') {
            await PaymentService.handleMonnifyWebhook(eventData);
        } else {
            console.log(`[WEBHOOK_INFO] Ignored event type: ${eventType}`);
        }

        // 3. Always return 200 OK to Monnify quickly to prevent retries
        res.status(STATUS.OK).send('Webhook processed');
    });

    /**
     * Validates the Monnify SHA512 Signature
     */
    private isValidSignature(
        payload: any,
        signature: string,
        secret: string
    ): boolean {
        if (!signature || !secret) return false;

        const computedSignature = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return computedSignature === signature;
    }
}

export default new MonnifyWebhookController();
