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
import waitlistRouter from './public/waitlist';

const router: Router = Router();
router.use('/', mainRouter);

router.use('/webhook', webhookRouter);

router.use(
    '/customers',
    auth.authenticate,
    auth.checkRoles(ROLE.USER),
    customersRouter
);


router.use('/vendor', auth.isVendor, vendorsRouter);
router.use('/riders', ridersRouter);
router.use('/admin', auth.isAdmin, adminsRouter);

router.use('/users', usersRouter);
export default router;
