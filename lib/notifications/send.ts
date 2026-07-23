import { sendEmail } from "@/lib/email/client";
import { prisma } from "@/lib/db";
import type { NotificationChannel } from "@prisma/client";

type SendNotificationInput = {
  businessId?: string;
  orderId?: string;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
  html?: string;
};

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  );
}

async function deliverSms(recipient: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!.trim();
  const token = process.env.TWILIO_AUTH_TOKEN!.trim();
  const from = process.env.TWILIO_FROM_NUMBER!.trim();

  const params = new URLSearchParams({
    To: recipient,
    From: from,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "SMS delivery failed.");
  }
}

export async function sendNotification(input: SendNotificationInput) {
  // SMS is deferred until Twilio is configured — skip quietly (no FAILED spam).
  if (input.channel === "SMS" && !isSmsConfigured()) {
    return;
  }

  const log = await prisma.notificationLog.create({
    data: {
      businessId: input.businessId,
      orderId: input.orderId,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      status: "PENDING",
    },
  });

  try {
    if (input.channel === "EMAIL") {
      const result = await sendEmail({
        to: input.recipient,
        subject: input.subject || "CartFlow",
        text: input.body,
        html: input.html,
        from: "notification",
      });
      if (!result.sent) {
        throw new Error(result.error);
      }
    } else {
      await deliverSms(input.recipient, input.body);
    }

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: "SENT" },
    });
  } catch (error) {
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Delivery failed",
      },
    });
  }
}
