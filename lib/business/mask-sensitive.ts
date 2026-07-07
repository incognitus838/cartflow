type BankFields = {
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
};

export function maskBankAccountNumber(value: string | null | undefined) {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

export function maskBusinessBankDetails<T extends BankFields>(
  business: T,
  canView: boolean,
): T {
  if (canView) return business;
  return {
    ...business,
    bankName: business.bankName ? "••••••••" : null,
    bankAccountName: business.bankAccountName ? "••••••••" : null,
    bankAccountNumber: maskBankAccountNumber(business.bankAccountNumber),
  };
}