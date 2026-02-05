import express from 'express';
import AdminComplaintController from '../../../controllers/admin/AdminComplaintController';
import Auth from '../../../middlewares/auth';

const router = express.Router();

router.use(Auth.isAdmin);

router.route('/').get(AdminComplaintController.getAll);

router
    .route('/:id')
    .get(AdminComplaintController.getSingle)
    .patch(AdminComplaintController.resolve);

router.post('/:id/notify-vendor', AdminComplaintController.notifyVendor);

export default router;
