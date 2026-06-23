import { Router } from 'express';
import PaystackWebhookController from '../../../api/controllers/webhooks/PaystackWebhookController';

const webhookRouter: Router = Router();

webhookRouter.post('/paystack', PaystackWebhookController.handleWebhook);

export default webhookRouter;
