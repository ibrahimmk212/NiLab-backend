import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import CustomerWalletController from '../../../controllers/customers/CustomerWalletController';

const customerWalletRouter: Router = Router();

customerWalletRouter
    .route('/')
    .get(CustomerWalletController.get)

// customerWalletRouter
//     .route('/:orderId')
//     .get(Validate(Requirements.getOrderDetail), orderController.getOrderDetails)
//     .put(
//         Validate(Requirements.confirmOrCancleOrder),
//         orderController.updateOrder
//     );

export default customerWalletRouter;
