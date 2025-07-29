import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import orderController from '../../../controllers/customers/OrderController';

const customerOrderRouter: Router = Router();

customerOrderRouter
    .route('/')
    .get(orderController.getOrders)
    .post(Validate(Requirements.createOrder), orderController.createOrder);

customerOrderRouter
    .route('/package')
    // .get(orderController.getOrders)
    .post(
        Validate(Requirements.createPackageOrder),
        orderController.createDeliveryOrder
    );
customerOrderRouter.post('/upload-file', orderController.upload);

customerOrderRouter
    .route('/:orderId/delivery')
    .get(
        Validate(Requirements.getOrderDetail),
        orderController.getOrderDelivery
    );

customerOrderRouter
    .route('/:orderId')
    .get(Validate(Requirements.getOrderDetail), orderController.getOrderDetails)
    .put(
        Validate(Requirements.confirmOrCancleOrder),
        orderController.updateOrder
    );

customerOrderRouter.post('/:orderId/checkout', orderController.checkout);
customerOrderRouter.post('/:orderId/review', orderController.submitReview);

export default customerOrderRouter;
