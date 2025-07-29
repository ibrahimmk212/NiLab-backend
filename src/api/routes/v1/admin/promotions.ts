import { Router } from 'express';
import promotionController from '../../../controllers/admin/AdminPromotionController';
import { Requirements, Validate } from '../../../middlewares/validator';

const adminPromotionRouter: Router = Router();

adminPromotionRouter
    .route('/')
    .get(promotionController.getPromotions)
    .post(promotionController.createPromotion);
adminPromotionRouter.post(
    '/validate',
    promotionController.validatePromotionCode
);
adminPromotionRouter
    .route('/:promotionId')
    .get(promotionController.getPromotionDetails)
    .put(promotionController.updatePromotionDetails);

export default adminPromotionRouter;
