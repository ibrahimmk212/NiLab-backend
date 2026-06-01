import { Router } from 'express';
import transactionController from '../../../controllers/customers/TransactionController';

const customerTransactionRouter: Router = Router();

customerTransactionRouter
    .route('/')
    .get(transactionController.getTransactions)
    .post(transactionController.createTransaction);

customerTransactionRouter
    .route('/transactionId')
    .get(transactionController.getTransactionDetails);

export default customerTransactionRouter;
