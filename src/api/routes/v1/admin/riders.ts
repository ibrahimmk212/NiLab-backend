import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const adminRidersRouter: Router = Router();

export default adminRidersRouter;
