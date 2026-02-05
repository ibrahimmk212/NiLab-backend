import express from 'express';
import ComplaintController from '../../../controllers/customers/ComplaintController';
import Auth from '../../../middlewares/auth';
import { ROLE } from '../../../../constants';

const router = express.Router();

router.use(Auth.authenticate);
router.use(Auth.checkRoles(ROLE.USER));

router
    .route('/')
    .post(ComplaintController.create)
    .get(ComplaintController.getMyComplaints);

router.route('/:id').get(ComplaintController.getSingle);

export default router;
