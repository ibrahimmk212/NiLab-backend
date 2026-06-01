import { Router } from 'express';
import transactionController from '../../../controllers/riders/TransactionController';

const riderTransactionRouter: Router = Router();

riderTransactionRouter
    .route('/')
    .get(
        transactionController.getTransactions
    );

riderTransactionRouter
    .route('/:transactionId')
    .get(transactionController.getTransactionDetails);

export default riderTransactionRouter;
