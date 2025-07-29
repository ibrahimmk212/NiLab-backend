import { Message, sha512 } from 'js-sha512';
import { TransactionEvent } from './types/notification';
import appConfig from '../../../config/appConfig';

class MonnifyEventHandler {
    async transactionEvent(data: TransactionEvent): Promise<any> {
        const computedHash = this.computedHash(data);
        console.log(data);
        console.log(computedHash);
        const eventType = data.eventType;
    }

    computedHash(event: any): string {
        const secret = appConfig.app.isDevelopment
            ? '91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y' // TODO remove this on production
            : appConfig.monnify.monnifySecretKey;
        const result = sha512.hmac(secret, JSON.stringify(event));
        return result;
    }
}

export default new MonnifyEventHandler();
