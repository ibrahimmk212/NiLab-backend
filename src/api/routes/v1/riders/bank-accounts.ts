import { Router } from 'express';
import BankAccountController from '../../../controllers/BankAccountController';

const riderBankAccountRouter = Router();

// Utility routes — must come before /:id param routes
riderBankAccountRouter.get('/banks', BankAccountController.getBanks);
riderBankAccountRouter.post('/verify', BankAccountController.verifyAccount);

// CRUD routes
riderBankAccountRouter.get('/', BankAccountController.getAllAccounts);
riderBankAccountRouter.post('/', BankAccountController.addAccount);
riderBankAccountRouter.delete('/:id', BankAccountController.deleteAccount);
riderBankAccountRouter.put('/:id/set-default', BankAccountController.setDefault);

export default riderBankAccountRouter;
