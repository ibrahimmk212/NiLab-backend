import { Router } from 'express';
import BannerController from '../../../controllers/public/BannerController';

const publicBannerRouter: Router = Router();

publicBannerRouter.get('/', BannerController.getAll);

export default publicBannerRouter;
