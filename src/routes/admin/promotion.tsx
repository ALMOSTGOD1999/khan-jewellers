import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { listCampaignsFn, sendPromotionFn } from "@/fns/promotion.server";
import {
  ErrorBanner,
  Field,
  btnPrimaryCls,
  inr,
  inputCls,
  labelCls,
  shortDate,
  tdCls,
  thCls,
} from "@/components/admin-ui";
import type { PromotionCampaign } from "@/lib/types";

export const Route = createFileRoute("/admin/promotion")({
  component: PromotionPage,
});

type SendSummary = { sent: number; failed: number; errors: string[] };

function PromotionPage() {
  const [subject, setSubject] = useState("");
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<SendSummary | null>(null);
  const [busy, setBusy] = useState(false);

  const loadCampaigns = useCallback(async () => {
    const res = await listCampaignsFn();
    if (res.ok) setCampaigns(res.data.campaigns);
  }, []);

  useEffect(() => {
    loadCampaigns().catch(() => undefined);
  }, [loadCampaigns]);

  async function send() {
    setBusy(true);
    setError("");
    setSummary(null);
    const recipients = recipientsRaw
      .split(/[\n,;]+/)
      .map((r) => r.trim())
      .filter(Boolean);
    try {
      const res = await sendPromotionFn({ data: { subject, bodyHtml, recipients } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSummary(res.data);
      loadCampaigns().catch(() => undefined);
    } catch {
      setError("Failed to send. Check server configuration (RESEND_API_KEY).");
    } finally {
      setBusy(false);
    }
  }

  const recipientCount = recipientsRaw.split(/[\n,;]+/).filter((r) => r.trim()).length;

  return (
    <div>
      <div>
        <h2 className="font-display text-3xl">Promotion</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send promotional emails to customers via Resend.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="card-lux rounded-sm p-6">
          <h3 className="font-display text-2xl text-primary">Compose</h3>
          <div className="mt-4 space-y-4">
            <ErrorBanner message={error} />
            {summary && (
              <div className="rounded-sm border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
                Sent {inr(summary.sent)} email{summary.sent === 1 ? "" : "s"}
                {summary.failed > 0 ? `, ${summary.failed} failed` : ""}.
                {summary.errors.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                    {summary.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <Field label="Subject">
              <input
                className={inputCls}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Festive offer on gold jewellery"
              />
            </Field>
            <Field
              label={`Recipients (${recipientCount})`}
              hint="One email per line (comma or semicolon also works)"
            >
              <textarea
                className={`${inputCls} min-h-28 font-mono text-xs`}
                value={recipientsRaw}
                onChange={(e) => setRecipientsRaw(e.target.value)}
                placeholder={"customer1@example.com\ncustomer2@example.com"}
              />
            </Field>
            <Field label="Email Body (HTML allowed)">
              <textarea
                className={`${inputCls} min-h-48`}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                placeholder="<p>Dear customer,</p><p>Enjoy up to 20% off on making charges this festive season.</p>"
              />
            </Field>
            <button
              type="button"
              onClick={send}
              disabled={busy || !subject.trim() || !bodyHtml.trim() || recipientCount === 0}
              className={`${btnPrimaryCls} w-full`}
            >
              {busy
                ? "Sending..."
                : `Send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>

        <div className="card-lux rounded-sm p-6">
          <h3 className="font-display text-2xl text-primary">Campaign History</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr>
                  <th className={thCls}>Date</th>
                  <th className={thCls}>Subject</th>
                  <th className={`${thCls} text-right`}>Sent</th>
                  <th className={`${thCls} text-right`}>Failed</th>
                  <th className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td className={`${tdCls} text-muted-foreground`} colSpan={5}>
                      No campaigns yet. (Requires database.)
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className={tdCls}>{shortDate(c.createdAt.slice(0, 10))}</td>
                      <td className={tdCls}>
                        {c.subject}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({c.recipients.length} recipients)
                        </span>
                      </td>
                      <td className={`${tdCls} text-right`}>{c.sentCount}</td>
                      <td className={`${tdCls} text-right`}>{c.failedCount}</td>
                      <td className={tdCls}>
                        <span className="rounded-sm border border-primary/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-primary">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className={`mt-6 ${labelCls}`}>Note</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Emails are sent through Resend. Set RESEND_API_KEY (and optionally RESEND_FROM_EMAIL) in
            the server environment. Unverified Resend domains can only send to your own account
            email.
          </p>
        </div>
      </div>
    </div>
  );
}
