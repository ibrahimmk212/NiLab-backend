import { Router } from 'express';
// import { Validate } from '../../../middlewares/validator';
import AdminPayoutController from '../../../controllers/admin/AdminPayoutController';
// import orderRequirement from '../../../middlewares/validator/requirements/orders';

const adminPayoutRouter: Router = Router();
adminPayoutRouter.get('/', AdminPayoutController.getAllPayouts);
adminPayoutRouter.put(
    '/:payoutId/complete',
    // Validate(orderRequirement.updateStatus),
    AdminPayoutController.completePayout
);
adminPayoutRouter.put('/:payoutId/reject', AdminPayoutController.rejectPayout);
adminPayoutRouter.get('/:payoutId', AdminPayoutController.getPayout);

export default adminPayoutRouter;
