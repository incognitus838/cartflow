import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";

const colors = {
  bg: "#ececef",
  card: "#ffffff",
  text: "#1d1d1f",
  muted: "#515154",
  soft: "#86868b",
  gold: "#b8956a",
  goldSoft: "#f7f1e8",
  border: "#e8e8ed",
  ink: "#1d1d1f",
  success: "#1a7f5a",
  danger: "#c41e1e",
  surface: "#fbfbfd",
};

type CartflowLayoutProps = {
  preview: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  cta?: { label: string; href: string };
  footerNote?: string;
  appUrl: string;
  tone?: "default" | "success" | "danger" | "commerce";
};

export function CartflowLayout({
  preview,
  title,
  eyebrow = "CartFlow",
  children,
  cta,
  footerNote,
  appUrl,
  tone = "default",
}: CartflowLayoutProps) {
  const accent =
    tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.gold;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Top brand strip */}
          <Section style={{ ...headerStrip, borderBottom: `3px solid ${accent}` }}>
            <Row>
              <Column>
                <Text style={logoMark}>CartFlow</Text>
              </Column>
              <Column align="right">
                <Text style={headerTag}>Transactional notice</Text>
              </Column>
            </Row>
          </Section>

          <Section style={card}>
            <Text style={{ ...eyebrowStyle, color: accent }}>{eyebrow}</Text>
            <Heading style={heading}>{title}</Heading>
            <Hr style={titleRule} />
            <Section style={content}>{children}</Section>

            {cta ? (
              <Section style={ctaWrap}>
                <Button href={cta.href} style={{ ...button, backgroundColor: colors.ink }}>
                  {cta.label}
                </Button>
              </Section>
            ) : null}

            {footerNote ? (
              <Section style={noteBox}>
                <Text style={footerNoteStyle}>{footerNote}</Text>
              </Section>
            ) : null}
          </Section>

          <Section style={bottomBar}>
            <Text style={siteFooter}>
              Sent by CartFlow ·{" "}
              <Link href={appUrl} style={siteLink}>
                {appUrl.replace(/^https?:\/\//, "")}
              </Link>
            </Text>
            <Text style={legal}>
              This is an automated message. Please do not reply directly to this email.
            </Text>
          </Section>
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
          <span style={bullet}>●</span>
          {item}
        </Text>
      ))}
    </Section>
  );
}

/** Label / value rows for order details */
export function DetailCard({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <Section style={detailCard}>
      {rows.map((row, index) => (
        <Row key={row.label} style={index === 0 ? detailRowFirst : detailRow}>
          <Column style={detailLabelCol}>
            <Text style={detailLabel}>{row.label}</Text>
          </Column>
          <Column style={detailValueCol}>
            <Text style={detailValue}>{row.value}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

export function StatusPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "success" | "danger";
}) {
  const bg =
    tone === "success" ? "#e8f5ef" : tone === "danger" ? "#fdecec" : colors.goldSoft;
  const color =
    tone === "success" ? colors.success : tone === "danger" ? colors.danger : "#8a6d45";
  return (
    <Text style={{ ...statusPill, backgroundColor: bg, color }}>
      {label}
    </Text>
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
  padding: "40px 16px",
  maxWidth: "580px",
};

const headerStrip: CSSProperties = {
  backgroundColor: colors.ink,
  borderRadius: "16px 16px 0 0",
  padding: "18px 24px",
};

const logoMark: CSSProperties = {
  margin: 0,
  fontSize: "15px",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "#ffffff",
};

const headerTag: CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 500,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.55)",
};

const card: CSSProperties = {
  backgroundColor: colors.card,
  borderLeft: `1px solid ${colors.border}`,
  borderRight: `1px solid ${colors.border}`,
  borderBottom: `1px solid ${colors.border}`,
  borderRadius: "0 0 16px 16px",
  padding: "32px 28px 28px",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const heading: CSSProperties = {
  margin: "0 0 16px",
  fontSize: "26px",
  lineHeight: "1.25",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  color: colors.text,
};

const titleRule: CSSProperties = {
  borderColor: colors.border,
  borderTop: `1px solid ${colors.border}`,
  margin: "0 0 20px",
};

const content: CSSProperties = {
  margin: 0,
};

const paragraph: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "15px",
  lineHeight: "1.65",
  color: colors.muted,
};

const listSection: CSSProperties = {
  margin: "4px 0 18px",
  padding: "14px 16px",
  backgroundColor: colors.surface,
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
};

const listItem: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "14px",
  lineHeight: "1.5",
  color: colors.muted,
};

const bullet: CSSProperties = {
  color: colors.gold,
  fontSize: "8px",
  marginRight: "10px",
  verticalAlign: "middle",
};

const detailCard: CSSProperties = {
  margin: "8px 0 20px",
  padding: "4px 0",
  backgroundColor: colors.surface,
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
  overflow: "hidden",
};

const detailRowFirst: CSSProperties = {
  padding: "12px 16px 8px",
};

const detailRow: CSSProperties = {
  padding: "8px 16px",
  borderTop: `1px solid ${colors.border}`,
};

const detailLabelCol: CSSProperties = {
  width: "38%",
  verticalAlign: "top",
};

const detailValueCol: CSSProperties = {
  width: "62%",
  verticalAlign: "top",
};

const detailLabel: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: colors.soft,
};

const detailValue: CSSProperties = {
  margin: 0,
  fontSize: "14px",
  fontWeight: 600,
  color: colors.text,
  textAlign: "right",
};

const statusPill: CSSProperties = {
  display: "inline-block",
  margin: "0 0 16px",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

const ctaWrap: CSSProperties = {
  marginTop: "8px",
  marginBottom: "8px",
  textAlign: "left",
};

const button: CSSProperties = {
  backgroundColor: colors.ink,
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 26px",
  borderRadius: "999px",
};

const noteBox: CSSProperties = {
  marginTop: "24px",
  padding: "14px 16px",
  backgroundColor: colors.goldSoft,
  borderRadius: "12px",
};

const footerNoteStyle: CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: "1.55",
  color: "#6b5740",
};

const bottomBar: CSSProperties = {
  marginTop: "20px",
  textAlign: "center",
};

const siteFooter: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  color: colors.soft,
};

const siteLink: CSSProperties = {
  color: colors.soft,
  textDecoration: "underline",
};

const legal: CSSProperties = {
  margin: 0,
  fontSize: "11px",
  color: "#a1a1a6",
};
