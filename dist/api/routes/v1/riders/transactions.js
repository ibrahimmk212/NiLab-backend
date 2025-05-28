"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TransactionController_1 = __importDefault(require("../../../controllers/riders/TransactionController"));
const advancedQuery_1 = __importDefault(require("../../../../api/middlewares/data/advancedQuery"));
const Transaction_1 = __importDefault(require("../../../../api/models/Transaction"));
const riderTransactionRouter = (0, express_1.Router)();
riderTransactionRouter
    .route('/')
    .get((0, advancedQuery_1.default)(Transaction_1.default), TransactionController_1.default.getTransactions);
riderTransactionRouter
    .route('/transactionId')
    .get(TransactionController_1.default.getTransactionDetails);
exports.default = riderTransactionRouter;
