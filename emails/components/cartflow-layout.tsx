import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

const colors = {
  bg: "#f5f5f7",
  card: "#ffffff",
  text: "#1d1d1f",
  muted: "#6e6e73",
  soft: "#86868b",
  gold: "#b8956a",
  border: "rgba(0,0,0,0.06)",
  button: "#1d1d1f",
};

type CartflowLayoutProps = {
  preview: string;
  title: string;
  children: ReactNode;
  cta?: { label: string; href: string };
  footerNote?: string;
  appUrl: string;
};

export function CartflowLayout({
  preview,
  title,
  children,
  cta,
  footerNote,
  appUrl,
}: CartflowLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>CartFlow</Text>
            <Heading style={heading}>{title}</Heading>
            <Section style={content}>{children}</Section>
            {cta ? (
              <Section style={ctaWrap}>
                <Button href={cta.href} style={button}>
                  {cta.label}
                </Button>
              </Section>
            ) : null}
            {footerNote ? (
              <>
                <Hr style={hr} />
                <Text style={footerNoteStyle}>{footerNote}</Text>
              </>
            ) : null}
          </Section>
          <Text style={siteFooter}>
            <Link href={appUrl} style={siteLink}>
              {appUrl.replace(/^https?:\/\//, "")}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailParagraph({ children }: { children: ReactNode }) {
  return <Text style={paragraph}>{children}</Text>;
}

export function EmailList({ items }: { items: string[] }) {
  return (
    <Section style={listSection}>
      {items.map((item) => (
        <Text key={item} style={listItem}>
          • {item}
        </Text>
      ))}
    </Section>
  );
}

const body: CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: colors.bg,
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};

const container: CSSProperties = {
  margin: "0 auto",
  padding: "32px 16px",
  maxWidth: "552px",
};

const card: CSSProperties = {
  backgroundColor: colors.card,
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  padding: "28px",
};

const brand: CSSProperties = {
  margin: "0 0 12px",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: colors.gold,
};

const heading: CSSProperties = {
  margin: "0 0 16px",
  fontSize: "22px",
  lineHeight: "1.3",
  fontWeight: 700,
  color: colors.text,
};

const content: CSSProperties = {
  margin: 0,
};

const paragraph: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "14px",
  lineHeight: "1.65",
  color: colors.muted,
};

const listSection: CSSProperties = {
  margin: "0 0 14px",
};

const listItem: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "14px",
  lineHeight: "1.5",
  color: colors.muted,
};

const ctaWrap: CSSProperties = {
  marginTop: "24px",
};

const button: CSSProperties = {
  backgroundColor: colors.button,
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 22px",
  borderRadius: "999px",
};

const hr: CSSProperties = {
  borderColor: colors.border,
  margin: "24px 0 16px",
};

const footerNoteStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.5",
  color: colors.soft,
};

const siteFooter: CSSProperties = {
  margin: "16px 0 0",
  textAlign: "center",
  fontSize: "11px",
  color: colors.soft,
};

const siteLink: CSSProperties = {
  color: colors.soft,
  textDecoration: "underline",
};
