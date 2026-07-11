export type TrackSession = {
  orderNumber: string;
  customerPhone: string;
  savedAt: number;
};

const TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function storageKey(storeSlug: string) {
  return `cartflow:track:${storeSlug}`;
}

export function saveTrackSession(storeSlug: string, orderNumber: string, customerPhone: string) {
  if (typeof window === "undefined") return;

  const payload: TrackSession = {
    orderNumber: orderNumber.trim().toUpperCase(),
    customerPhone: customerPhone.trim(),
    savedAt: Date.now(),
  };

  try {
    window.sessionStorage.setItem(storageKey(storeSlug), JSON.stringify(payload));
  } catch {
    // private browsing / quota — ignore
  }
}

export function readTrackSession(storeSlug: string): TrackSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(storageKey(storeSlug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as TrackSession;
    if (
      !parsed?.orderNumber ||
      !parsed?.customerPhone ||
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > TTL_MS
    ) {
      window.sessionStorage.removeItem(storageKey(storeSlug));
      return null;
    }

    return {
      orderNumber: parsed.orderNumber.trim().toUpperCase(),
      customerPhone: parsed.customerPhone.trim(),
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function clearTrackSession(storeSlug: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(storageKey(storeSlug));
  } catch {
    // ignore
  }
}