import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const adminDispatchRouter: Router = Router();

export default adminDispatchRouter;
