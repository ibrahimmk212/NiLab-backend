import { Router } from 'express';
import riderLocationController from '../../../controllers/riders/RiderLocationController';

const locationRouter: Router = Router();

locationRouter.post('/heartbeat', riderLocationController.heartbeat);
locationRouter.get('/history', riderLocationController.getHistory);

export default locationRouter;
