import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import orderController from '../../../controllers/customers/OrderController';

const customerOrderRouter: Router = Router();

customerOrderRouter.route('/').get(orderController.getAllOrder).post(
    // Validate(Requirements.createOrder),
    orderController.createOrder
);

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
        orderController.getOrderDetails
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

// Pay For Me Routes
customerOrderRouter.get(
    '/pay-for-me/:token',
    orderController.getPayForMeDetails
);
customerOrderRouter.post(
    '/pay-for-me/complete',
    orderController.completePayForMe
);

export default customerOrderRouter;
