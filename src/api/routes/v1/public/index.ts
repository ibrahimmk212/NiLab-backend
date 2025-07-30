import { Router } from 'express';
import waitlistRouter from './waitlist';
import marketCategoryRouter from './marketCategories';
import productRouter from './products';

const publicRouter: Router = Router();
// WAITLIST
publicRouter.use('/waitlists', waitlistRouter);

// file upload
// publicRouter.use('/file', fileRouter);

// market category
publicRouter.use(`/market-categories`, marketCategoryRouter);

// products
publicRouter.use(`/products`, productRouter);

export default publicRouter;
