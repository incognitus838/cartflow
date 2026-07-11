import { revalidateTag } from "next/cache";

export function revalidateStoreDelivery(businessSlug: string) {
  revalidateTag(`store-${businessSlug}`, { expire: 0 });
}