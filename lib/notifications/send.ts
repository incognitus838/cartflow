import { prisma } from "@/lib/db";
import type { NotificationChannel } from "@prisma/client";

type SendNotificationInput = {
  businessId?: string;
  orderId?: string;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  body: string;
};

async function deliverEmail(recipient: string, subject: string, body: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.NOTIFICATION_FROM_EMAIL?.trim() || "orders@cartflow.app";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured — email skipped.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [recipient], subject, text: body }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Email delivery failed.");
  }
}

async function deliverSms(recipient: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    throw new Error("Twilio is not configured — SMS skipped.");
  }

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
      await deliverEmail(input.recipient, input.subject || "CartFlow", input.body);
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