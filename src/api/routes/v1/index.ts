import { Router } from 'express';
import mainRouter from './main';
import usersRouter from './users';
import customersRouter from './customers';
import vendorsRouter from './vendors';
import ridersRouter from './riders';
import adminsRouter from './admin';
import auth from '../../middlewares/auth';
import { ROLE } from '../../../constants';
// import webhookRouter from './webhooks';
import publicRouter from './public';
import fileRouter from './file';
import dashboardRouter from './dashboard';
import webhookRouter from './webhooks';
import customerComplaintRoutes from './customers/complaint';
import adminComplaintRoutes from './admin/complaint';
import publicBannerRouter from './public/banners';

const router: Router = Router();
router.use('/', mainRouter);

// router.use('/webhook', webhookRouter);

router.use(
    '/customers',
    auth.authenticate,
    auth.checkRoles(ROLE.USER),
    customersRouter
);

router.use(
    '/customer',
    auth.authenticate,
    auth.checkRoles(ROLE.USER),
    customersRouter
);

// New complaint routes
router.use('/customers/complaints', customerComplaintRoutes);
router.use('/admin/complaints', adminComplaintRoutes);

router.use('/vendor', auth.isVendor, vendorsRouter);
router.use(
    '/rider',
    //  auth.isRider,
    ridersRouter
);
router.use('/public', publicRouter);
router.use('/admin', auth.isAdmin, adminsRouter);

router.use('/users', usersRouter);
router.use('/file', fileRouter);
router.use('/dashboard', dashboardRouter);
router.use('/webhooks', webhookRouter);
router.use('/banners', publicBannerRouter);
export default router;
