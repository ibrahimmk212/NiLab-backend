import { Router } from 'express';
import AdminLogController from '../../../controllers/admin/AdminLogController';

const adminLogRouter: Router = Router();

adminLogRouter.get('/', AdminLogController.getAll);

export default adminLogRouter;
