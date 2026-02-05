import { Router } from 'express';
import waitlistRouter from './waitlist';
import marketCategoryRouter from './marketCategories';
import productRouter from './products';
import vendorRouter from '../customers/vendors';

const publicRouter: Router = Router();
publicRouter.use('/waitlists', waitlistRouter);
publicRouter.use(`/market-categories`, marketCategoryRouter);
publicRouter.use(`/products`, productRouter);
publicRouter.use(`/vendors`, vendorRouter);

export default publicRouter;
