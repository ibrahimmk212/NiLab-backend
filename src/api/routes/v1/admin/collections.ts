import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';

const collectionRouter: Router = Router();

export default collectionRouter;
