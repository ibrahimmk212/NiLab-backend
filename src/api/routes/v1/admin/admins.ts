import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const adminRouter: Router = Router();

export default adminRouter;
