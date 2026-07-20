import { redirect } from "next/navigation";

/** Always send visitors to the Glow Beauty demo storefront. */
export default function DemoRedirectPage() {
  redirect("/glow-beauty");
}