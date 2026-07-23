import {
  CartflowLayout,
  EmailList,
  EmailParagraph,
} from "./components/cartflow-layout";

export type WelcomeEmailProps = {
  name: string;
  dashboardUrl: string;
  appUrl: string;
};

export function WelcomeEmail({ name, dashboardUrl, appUrl }: WelcomeEmailProps) {
  return (
    <CartflowLayout
      preview="Your CartFlow account has been created"
      eyebrow="Account"
      title="Welcome to CartFlow"
      appUrl={appUrl}
      cta={{ label: "Open your dashboard", href: dashboardUrl }}
      footerNote="If you did not create this account, please disregard this message."
    >
      <EmailParagraph>Dear {name},</EmailParagraph>
      <EmailParagraph>Thank you for creating an account with CartFlow.</EmailParagraph>
      <EmailParagraph>
        Your store application has been received and is awaiting platform review. During this
        period, you may sign in to prepare your catalog structure and store settings.
      </EmailParagraph>
      <EmailList
        items={[
          "Complete bank and contact details in Settings",
          "Organise catalog categories and product types",
          "Add products and share your store link after approval",
        ]}
      />
      <EmailParagraph>
        Product uploads and your public storefront will become available once your store is
        approved.
      </EmailParagraph>
    </CartflowLayout>
  );
}

export default WelcomeEmail;
