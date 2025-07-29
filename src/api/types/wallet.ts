export type CreateWalletType = {
    role: 'user' | 'rider' | 'vendor';
    owner: string;
};
// | {
//       role: 'user';
//       user: string;
//   }
// | {
//       role: 'rider';
//       rider: string;
//   }
// | {
//       role: 'vendor';
//       vendor: string;
//   };

export type InitDebitType = {
    role: string;
    owner: string;
    amount: number;
    reference: string;
    remark: string;
    transactionType: string;
    transactionId: string;
};
// | {
//       rider: string;
//       amount: number;
//       reference: string;
//       remark: string;
//       transactionType: string;
//       transactionId: string;
//   }
// | {
//       vendor: string;
//       amount: number;
//       reference: string;
//       remark: string;
//       transactionType: string;
//       transactionId: string;
//   };
