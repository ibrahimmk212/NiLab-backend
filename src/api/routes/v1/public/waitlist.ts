import { Router } from 'express';
import WaitListController from '../../../controllers/public/WaitListController';
import waitlistRequirement from '../../../middlewares/validator/requirements/waitlist';
import { Validate } from '../../../middlewares/validator';

const waitlistRouter: Router = Router();
waitlistRouter.post(
    '/',
    Validate(waitlistRequirement.createWaitlist),
    WaitListController.create
);
export default waitlistRouter;
