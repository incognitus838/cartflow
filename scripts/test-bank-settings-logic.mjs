/**
 * Unit checks for bank field handling in settings PATCH (no server required).
 * Run: node scripts/test-bank-settings-logic.mjs
 */

function includesBankFields(data) {
  return "bankName" in data || "bankAccountName" in data || "bankAccountNumber" in data;
}

function buildBankUpdate(data) {
  if (!includesBankFields(data)) return { touchBank: false };
  const bankName = typeof data.bankName === "string" ? data.bankName.trim() : "";
  const bankAccountName =
    typeof data.bankAccountName === "string" ? data.bankAccountName.trim() : "";
  const bankAccountNumber =
    typeof data.bankAccountNumber === "string"
      ? data.bankAccountNumber.trim().replace(/\s/g, "")
      : "";
  const anyProvided = Boolean(bankName || bankAccountName || bankAccountNumber);
  if (!anyProvided) {
    return { touchBank: true, bankName: null, bankAccountName: null, bankAccountNumber: null };
  }
  return {
    touchBank: true,
    bankName,
    bankAccountName,
    bankAccountNumber,
  };
}

const cases = [
  {
    name: "partial PATCH without bank keys does not touch bank",
    input: { name: "Ada Skincare", slug: "ada-styles", currency: "NGN", deliveryFee: 1500 },
    expect: { touchBank: false },
  },
  {
    name: "empty bank strings clear bank columns",
    input: { bankName: "", bankAccountName: "", bankAccountNumber: "" },
    expect: { touchBank: true, bankName: null, bankAccountName: null, bankAccountNumber: null },
  },
  {
    name: "full bank payload updates bank",
    input: {
      bankName: "Zenith Bank",
      bankAccountName: "Jane Doe",
      bankAccountNumber: "1234567890",
    },
    expect: {
      touchBank: true,
      bankName: "Zenith Bank",
      bankAccountName: "Jane Doe",
      bankAccountNumber: "1234567890",
    },
  },
];

let failed = 0;
for (const testCase of cases) {
  const result = buildBankUpdate(testCase.input);
  const ok = JSON.stringify(result) === JSON.stringify(testCase.expect);
  if (ok) {
    console.log(`✓ ${testCase.name}`);
  } else {
    failed += 1;
    console.error(`✗ ${testCase.name}`);
    console.error("  expected", testCase.expect);
    console.error("  got     ", result);
  }
}

if (failed > 0) process.exit(1);
console.log(`\n${cases.length - failed}/${cases.length} passed`);