import { redirect } from "next/navigation";
import { getDailyDemoStore } from "@/lib/demo/stores";

/** Always send visitors to today's featured demo storefront. */
export default function DemoRedirectPage() {
  const store = getDailyDemoStore();
  redirect(`/${store.slug}`);
}