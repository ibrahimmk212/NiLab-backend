import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import transactionController from '../../../controllers/riders/TransactionController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import TransactionModel from '../../../../api/models/Transaction';

const riderTransactionRouter: Router = Router();

riderTransactionRouter
    .route('/')
    .get(
        advancedQuery(TransactionModel),
        transactionController.getTransactions
    );

riderTransactionRouter
    .route('/:transactionId')
    .get(transactionController.getTransactionDetails);

export default riderTransactionRouter;
