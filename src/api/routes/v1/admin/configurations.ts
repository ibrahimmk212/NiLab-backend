import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const configurationRouter: Router = Router();

export default configurationRouter;
