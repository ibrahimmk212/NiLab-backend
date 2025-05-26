import { Request, Response } from 'express';
import DeliveryService from '../../services/DeliveryService';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import DispatchService from '../../services/DispatchService';
import OrderService from '../../services/OrderService';
import { currentTimestamp } from '../../../utils/helpers';

class DeliveryController {
    availableDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const deliveries = await DeliveryService.getAvailableDeliveries();

        res.status(STATUS.OK).json({
            success: true,
            data: deliveries
        });
    });
    getMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const deliveries = await DeliveryService.getDeliveriesForRider(
            userdata?.id
        );
        res.status(STATUS.OK).json({
            success: true,
            data: deliveries
        });
    });
    getActiveDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;

        const deliveries = await DeliveryService.getActiveDeliveries(
            userdata?.id
        );
        res.status(STATUS.OK).json({
            success: true,
            data: deliveries
        });
    });

    acceptDelivery = asyncHandler(async (req: Request | any, res: Response) => {
        const { userdata }: any = req;
        let dispatch = await DispatchService.getActiveDispatch(userdata?.id);
        const delivery = await DeliveryService.getDeliveryById(
            req.params.deliveryId
        );
        if (!delivery) {
            throw Error('Delivery not found!');
        }

        if (delivery.riderId) {
            throw Error('This delivery has already been accepted');
        }
        const order = await OrderService.getOrderById(
            delivery.orderId.toString()
        );

        if (!order) {
            throw Error('Order not found!');
        }
        dispatch
            ? (delivery.dispatchId = dispatch.id)
            : (dispatch = await DispatchService.createDispatch({
                  riderId: userdata?.id
              }));

        await DispatchService.addDeliveriesToDispatch(dispatch.id, [
            delivery.id
        ]);

        delivery.riderId = userdata?.id;
        order.rider = userdata.id;
        order.deliveryAccepted = true;
        await delivery.save();
        await order.save();
        res.status(STATUS.OK).json(delivery);
    });

    confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId } = req.params;
        const { deliveryCode } = req.body;

        const delivery = await DeliveryService.getDeliveryById(deliveryId);

        if (!delivery) {
            throw Error('Delivery not found');
        }

        if (delivery.deliveryCode !== deliveryCode) {
            throw Error('Invalid delivery code');
        }

        delivery.status = 'delivered';
        delivery.actualDeliveryTime = currentTimestamp();
        await delivery.save();

        // TODO transfer delivery fee to available balance
        // TODO tranfer vendor fee to vendor

        res.status(STATUS.OK).json({
            success: true,
            data: delivery
        });
    });

    updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId, status } = req.params;

        const delivery = await DeliveryService.getDeliveryById(deliveryId);
        if (!delivery) {
            throw Error('delivery not found');
        }

        if (!['in-transit', 'canceled'].includes(status)) {
            throw Error('Invalid status');
        }

        if (delivery.status == 'canceled') {
            throw Error(
                'delivery already canceled, you cannot update this delivery'
            );
        }

        if (delivery.status !== 'pending' && status === 'canceled') {
            throw Error('delivery already in-transit, you cannot canceled');
        }

        if (status === 'canceled') {
            delivery.riderId = null;
            delivery.dispatchId = null;

            // TODO rebroadcast to available riders
        }

        delivery.status = status as 'canceled' | 'in-transit';
        delivery.save();

        res.json({
            success: true,
            data: delivery
        });
    });

    getDeliveryById = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId } = req.params;
        const delivery = await DeliveryService.getDeliveryById(deliveryId);
        res.json({
            success: true,
            data: delivery
        });
    });
}

export default new DeliveryController();
