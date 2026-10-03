import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getInvoiceFn } from "@/fns/billing.server";
import { ErrorBanner, btnGhostCls, inr, tdCls, thCls } from "@/components/admin-ui";
import { amountInWords } from "@/lib/invoice-math";
import type { InvoiceDetail } from "@/lib/types";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/admin/billing/$id")({
  component: BillPrint,
});

function BillPrint() {
  const { id } = Route.useParams();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    getInvoiceFn({ data: Number(id) })
      .then((res) => {
        if (!alive) return;
        if (res.ok) setInvoice(res.data.invoice);
        else setError(res.error);
      })
      .catch(() => alive && setError("Failed to load the invoice."));
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <div>
        <ErrorBanner message={error} />
        <Link to="/admin/billing" className={`${btnGhostCls} mt-4`}>
          &larr; Back to billing
        </Link>
      </div>
    );
  }
  if (!invoice) return <p className="text-sm text-muted-foreground">Loading invoice...</p>;

  const t = invoice.totals;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/admin/billing"
          className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary"
        >
          &larr; All bills
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className={btnGhostCls}>
            Print
          </button>
        </div>
      </div>

      {/* Printable invoice */}
      <div className="card-lux mt-4 rounded-sm p-8 text-[13px] leading-relaxed print:mt-0 print:border print:border-border/60 print:bg-white print:text-black">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4 print:border-black/40">
          <div className="flex items-center gap-4">
            <img
              src={logoImg}
              alt="Khan Jewellers"
              className="h-16 w-16 rounded-full ring-1 ring-primary/40 print:ring-black/30"
            />
            <div>
              <h1 className="font-display text-3xl text-primary print:text-black">
                KHAN JEWELLERS
              </h1>
              <p className="mt-1 text-xs text-muted-foreground print:text-black/70">
                Bidhannagar Branch &middot; Rajarhat, Kolkata
                <br />
                GSTIN: 19ABCDE1234F1Z5 &middot; Ph: 8240570878 / 7439491412
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground print:text-black/60">
              Tax Invoice
            </p>
            <p className="mt-1 font-medium">{invoice.billNo}</p>
            <p>Date: {invoice.billDate}</p>
            {invoice.billTime ? <p>Time: {invoice.billTime}</p> : null}
            {invoice.orderNo ? <p>Order: {invoice.orderNo}</p> : null}
          </div>
        </div>

        {/* Customer */}
        <div className="grid gap-4 border-b border-border/60 py-4 print:border-black/40 sm:grid-cols-2">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground print:text-black/60">
              Bill To
            </p>
            <p className="mt-1 font-medium">{invoice.customerName}</p>
            {invoice.customerPhone ? <p>Phone: {invoice.customerPhone}</p> : null}
            {invoice.customerAddress ? <p>{invoice.customerAddress}</p> : null}
          </div>
          <div className="text-right">
            {invoice.customerGstin ? <p>Customer GSTIN: {invoice.customerGstin}</p> : null}
            {invoice.customerAadhar ? <p>Aadhaar: {invoice.customerAadhar}</p> : null}
            {invoice.customerPan ? <p>PAN: {invoice.customerPan}</p> : null}
            {invoice.rateGold22 !== undefined ? (
              <p>Gold 22K Rate: &#8377;{inr(invoice.rateGold22)}</p>
            ) : null}
            {invoice.rateGold18 !== undefined ? (
              <p>Gold 18K Rate: &#8377;{inr(invoice.rateGold18)}</p>
            ) : null}
            {invoice.rateSilver !== undefined ? (
              <p>Silver Rate: &#8377;{inr(invoice.rateSilver)}</p>
            ) : null}
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <th className={thCls}>SL</th>
                <th className={thCls}>Description</th>
                <th className={thCls}>HSN</th>
                <th className={thCls}>HUID</th>
                <th className={thCls}>Purity</th>
                <th className={`${thCls} text-right`}>Qty</th>
                <th className={`${thCls} text-right`}>Gross Wt</th>
                <th className={`${thCls} text-right`}>Net Wt</th>
                <th className={`${thCls} text-right`}>Rate</th>
                <th className={`${thCls} text-right`}>Value Add.</th>
                <th className={`${thCls} text-right`}>Amount (&#8377;)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((line) => (
                <tr key={line.sl}>
                  <td className={tdCls}>{line.sl}</td>
                  <td className={tdCls}>
                    {line.itemName}
                    {line.itemCode ? (
                      <span className="ml-2 text-xs text-muted-foreground">[{line.itemCode}]</span>
                    ) : null}
                  </td>
                  <td className={tdCls}>{line.hsn ?? "-"}</td>
                  <td className={tdCls}>{line.huid ?? "-"}</td>
                  <td className={tdCls}>{line.purity ?? "-"}</td>
                  <td className={`${tdCls} text-right`}>{line.qty}</td>
                  <td className={`${tdCls} text-right`}>{inr(line.grossWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(line.netWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(line.rate)}</td>
                  <td className={`${tdCls} text-right`}>{inr(line.valueAddition)}</td>
                  <td className={`${tdCls} text-right font-medium`}>{inr(line.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className={`${tdCls} font-medium`} colSpan={6}>
                  Total
                </td>
                <td className={`${tdCls} text-right font-medium`}>{inr(t.totalGrossWt)}</td>
                <td className={`${tdCls} text-right font-medium`}>{inr(t.totalNetWt)}</td>
                <td className={tdCls}></td>
                <td className={`${tdCls} text-right font-medium`}>{inr(t.totalLabour)}</td>
                <td className={`${tdCls} text-right font-medium text-primary print:text-black`}>
                  {inr(t.itemsTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Old ornaments */}
        {invoice.oldOrnaments.length > 0 && (
          <div className="mt-4 border border-border/40 p-3 print:border-black/40">
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground print:text-black/60">
              Old Ornament Exchange
            </p>
            <table className="mt-2 w-full">
              <tbody>
                {invoice.oldOrnaments.map((o, i) => (
                  <tr key={i}>
                    <td className={tdCls}>{o.itemName}</td>
                    <td className={`${tdCls} text-right`}>{inr(o.netWt)} g</td>
                    <td className={`${tdCls} text-right`}>&#8377;{inr(o.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="text-xs text-muted-foreground print:text-black/70">
            <p>
              <span className="font-medium text-foreground print:text-black">Amount in words:</span>{" "}
              <em>{amountInWords(t.payableAmount)}</em>
            </p>
            <p className="mt-2">
              Hallmark: {invoice.hallmarkQty} x &#8377;{inr(invoice.hallmarkChargeEach)} = &#8377;
              {inr(t.hallmarkCharges)}
            </p>
            <p>
              GST: {invoice.metalGstPct}% on items + {invoice.hallmarkGstPct}% on hallmark
            </p>
            {invoice.paymentMode ? <p>Payment Mode: {invoice.paymentMode}</p> : null}
            {invoice.remarks ? <p>Remarks: {invoice.remarks}</p> : null}
          </div>
          <dl className="space-y-1.5">
            <SummaryRow label="Items Total" value={t.itemsTotal} />
            <SummaryRow label="Hallmark Charges" value={t.hallmarkCharges} />
            <SummaryRow label="CGST" value={t.cgst} />
            <SummaryRow label="SGST" value={t.sgst} />
            <SummaryRow label="Gross Amount" value={t.grossAmount} />
            {t.oldOrnamentDeduction ? (
              <SummaryRow label="Old Ornament" value={-t.oldOrnamentDeduction} />
            ) : null}
            {t.discount ? <SummaryRow label="Discount" value={-t.discount} /> : null}
            <SummaryRow label="Round Off" value={t.roundOff} />
            <div className="flex items-center justify-between border-t border-border/60 pt-1.5 print:border-black/40">
              <dt className="font-medium">Payable Amount</dt>
              <dd className="font-medium tabular-nums text-primary print:text-black">
                &#8377;{inr(t.payableAmount)}
              </dd>
            </div>
            <SummaryRow label="Received" value={t.paymentReceived} />
            <SummaryRow label="Balance" value={t.balance} bold />
          </dl>
        </div>

        {/* Signature */}
        <div className="mt-10 flex justify-end">
          <div className="text-center text-xs">
            <div className="w-48 border-t border-border/60 pt-1 print:border-black/40">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 text-sm ${bold ? "font-medium" : ""}`}>
      <dt className="text-muted-foreground print:text-black/70">{label}</dt>
      <dd className="tabular-nums">{inr(value)}</dd>
    </div>
  );
}
