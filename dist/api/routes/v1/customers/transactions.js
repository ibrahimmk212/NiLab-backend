"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TransactionController_1 = __importDefault(require("../../../controllers/customers/TransactionController"));
const advancedQuery_1 = __importDefault(require("../../../../api/middlewares/data/advancedQuery"));
const Transaction_1 = __importDefault(require("../../../../api/models/Transaction"));
const customerTransactionRouter = (0, express_1.Router)();
customerTransactionRouter
    .route('/')
    .get((0, advancedQuery_1.default)(Transaction_1.default), TransactionController_1.default.getTransactions)
    .post(TransactionController_1.default.createTransaction);
customerTransactionRouter
    .route('/transactionId')
    .get(TransactionController_1.default.getTransactionDetails);
exports.default = customerTransactionRouter;
