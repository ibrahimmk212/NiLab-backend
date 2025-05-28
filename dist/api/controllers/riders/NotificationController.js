"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
class NotificationController {
    constructor() {
        this.getNotifications = (0, async_1.asyncHandler)(async (req, res) => {
            const { advancedResults } = res;
            res.status(constants_1.STATUS.OK).json(advancedResults);
        });
    }
}
exports.default = new NotificationController();
