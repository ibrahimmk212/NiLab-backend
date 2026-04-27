import { Router } from 'express';
import BankAccountController from '../../../controllers/BankAccountController';

const bankAccountRouter = Router();

// Utility routes — must come before /:id param routes
bankAccountRouter.get('/banks', BankAccountController.getBanks);
bankAccountRouter.post('/verify', BankAccountController.verifyAccount);

// CRUD routes
bankAccountRouter.get('/', BankAccountController.getAllAccounts);
bankAccountRouter.post('/', BankAccountController.addAccount);
bankAccountRouter.delete('/:id', BankAccountController.deleteAccount);
bankAccountRouter.put('/:id/set-default', BankAccountController.setDefault);

export default bankAccountRouter;
