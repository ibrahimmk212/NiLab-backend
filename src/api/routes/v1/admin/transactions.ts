import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const adminTransactionRouter: Router = Router();

export default adminTransactionRouter;
