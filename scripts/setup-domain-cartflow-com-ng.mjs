/**
 * Add cartflow.com.ng to the Vercel cartflow project (SSL auto-provisioned after DNS).
 * Run: npx vercel login && node scripts/setup-domain-cartflow-com-ng.mjs
 */
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOMAINS = ["cartflow.com.ng", "www.cartflow.com.ng"];

function run(args) {
  const result = spawnSync("npx", ["vercel", ...args], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return result.status === 0;
}

console.log("CartFlow domain setup — cartflow.com.ng\n");
console.log("Prerequisites: npx vercel login && npx vercel link (in cartflow folder)\n");

if (!run(["whoami"])) {
  console.error("\nNot logged in. Run: npx vercel login");
  process.exit(1);
}

run(["link", "--yes"]);

for (const domain of DOMAINS) {
  console.log(`\nAdding ${domain}...`);
  run(["domains", "add", domain, "--yes"]);
}

console.log(`
DNS records (add at your .com.ng registrar — Whogohost, Namecheap, etc.):

  Type    Name    Value
  ----    ----    -----
  A       @       76.76.21.21
  CNAME   www     cname.vercel-dns.com

After DNS propagates (5–60 min), Vercel issues HTTPS automatically (Let's Encrypt).

Then sync env and redeploy:
  npm run vercel:sync-env
  npx vercel --prod

Primary URL: https://cartflow.com.ng
`);