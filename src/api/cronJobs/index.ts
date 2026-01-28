import cron from 'node-cron';
import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderRepository from '../repositories/OrderRepository';

class BackgroundTasks {
    init() {
        // Runs every 10 minutes
        cron.schedule('*/10 * * * *', async () => {
            console.log('--- Running Logistics Cleanup ---');
            await this.handleStaleDeliveries();
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

                // Logic to re-notify riders (Triggered for each unique state/zone)
                // You can call your DeliveryService.notifyAvailableRiders here
            }
        } catch (error) {
            console.error('[Cron Error] Logistics Cleanup failed:', error);
        }
    }
}

export default new BackgroundTasks();
