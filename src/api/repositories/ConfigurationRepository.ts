import ConfigurationModel, {
    Configuration,
    ICity,
    IState
} from '../models/Configuration';

class ConfigurationRepository {
    async createConfiguration(
        data: Partial<Configuration>
    ): Promise<Configuration> {
        const configExists = await ConfigurationModel.find();
        if (configExists[0]) {
            throw Error('Configurationn already exists');
        }
        const configuration = new ConfigurationModel(data);
        return await configuration.save();
    }

    async getConfiguration(): Promise<Configuration | null> {
        return await ConfigurationModel.findOne();
    }

    async updateConfiguration(
        configurationId: string,
        updateData: Partial<Configuration>
    ): Promise<Configuration | null> {
        return await ConfigurationModel.findByIdAndUpdate(
            configurationId,
            updateData,
            {
                new: true
            }
        );
    }

    async addNewState(
        configurationId: string,
        state: IState
    ): Promise<Configuration | null> {
        return await ConfigurationModel.findByIdAndUpdate(
            configurationId,
            { $push: { serviceStates: state } },
            { new: true, safe: true, upsert: true }
        );
    }

    async deleteState(
        configurationId: string,
        id: string
    ): Promise<Configuration | null> {
        return await ConfigurationModel.findByIdAndUpdate(
            configurationId,
            { $pull: { serviceStates: { _id: id } } },
            { new: true }
        );
    }

    async addNewCity(
        configurationId: string,
        state: ICity
    ): Promise<Configuration | null> {
        return await ConfigurationModel.findByIdAndUpdate(
            configurationId,
            { $push: { serviceCities: state } },
            { new: true, safe: true, upsert: true }
        );
    }

    async deleteCity(
        configurationId: string,
        id: string
    ): Promise<Configuration | null> {
        return await ConfigurationModel.findByIdAndUpdate(
            configurationId,
            { $pull: { serviceCities: { _id: id } } },
            { new: true }
        );
    }
}

export default new ConfigurationRepository();
