import { Router } from 'express';
import MonnifyWebhookController from '../../../api/controllers/webhooks/MonifyWebhookController';

const webhookRouter: Router = Router();

webhookRouter.post('/monnify', MonnifyWebhookController.handleWebhook);

export default webhookRouter;
