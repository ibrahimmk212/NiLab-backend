import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const adminNotificationRouter: Router = Router();

export default adminNotificationRouter;
