export type BankDetailsInput = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

export function parseBankDetails(
  data: Record<string, unknown>,
  required: boolean,
): BankDetailsInput | null | string {
  const bankName = typeof data.bankName === "string" ? data.bankName.trim() : "";
  const bankAccountName =
    typeof data.bankAccountName === "string" ? data.bankAccountName.trim() : "";
  const bankAccountNumber =
    typeof data.bankAccountNumber === "string"
      ? data.bankAccountNumber.trim().replace(/\s/g, "")
      : "";

  const anyProvided = Boolean(bankName || bankAccountName || bankAccountNumber);

  if (!anyProvided) {
    return required ? "Bank name, account name, and account number are required." : null;
  }

  if (!bankName) return "Bank name is required.";
  if (!bankAccountName) return "Account name is required.";
  if (!bankAccountNumber) return "Account number is required.";
  if (!/^\d{6,20}$/.test(bankAccountNumber)) {
    return "Bank account number must be 6–20 digits.";
  }

  return { bankName, bankAccountName, bankAccountNumber };
}

export function hasBankDetails(business: {
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}) {
  return Boolean(business.bankName && business.bankAccountName && business.bankAccountNumber);
}