import { Request, Response } from 'express';
import crypto from 'crypto';
import PaymentService from '../../services/PaymentService';
import { asyncHandler } from '../../middlewares/handlers/async';
import appConfig from '../../../config/appConfig';
import { STATUS } from '../../../constants';

class MonnifyWebhookController {
    handleWebhook = asyncHandler(async (req: Request, res: Response) => {
        const monnifySignature = req.headers['x-monnify-signature'] as string;
        const secretKey = appConfig.monnify.monnifySecretKey;

        // 1. Signature Validation
        // Note: Use req.body but ensure it hasn't been transformed
        if (!this.isValidSignature(req.body, monnifySignature, secretKey)) {
            return res
                .status(STATUS.UNAUTHORIZED)
                .json({ message: 'Unauthorized' });
        }

        const payload = req.body;

        /**
         * Monnify Disbursement Event Types:
         * - DISBURSEMENT_SUCCESSFUL
         * - DISBURSEMENT_FAILED
         * - DISBURSEMENT_REVERSED
         */
        if (payload.eventType && payload.eventType.startsWith('DISBURSEMENT')) {
            await PaymentService.handleMonnifyDisbursementWebhook(
                payload.eventData
            );
        } else if (payload.eventType === 'SUCCESSFUL_TRANSACTION') {
            await PaymentService.handleMonnifyWebhook(payload.eventData);
        }

        // Always return 200 quickly to prevent Monnify from retrying
        res.status(200).send('Ok');
    });

    private isValidSignature(
        payload: any,
        signature: string,
        secret: string
    ): boolean {
        const text = JSON.stringify(payload);
        const hash = crypto
            .createHmac('sha512', secret)
            .update(text)
            .digest('hex');
        return hash === signature;
    }
}
export default new MonnifyWebhookController();
