/** Strip non-digits for loose phone comparison (Nigerian + international formats). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Compare phones by full match or last 10 digits (handles +234 / 0 prefixes). */
export function phonesMatch(a: string, b: string): boolean {
  const left = normalizePhone(a);
  const right = normalizePhone(b);
  if (!left || !right) return false;
  if (left === right) return true;
  const tail = (value: string) => value.slice(-10);
  return tail(left).length >= 7 && tail(left) === tail(right);
}