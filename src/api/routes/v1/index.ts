import { Router } from 'express';
import mainRouter from './main';
import usersRouter from './users';
import customersRouter from './customers';
import vendorsRouter from './vendors';
import ridersRouter from './riders';
import adminsRouter from './admin';
import auth from '../../middlewares/auth';
import { ROLE } from '../../../constants';
import webhookRouter from './webhooks';
import publicRouter from './public';
import fileRouter from './file';

const router: Router = Router();
router.use('/', mainRouter);

router.use('/webhook', webhookRouter);

router.use(
    '/customers',
    auth.authenticate,
    auth.checkRoles(ROLE.USER),
    customersRouter
);

router.use(
    '/vendor',
    // auth.isVendor,
    vendorsRouter
);
router.use(
    '/rider',
    //  auth.isRider,
    ridersRouter
);
router.use('/public', publicRouter);
router.use('/admin', auth.isAdmin, adminsRouter);

router.use('/users', usersRouter);
router.use('/file', fileRouter);
export default router;
