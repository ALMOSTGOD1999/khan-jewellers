import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listInvoicesFn } from "@/fns/billing.server";
import {
  ErrorBanner,
  btnGhostCls,
  btnPrimaryCls,
  inr,
  shortDate,
  tdCls,
  thCls,
} from "@/components/admin-ui";
import type { InvoiceSummary } from "@/lib/types";

export const Route = createFileRoute("/admin/billing/")({
  component: BillingList,
});

function BillingList() {
  const [invoices, setInvoices] = useState<InvoiceSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    listInvoicesFn()
      .then((res) => {
        if (!alive) return;
        if (res.ok) setInvoices(res.data.invoices);
        else {
          setInvoices([]);
          setError(res.error);
        }
      })
      .catch(() => alive && setError("Failed to load invoices."));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            GST tax invoices and payment records.
          </p>
        </div>
        <Link to="/admin/billing/new" className={btnPrimaryCls}>
          + New Bill
        </Link>
      </div>

      <div className="mt-6">
        <ErrorBanner message={error} />
      </div>

      <div className="card-lux mt-4 overflow-x-auto rounded-sm">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className={thCls}>Bill No</th>
              <th className={thCls}>Date</th>
              <th className={thCls}>Customer</th>
              <th className={`${thCls} text-right`}>Net Wt (g)</th>
              <th className={`${thCls} text-right`}>Payable</th>
              <th className={`${thCls} text-right`}>Received</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {invoices === null ? (
              <tr>
                <td className={`${tdCls} text-muted-foreground`} colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td className={`${tdCls} text-muted-foreground`} colSpan={7}>
                  No invoices yet. Create your first bill.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className={`${tdCls} font-medium text-primary`}>{inv.billNo}</td>
                  <td className={tdCls}>{shortDate(inv.billDate)}</td>
                  <td className={tdCls}>
                    {inv.customerName}
                    {inv.customerPhone ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {inv.customerPhone}
                      </span>
                    ) : null}
                  </td>
                  <td className={`${tdCls} text-right`}>{inr(inv.totalNetWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(inv.payableAmount)}</td>
                  <td className={`${tdCls} text-right`}>{inr(inv.paymentReceived)}</td>
                  <td className={`${tdCls} text-right`}>
                    <Link
                      to="/admin/billing/$id"
                      params={{ id: String(inv.id) }}
                      className={btnGhostCls}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
