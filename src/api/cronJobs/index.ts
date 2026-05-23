import cron from 'node-cron';
import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderRepository from '../repositories/OrderRepository';
import OrderModel from '../models/Order';
import DeliveryModel from '../models/Delivery';
import RiderLocationModel from '../models/RiderLocation';
import NotificationService from '../services/NotificationService';
import { calculateStraightDistance } from '../../utils/helpers';

class BackgroundTasks {
    init() {
        // Runs every 10 minutes for logistics recovery
        cron.schedule('*/10 * * * *', async () => {
            console.log('--- Running Logistics Cleanup ---');
            await this.handleStaleDeliveries();
        });

        // Runs every minute for SLA & ETA alert monitoring
        cron.schedule('* * * * *', async () => {
            console.log('--- Running SLA & ETA Alert Checks ---');
            await this.checkSlaAndEtaAlerts();
        });
    }

    private async handleStaleDeliveries() {
        try {
            // Threshold: 30 minutes of inactivity in 'accepted' state
            const releasedIds =
                await DeliveryRepository.getAndReleaseStaleDeliveries(1);

            if (releasedIds.length > 0) {
                console.log(
                    `[Cron] Recovered ${releasedIds.length} abandoned deliveries.`
                );
            }
        } catch (error) {
            console.error('[Cron Error] Logistics Cleanup failed:', error);
        }
    }

    private async checkSlaAndEtaAlerts() {
        try {
            // A. Vendor Order SLA Breach
            // Order status 'pending' (vendor acceptance pending) for > 3 min
            const threeMinAgo = new Date(Date.now() - 3 * 60 * 1000);
            const pendingOrders = await OrderModel.find({
                status: 'pending',
                createdAt: { $lt: threeMinAgo },
                slaBreachAlerted: { $ne: true }
            }).populate('vendor');

            for (const order of pendingOrders) {
                const vendorName = (order.vendor as any)?.name || 'Unknown Vendor';
                const message = `SLA Breach: Order [${order.code}] not accepted by vendor [${vendorName}] after 3 min`;
                console.log(`[SLA Alert] ${message}`);
                await NotificationService.notifyAdmins('Vendor SLA Breach', message);
                await OrderModel.updateOne({ _id: order._id }, { $set: { slaBreachAlerted: true } });
            }

            // B. Rider Ride SLA Breach
            // Delivery status 'pending' (unassigned/pending rider acceptance) for > 2 min
            const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
            const pendingDeliveries = await DeliveryModel.find({
                status: 'pending',
                createdAt: { $lt: twoMinAgo },
                slaBreachAlerted: { $ne: true }
            });

            for (const delivery of pendingDeliveries) {
                const message = `SLA Breach: Ride [${delivery.deliveryCode || delivery._id}] not accepted by any rider after 2 min`;
                console.log(`[SLA Alert] ${message}`);
                await NotificationService.notifyAdmins('Rider SLA Breach', message);
                await DeliveryModel.updateOne({ _id: delivery._id }, { $set: { slaBreachAlerted: true } });
            }

            // C. ETA Exhaustion Warning Trigger
            // Ride status 'in-transit' and ETA <= 3 min
            const activeDeliveries = await DeliveryModel.find({
                status: 'in-transit',
                estimatedDeliveryTime: { $exists: true, $ne: null },
                etaWarningAlerted: { $ne: true }
            }).populate('rider').populate('order');

            for (const delivery of activeDeliveries) {
                if (!delivery.estimatedDeliveryTime) continue;

                const remainingMinutes = (new Date(delivery.estimatedDeliveryTime).getTime() - Date.now()) / 60000;
                // Trigger warning if ETA is in <= 3 minutes (e.g. remainingMinutes <= 3)
                if (remainingMinutes <= 3) {
                    const order = delivery.order as any;
                    const rider = delivery.rider as any;
                    const orderCode = order?.code || 'Unknown';
                    const riderName = rider?.name || 'Unknown Rider';

                    let distanceStr = 'unknown';
                    if (rider) {
                        const latestLocation = await RiderLocationModel.findOne({ rider: rider._id }).sort({ timestamp: -1 });
                        if (latestLocation && latestLocation.location?.coordinates) {
                            const [riderLng, riderLat] = latestLocation.location.coordinates;
                            const destCoords = delivery.destination?.coordinates;
                            if (destCoords && destCoords.length === 2) {
                                const [destLng, destLat] = destCoords;
                                const distance = calculateStraightDistance(riderLat, riderLng, destLat, destLng);
                                distanceStr = distance.toFixed(2);
                            }
                        }
                    }

                    const message = `ETA Warning: Order #[${orderCode}] ETA in 3 min. Rider [${riderName}] is [${distanceStr}] km away`;
                    console.log(`[ETA Warning] ${message}`);
                    await NotificationService.notifyAdmins('ETA Warning Alert', message);

                    await DeliveryModel.updateOne({ _id: delivery._id }, { $set: { etaWarningAlerted: true } });
                }
            }
        } catch (error) {
            console.error('[SLA & ETA Cron Error] failed:', error);
        }
    }
}

export default new BackgroundTasks();
