export type ManualPaymentAccount = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
};

const INSTRUCTIONS =
  "Transfer the exact order total to the account below, then upload your payment screenshot or PDF before placing the order.";

export function resolveManualPaymentAccount(business: {
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}): ManualPaymentAccount | null {
  if (!business.bankName || !business.bankAccountName || !business.bankAccountNumber) {
    return null;
  }

  return {
    bankName: business.bankName,
    accountName: business.bankAccountName,
    accountNumber: business.bankAccountNumber,
    instructions: INSTRUCTIONS,
  };
}