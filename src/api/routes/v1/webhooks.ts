import { Router } from 'express';
import WebhookController from '../../controllers/WebhookController';

const webhookRouter: Router = Router();

webhookRouter.post('/monnify', WebhookController.monnifyEvent);

export default webhookRouter;
