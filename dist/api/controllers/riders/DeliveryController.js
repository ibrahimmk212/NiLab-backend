"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DeliveryService_1 = __importDefault(require("../../services/DeliveryService"));
const async_1 = require("../../middlewares/handlers/async");
const constants_1 = require("../../../constants");
const DispatchService_1 = __importDefault(require("../../services/DispatchService"));
const OrderService_1 = __importDefault(require("../../services/OrderService"));
const helpers_1 = require("../../../utils/helpers");
class DeliveryController {
    constructor() {
        this.availableDeliveries = (0, async_1.asyncHandler)(async (req, res) => {
            const deliveries = await DeliveryService_1.default.getAvailableDeliveries();
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: deliveries
            });
        });
        this.getMyDeliveries = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            const deliveries = await DeliveryService_1.default.getDeliveriesForRider(userdata === null || userdata === void 0 ? void 0 : userdata.id);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: deliveries
            });
        });
        this.getActiveDeliveries = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            const deliveries = await DeliveryService_1.default.getActiveDeliveries(userdata === null || userdata === void 0 ? void 0 : userdata.id);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: deliveries
            });
        });
        this.acceptDelivery = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            let dispatch = await DispatchService_1.default.getActiveDispatch(userdata === null || userdata === void 0 ? void 0 : userdata.id);
            const delivery = await DeliveryService_1.default.getDeliveryById(req.params.deliveryId);
            if (!delivery) {
                throw Error('Delivery not found!');
            }
            if (delivery.riderId) {
                throw Error('This delivery has already been accepted');
            }
            const order = await OrderService_1.default.getOrderById(delivery.orderId.toString());
            if (!order) {
                throw Error('Order not found!');
            }
            dispatch
                ? (delivery.dispatchId = dispatch.id)
                : (dispatch = await DispatchService_1.default.createDispatch({
                    riderId: userdata === null || userdata === void 0 ? void 0 : userdata.id
                }));
            await DispatchService_1.default.addDeliveriesToDispatch(dispatch.id, [
                delivery.id
            ]);
            delivery.riderId = userdata === null || userdata === void 0 ? void 0 : userdata.id;
            order.rider = userdata.id;
            order.deliveryAccepted = true;
            await delivery.save();
            await order.save();
            res.status(constants_1.STATUS.OK).json(delivery);
        });
        this.confirmDelivery = (0, async_1.asyncHandler)(async (req, res) => {
            const { deliveryId } = req.params;
            const { deliveryCode } = req.body;
            const delivery = await DeliveryService_1.default.getDeliveryById(deliveryId);
            if (!delivery) {
                throw Error('Delivery not found');
            }
            if (delivery.deliveryCode !== deliveryCode) {
                throw Error('Invalid delivery code');
            }
            delivery.status = 'delivered';
            delivery.actualDeliveryTime = (0, helpers_1.currentTimestamp)();
            await delivery.save();
            // TODO transfer delivery fee to available balance
            // TODO tranfer vendor fee to vendor
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: delivery
            });
        });
        this.updateDeliveryStatus = (0, async_1.asyncHandler)(async (req, res) => {
            const { deliveryId, status } = req.params;
            const delivery = await DeliveryService_1.default.getDeliveryById(deliveryId);
            if (!delivery) {
                throw Error('delivery not found');
            }
            if (!['in-transit', 'canceled'].includes(status)) {
                throw Error('Invalid status');
            }
            if (delivery.status == 'canceled') {
                throw Error('delivery already canceled, you cannot update this delivery');
            }
            if (delivery.status !== 'pending' && status === 'canceled') {
                throw Error('delivery already in-transit, you cannot canceled');
            }
            if (status === 'canceled') {
                delivery.riderId = null;
                delivery.dispatchId = null;
                // TODO rebroadcast to available riders
            }
            delivery.status = status;
            delivery.save();
            res.json({
                success: true,
                data: delivery
            });
        });
        this.getDeliveryById = (0, async_1.asyncHandler)(async (req, res) => {
            const { deliveryId } = req.params;
            const delivery = await DeliveryService_1.default.getDeliveryById(deliveryId);
            res.json({
                success: true,
                data: delivery
            });
        });
    }
}
exports.default = new DeliveryController();
