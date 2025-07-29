import mongoose, { Document, Schema } from 'mongoose';

export interface Wallet extends Document {
    // user: mongoose.Types.ObjectId;
    // vendor: mongoose.Types.ObjectId;
    // rider: mongoose.Types.ObjectId;
    role: 'user' | 'rider' | 'vendor';
    owner: string;
    balance: number;
    ledgerBalance: number;
    prevBalance: number;
    prevLegderBalance: number;
    // transactions: mongoose.Types.ObjectId[];
}

const walletSchema = new Schema<Wallet>(
    {
        // user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        // vendor: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Vendor',
        //     required: false
        // },
        // rider: { type: Schema.Types.ObjectId, ref: 'Rider', required: false },
        balance: { type: Number, default: 0 },
        ledgerBalance: { type: Number, default: 0 },
        prevBalance: { type: Number, default: 0 },
        prevLegderBalance: { type: Number, default: 0 },
        role: { type: String, required: true },
        owner: { type: String, required: false }
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

// Prevent users from having more than one wallet
walletSchema.index({ role: 1, owner: 1 }, { unique: true });

const WalletModel = mongoose.model<Wallet>('Wallet', walletSchema);

export default WalletModel;
