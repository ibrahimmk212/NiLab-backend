"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
class ReviewController {
    constructor() {
        this.getReviews = (0, async_1.asyncHandler)(async (req, res, next) => {
            const { advancedResults } = res;
            res.status(constants_1.STATUS.OK).json(advancedResults);
        });
        this.createReview = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
        this.getReviewDetails = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
        this.updateReview = (0, async_1.asyncHandler)(async (req, res, next) => {
            throw Error('not implemented');
        });
    }
}
exports.default = new ReviewController();
