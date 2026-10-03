import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { isAuthenticated } from "./auth.server";
import { dbErrorMessage } from "./billing.server";
import { dbConfigured, ensureSchema, getSql } from "./db.server";
import type { PromotionCampaign, Result } from "@/lib/types";

const AUTH_ERROR = "Session expired. Please log in again.";

function authError(): { ok: false; error: string } | null {
  if (!isAuthenticated()) return { ok: false, error: AUTH_ERROR };
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fromAddress(): string {
  return process.env["RESEND_FROM_EMAIL"] || "Khan Jewellers <onboarding@resend.dev>";
}

function wrapHtml(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;color:#2b2b2b;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6ddcf;padding:32px;">
      <h1 style="margin:0 0 4px;font-size:22px;letter-spacing:0.12em;text-transform:uppercase;color:#8a6d2f;">Khan Jewellers</h1>
      <p style="margin:0 0 24px;font-size:12px;color:#8a8a8a;letter-spacing:0.2em;text-transform:uppercase;">Rajarhat, Kolkata</p>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e6ddcf;margin:28px 0 12px;" />
      <p style="font-size:12px;color:#8a8a8a;margin:0;">
        Noipukur, Rajarhat &middot; +91 8240570878 &middot; +91 7439491412
      </p>
    </div>
  </body>
</html>`;
}

export type PromotionInput = {
  subject: string;
  bodyHtml: string;
  recipients: string[];
};

export type PromotionSendResult = {
  sent: number;
  failed: number;
  errors: string[];
};

export const sendPromotionFn = createServerFn({ method: "POST" })
  .validator((input: PromotionInput): PromotionInput => input)
  .handler(async ({ data }): Promise<Result<PromotionSendResult>> => {
    const denied = authError();
    if (denied) return denied;

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      return {
        ok: false,
        error: "RESEND_API_KEY is not configured. Add it to your environment and restart.",
      };
    }

    const subject = data.subject?.trim();
    if (!subject) return { ok: false, error: "Subject is required." };
    if (!data.bodyHtml?.trim()) return { ok: false, error: "Email body is required." };

    const recipients = [...new Set((data.recipients ?? []).map((r) => r.trim()).filter(Boolean))];
    if (!recipients.length) return { ok: false, error: "Add at least one recipient." };
    const invalid = recipients.filter((r) => !EMAIL_RE.test(r));
    if (invalid.length) {
      return {
        ok: false,
        error: `Invalid email address${invalid.length > 1 ? "es" : ""}: ${invalid.join(", ")}`,
      };
    }

    const resend = new Resend(apiKey);
    const html = wrapHtml(data.bodyHtml);
    const errors: string[] = [];
    let sent = 0;
    let failed = 0;

    const results = await Promise.allSettled(
      recipients.map((email) =>
        resend.emails.send({ from: fromAddress(), to: email, subject, html }),
      ),
    );

    results.forEach((result, index) => {
      const email = recipients[index] ?? "?";
      if (result.status === "rejected") {
        failed += 1;
        errors.push(`${email}: ${String(result.reason)}`);
        return;
      }
      const value = result.value;
      if ("error" in value && value.error) {
        failed += 1;
        errors.push(`${email}: ${value.error.message}`);
      } else {
        sent += 1;
      }
    });

    // Campaign history is best-effort — email sending already happened.
    if (dbConfigured()) {
      try {
        await ensureSchema();
        const sql = getSql();
        await sql.query(
          `INSERT INTO promotion_campaigns (subject, body_html, recipients, sent_count, failed_count, status)
           VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
          [
            subject,
            data.bodyHtml,
            JSON.stringify(recipients),
            sent,
            failed,
            failed === 0 ? "sent" : sent > 0 ? "partial" : "failed",
          ],
        );
      } catch (error) {
        console.error("Failed to record promotion campaign:", error);
      }
    }

    if (sent === 0) {
      return { ok: false, error: `All sends failed: ${errors.join("; ")}` };
    }
    return { ok: true, data: { sent, failed, errors } };
  });

export const listCampaignsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Result<{ campaigns: PromotionCampaign[] }>> => {
    const denied = authError();
    if (denied) return denied;
    if (!dbConfigured()) return { ok: true, data: { campaigns: [] } };
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`
        SELECT
          id,
          subject,
          recipients,
          sent_count AS "sentCount",
          failed_count AS "failedCount",
          status,
          created_at::text AS "createdAt"
        FROM promotion_campaigns
        ORDER BY created_at DESC, id DESC
        LIMIT 50`;
      return { ok: true, data: { campaigns: rows as unknown as PromotionCampaign[] } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  },
);
