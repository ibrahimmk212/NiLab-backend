"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
class TransactionController {
    constructor() {
        this.getTransactions = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { advancedResults } = res;
            res.status(constants_1.STATUS.OK).json(advancedResults);
        });
        this.createTransaction = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
        this.getTransactionDetails = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
        this.updateTransaction = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
    }
}
exports.default = new TransactionController();
