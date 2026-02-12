import { Router } from 'express';
import BannerController from '../../../controllers/admin/BannerController';

const adminBannerRouter: Router = Router();

adminBannerRouter.post('/', BannerController.create);
adminBannerRouter.get('/', BannerController.getAll);
adminBannerRouter.get('/:id', BannerController.getById);
adminBannerRouter.put('/:id', BannerController.update);
adminBannerRouter.delete('/:id', BannerController.delete);

export default adminBannerRouter;
