import VirtualAccountModel, { VirtualAccount } from '../models/VirtualAccount';

class VirtualAccountRepository {
    async createVirtualAccount(data: VirtualAccount): Promise<VirtualAccount> {
        const virtualAccount = new VirtualAccountModel(data);
        return await virtualAccount.save();
    }

    async findVirtualAccountById(
        virtualAccountId: string
    ): Promise<VirtualAccount | null> {
        return await VirtualAccountModel.findById(virtualAccountId);
    }

    async updateVirtualAccount(
        virtualAccountId: string,
        updateData: Partial<VirtualAccount>
    ): Promise<VirtualAccount | null> {
        return await VirtualAccountModel.findByIdAndUpdate(
            virtualAccountId,
            updateData,
            { new: true }
        );
    }

    async deleteVirtualAccount(
        virtualAccountId: string
    ): Promise<VirtualAccount | null> {
        return await VirtualAccountModel.findByIdAndDelete(virtualAccountId, {
            new: true
        });
    }

    // Additional virtual account-specific methods...
}

export default new VirtualAccountRepository();
