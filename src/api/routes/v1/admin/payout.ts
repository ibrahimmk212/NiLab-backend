import { Router } from 'express';
// import { Validate } from '../../../middlewares/validator';
import AdminPayoutController from '../../../controllers/admin/AdminPayoutController';
import auth from '../../../middlewares/auth';
import { ROLE } from '../../../../constants';
// import orderRequirement from '../../../middlewares/validator/requirements/orders';

const adminPayoutRouter: Router = Router();
adminPayoutRouter.get('/', AdminPayoutController.getAllPayouts);
adminPayoutRouter.post('/request', AdminPayoutController.requestPayout);
adminPayoutRouter.put(
    '/:payoutId/complete',
    auth.isSuperAdmin,
    AdminPayoutController.completePayout
);
adminPayoutRouter.put(
    '/:payoutId/reject',
    auth.checkRoles(ROLE.ADMIN, ROLE.MANAGER, ROLE.FINANCE),
    AdminPayoutController.rejectPayout
);
adminPayoutRouter.get('/:payoutId', AdminPayoutController.getPayout);

export default adminPayoutRouter;
