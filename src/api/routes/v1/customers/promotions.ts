import { Router } from 'express';
import promotionController from '../../../controllers/customers/PromotionController';
import { Requirements, Validate } from '../../../middlewares/validator';

const customerPromotionRouter: Router = Router();

customerPromotionRouter.route('/').get(promotionController.getPromotions);
customerPromotionRouter.route('/coupons').get(promotionController.getCoupons);

customerPromotionRouter.post(
    '/validate',
    promotionController.validatePromotionCode
);
customerPromotionRouter
    .route('/:promotionId')
    .get(promotionController.getPromotionDetails);

export default customerPromotionRouter;
