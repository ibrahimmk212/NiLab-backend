import { Router } from 'express';
// import { Validate } from '../../../middlewares/validator';
import CustomerPayoutController from '../../../controllers/riders/PayoutController';
// import orderRequirement from '../../../middlewares/validator/requirements/orders';

const riderPayoutRouter: Router = Router();
riderPayoutRouter.get('/', CustomerPayoutController.getAllPayouts);
riderPayoutRouter.get('/:payoutId', CustomerPayoutController.getPayout);
riderPayoutRouter.post(
    '/request',
    // Validate(orderRequirement.updateStatus),
    CustomerPayoutController.requestPayout
);
export default riderPayoutRouter;
