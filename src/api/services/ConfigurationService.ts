// import { ConfigService } from 'aws-sdk';
import { Configuration, ICity, IState } from '../models/Configuration';
import ConfigurationRepository from '../repositories/ConfigurationRepository';
interface IConfigurationService {
    create(payload: any): Promise<any>;
    getConfiguration(): Promise<any>;
    update(id: string, data: any): Promise<boolean>;
}

class ConfigurationService implements IConfigurationService {
    async create(payload: Partial<Configuration>): Promise<any> {
        return ConfigurationRepository.createConfiguration(payload);
    }

    async getConfiguration(): Promise<Configuration | null> {
        let configuration = await ConfigurationRepository.getConfiguration();

        if (!configuration) {
            configuration = await this.create({
                deliveryFee: 20,
                maxDeliveryFee: 500,
                packageDeliveryCommision: 20,
                maxPackageDeliveryCommision: 400,
                payOnDeliveryDiscount: 5,
                serviceFee: 20,
                maxServiceFee: 200,
                vatRate: 0,
                nearbyDistance: 2000,
                closingHour: '21:00',
                openingHour: '9:00',
                serviceCities: [],
                serviceStates: []
            });
        }

        return configuration;
    }

    async update(id: string, data: Partial<Configuration>): Promise<any> {
        return ConfigurationRepository.updateConfiguration(id, data);
    }
    async addState(id: string, data: IState): Promise<Configuration | null> {
        return ConfigurationRepository.addNewState(id, data);
    }
    async removeState(
        id: string,
        stateId: string
    ): Promise<Configuration | null> {
        return ConfigurationRepository.deleteState(id, stateId);
    }

    async addCity(id: string, data: ICity): Promise<Configuration | null> {
        return ConfigurationRepository.addNewCity(id, data);
    }
    async removeCity(
        id: string,
        stateId: string
    ): Promise<Configuration | null> {
        return ConfigurationRepository.deleteCity(id, stateId);
    }
}
export default new ConfigurationService();
