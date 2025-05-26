import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    userId: mongoose.Types.ObjectId;
    vendorId: mongoose.Types.ObjectId;
    riderId: mongoose.Types.ObjectId;
    balance: number;
    ledgerBalance: number;
    prevBalance: number;
    prevLegderBalance: number;
    transactions: mongoose.Types.ObjectId[];
}

const walletSchema = new Schema<Wallet>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false
        },
        riderId: { type: Schema.Types.ObjectId, ref: 'Rider', required: false },
        balance: { type: Number, default: 0 },
        ledgerBalance: { type: Number, default: 0 },
        prevBalance: { type: Number, default: 0 },
        prevLegderBalance: { type: Number, default: 0 }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

walletSchema.post('save', async function (wallet: Wallet) {
    //   Keep Record
    if (wallet.isNew) {
        console.log(wallet);
    }
    // await WalletHistoryRepository.create({
    //     walletId: userWallet.id,
    //     reference: reference,
    //     amount: amount,
    //     currentBalance: updateData.balance,
    //     prevBalance: currentBalance,
    //     currentLockedBalance: updateData.lockedBalance,
    //     prevLockedBalance: userWallet.lockedBalance,
    //     currentLedgerBalance: userWallet.ledgerBalance,
    //     prevLedgerBalance: userWallet.ledgerBalance,
    //     balanceType: 'available',
    //     remark,
    //     transactionType,
    //     transactionId,
    //     action: 'debit',
    //     createdAt: Utils.currentTimestamp(),
    //     updatedAt: Utils.currentTimestamp()
    // });
});
const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);

export default WalletModel;
