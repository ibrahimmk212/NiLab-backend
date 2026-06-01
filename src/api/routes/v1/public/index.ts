import { Router } from 'express';
import waitlistRouter from './waitlist';
import marketCategoryRouter from './marketCategories';
import productRouter from './products';
import vendorRouter from '../customers/vendors';
import bannerRouter from './banners';
import vehicleTypeRouter from './vehicleTypes';
import searchRouter from './search';

const publicRouter: Router = Router();
publicRouter.use('/waitlists', waitlistRouter);
publicRouter.use(`/market-categories`, marketCategoryRouter);
publicRouter.use(`/products`, productRouter);
publicRouter.use(`/vendors`, vendorRouter);
publicRouter.use(`/banners`, bannerRouter);
publicRouter.use(`/vehicle-types`, vehicleTypeRouter);
publicRouter.use(`/search`, searchRouter);

export default publicRouter;
