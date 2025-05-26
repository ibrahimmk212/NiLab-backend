import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import waitlistRequirement from '../../../middlewares/validator/requirements/waitlist';
import AdminWaitListController from '../../../controllers/admin/AdminWaitListController';

const adminWaitlistRouter: Router = Router();
adminWaitlistRouter.post(
    '/create',
    // Validate(waitlistRequirement.createWaitlist),
    AdminWaitListController.create
);
adminWaitlistRouter.get('/', AdminWaitListController.getAll);
adminWaitlistRouter.get('/:id', AdminWaitListController.getSingle);
export default adminWaitlistRouter;
