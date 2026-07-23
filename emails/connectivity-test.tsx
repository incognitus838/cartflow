import { CartflowLayout, EmailParagraph } from "./components/cartflow-layout";

export type ConnectivityTestEmailProps = {
  provider: string;
  appUrl: string;
};

/** Used by npm run test:email — same black-header UI as all other mail. */
export function ConnectivityTestEmail({ provider, appUrl }: ConnectivityTestEmailProps) {
  return (
    <CartflowLayout
      preview={`CartFlow email is working via ${provider}`}
      eyebrow="System"
      title="Email is configured"
      appUrl={appUrl}
      cta={{ label: "Open CartFlow", href: appUrl }}
      footerNote="This is a connectivity test from your CartFlow environment."
    >
      <EmailParagraph>
        CartFlow transactional email is working via {provider}.
      </EmailParagraph>
      <EmailParagraph>
        All platform and order messages use this design: black header, gold accent, and a clear
        call-to-action.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default ConnectivityTestEmail;
