import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import transactionController from '../../../controllers/customers/TransactionController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import TransactionModel from '../../../../api/models/Transaction';

const customerTransactionRouter: Router = Router();

customerTransactionRouter
    .route('/')
    .get(advancedQuery(TransactionModel), transactionController.getTransactions)
    .post(transactionController.createTransaction);

customerTransactionRouter
    .route('/transactionId')
    .get(transactionController.getTransactionDetails);

export default customerTransactionRouter;
