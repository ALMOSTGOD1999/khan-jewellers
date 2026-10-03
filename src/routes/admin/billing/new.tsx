import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getNextBillNoFn, saveInvoiceFn } from "@/fns/billing.server";
import {
  ErrorBanner,
  Field,
  btnGhostCls,
  btnPrimaryCls,
  inr,
  inputCls,
  labelCls,
  num,
  numInputProps,
  tdCls,
  thCls,
} from "@/components/admin-ui";
import { amountInWords, computeTotals } from "@/lib/invoice-math";
import type { InvoiceInput, InvoiceItemInput, OldOrnamentInput } from "@/lib/types";

export const Route = createFileRoute("/admin/billing/new")({
  component: NewBill,
});

const EMPTY_ITEM: InvoiceItemInput = {
  itemName: "",
  itemCode: "",
  hsn: "",
  huid: "",
  purity: "",
  unit: "PCS",
  qty: 1,
  grossWt: 0,
  netWt: 0,
  rate: 0,
  valueAddition: 0,
};

const EMPTY_ORNAMENT: OldOrnamentInput = { itemName: "", netWt: 0, amount: 0 };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

function NewBill() {
  const router = useRouter();

  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState(today());
  const [billTime, setBillTime] = useState(nowTime());
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [customerAadhar, setCustomerAadhar] = useState("");
  const [customerPan, setCustomerPan] = useState("");
  const [rateGold22, setRateGold22] = useState("");
  const [rateGold18, setRateGold18] = useState("");
  const [rateSilver, setRateSilver] = useState("");
  const [items, setItems] = useState<InvoiceItemInput[]>([{ ...EMPTY_ITEM }]);
  const [oldOrnaments, setOldOrnaments] = useState<OldOrnamentInput[]>([]);
  const [hallmarkQty, setHallmarkQty] = useState("");
  const [hallmarkChargeEach, setHallmarkChargeEach] = useState("");
  const [metalGstPct, setMetalGstPct] = useState("3");
  const [hallmarkGstPct, setHallmarkGstPct] = useState("18");
  const [oldDeduction, setOldDeduction] = useState("");
  const [discount, setDiscount] = useState("");
  const [payableOverride, setPayableOverride] = useState("");
  const [paymentReceived, setPaymentReceived] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getNextBillNoFn()
      .then((res) => {
        if (res.ok) setBillNo((prev) => prev || res.data.billNo);
        else setBanner(res.error);
      })
      .catch(() => setBanner("Could not fetch next bill number — enter it manually."));
  }, []);

  const totals = useMemo(
    () =>
      computeTotals({
        items,
        oldOrnaments,
        hallmarkQty: num(hallmarkQty),
        hallmarkChargeEach: num(hallmarkChargeEach),
        metalGstPct: num(metalGstPct),
        hallmarkGstPct: num(hallmarkGstPct),
        oldOrnamentDeduction: num(oldDeduction),
        discount: num(discount),
        ...(payableOverride !== "" && { payableOverride: num(payableOverride) }),
        paymentReceived: num(paymentReceived),
      }),
    [
      items,
      oldOrnaments,
      hallmarkQty,
      hallmarkChargeEach,
      metalGstPct,
      hallmarkGstPct,
      oldDeduction,
      discount,
      payableOverride,
      paymentReceived,
    ],
  );

  function setItem(index: number, patch: Partial<InvoiceItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function setOrnament(index: number, patch: Partial<OldOrnamentInput>) {
    setOldOrnaments((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  async function save() {
    setBusy(true);
    setError("");
    const input: InvoiceInput = {
      billNo: billNo.trim(),
      billDate,
      customerName: customerName.trim(),
      items,
      oldOrnaments,
      hallmarkQty: num(hallmarkQty),
      hallmarkChargeEach: num(hallmarkChargeEach),
      metalGstPct: num(metalGstPct),
      hallmarkGstPct: num(hallmarkGstPct),
      oldOrnamentDeduction: num(oldDeduction),
      discount: num(discount),
      paymentReceived: num(paymentReceived),
      ...(billTime && { billTime }),
      ...(orderNo.trim() && { orderNo: orderNo.trim() }),
      ...(orderDate && { orderDate }),
      ...(customerPhone.trim() && { customerPhone: customerPhone.trim() }),
      ...(customerAddress.trim() && { customerAddress: customerAddress.trim() }),
      ...(customerGstin.trim() && { customerGstin: customerGstin.trim() }),
      ...(customerAadhar.trim() && { customerAadhar: customerAadhar.trim() }),
      ...(customerPan.trim() && { customerPan: customerPan.trim() }),
      ...(rateGold22 !== "" && { rateGold22: num(rateGold22) }),
      ...(rateGold18 !== "" && { rateGold18: num(rateGold18) }),
      ...(rateSilver !== "" && { rateSilver: num(rateSilver) }),
      ...(payableOverride !== "" && { payableAmount: num(payableOverride) }),
      ...(paymentMode.trim() && { paymentMode: paymentMode.trim() }),
      ...(remarks.trim() && { remarks: remarks.trim() }),
    };
    try {
      const res = await saveInvoiceFn({ data: input });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.navigate({ to: "/admin/billing/$id", params: { id: String(res.data.id) } });
    } catch {
      setError("Failed to save the bill. Is the database configured?");
    } finally {
      setBusy(false);
    }
  }

  const numCell = "w-24";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/billing"
            className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground hover:text-primary"
          >
            &larr; All bills
          </Link>
          <h2 className="mt-1 font-display text-3xl">New Bill</h2>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/billing" className={btnGhostCls}>
            Cancel
          </Link>
          <button type="button" onClick={save} disabled={busy} className={btnPrimaryCls}>
            {busy ? "Saving..." : "Save Bill"}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ErrorBanner message={error || banner} />
      </div>

      {/* Bill + customer */}
      <div className="card-lux mt-4 grid gap-4 rounded-sm p-6 md:grid-cols-3">
        <Field label="Bill No">
          <input className={inputCls} value={billNo} onChange={(e) => setBillNo(e.target.value)} />
        </Field>
        <Field label="Bill Date">
          <input
            className={inputCls}
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
          />
        </Field>
        <Field label="Bill Time">
          <input
            className={inputCls}
            type="time"
            value={billTime}
            onChange={(e) => setBillTime(e.target.value)}
          />
        </Field>
        <Field label="Order No">
          <input
            className={inputCls}
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
          />
        </Field>
        <Field label="Order Date">
          <input
            className={inputCls}
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
        </Field>
        <Field label="Payment Mode">
          <input
            className={inputCls}
            placeholder="Cash / UPI / Card"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          />
        </Field>
        <Field label="Customer Name">
          <input
            className={inputCls}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className={inputCls}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </Field>
        <Field label="Address">
          <input
            className={inputCls}
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
        </Field>
        <Field label="GSTIN">
          <input
            className={inputCls}
            value={customerGstin}
            onChange={(e) => setCustomerGstin(e.target.value)}
          />
        </Field>
        <Field label="Aadhaar">
          <input
            className={inputCls}
            value={customerAadhar}
            onChange={(e) => setCustomerAadhar(e.target.value)}
          />
        </Field>
        <Field label="PAN">
          <input
            className={inputCls}
            value={customerPan}
            onChange={(e) => setCustomerPan(e.target.value)}
          />
        </Field>
      </div>

      {/* Rates */}
      <div className="card-lux mt-4 grid gap-4 rounded-sm p-6 md:grid-cols-3">
        <Field label="Gold 22K Rate">
          <input
            className={inputCls}
            {...numInputProps}
            value={rateGold22}
            onChange={(e) => setRateGold22(e.target.value)}
          />
        </Field>
        <Field label="Gold 18K Rate">
          <input
            className={inputCls}
            {...numInputProps}
            value={rateGold18}
            onChange={(e) => setRateGold18(e.target.value)}
          />
        </Field>
        <Field label="Silver Rate">
          <input
            className={inputCls}
            {...numInputProps}
            value={rateSilver}
            onChange={(e) => setRateSilver(e.target.value)}
          />
        </Field>
      </div>

      {/* Items */}
      <div className="card-lux mt-4 rounded-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-primary">Items</h3>
          <button
            type="button"
            className={btnGhostCls}
            onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
          >
            + Add Item
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr>
                <th className={thCls}>#</th>
                <th className={thCls}>Item</th>
                <th className={thCls}>Code</th>
                <th className={thCls}>HSN</th>
                <th className={thCls}>HUID</th>
                <th className={thCls}>Purity</th>
                <th className={thCls}>Qty</th>
                <th className={thCls}>Gross Wt</th>
                <th className={thCls}>Net Wt</th>
                <th className={thCls}>Rate</th>
                <th className={thCls}>Value Add.</th>
                <th className={thCls}>Amount</th>
                <th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const line = totals.lines[index];
                return (
                  <tr key={index}>
                    <td className={tdCls}>{index + 1}</td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} min-w-36`}
                        value={item.itemName}
                        onChange={(e) => setItem(index, { itemName: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-24`}
                        value={item.itemCode ?? ""}
                        onChange={(e) => setItem(index, { itemCode: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-20`}
                        value={item.hsn ?? ""}
                        onChange={(e) => setItem(index, { hsn: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-24`}
                        value={item.huid ?? ""}
                        onChange={(e) => setItem(index, { huid: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-20`}
                        value={item.purity ?? ""}
                        onChange={(e) => setItem(index, { purity: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} ${numCell}`}
                        {...numInputProps}
                        value={item.qty}
                        onChange={(e) => setItem(index, { qty: num(e.target.value) })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} ${numCell}`}
                        {...numInputProps}
                        value={item.grossWt}
                        onChange={(e) => setItem(index, { grossWt: num(e.target.value) })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} ${numCell}`}
                        {...numInputProps}
                        value={item.netWt}
                        onChange={(e) => setItem(index, { netWt: num(e.target.value) })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} ${numCell}`}
                        {...numInputProps}
                        value={item.rate}
                        onChange={(e) => setItem(index, { rate: num(e.target.value) })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} ${numCell}`}
                        {...numInputProps}
                        value={item.valueAddition}
                        onChange={(e) => setItem(index, { valueAddition: num(e.target.value) })}
                      />
                    </td>
                    <td
                      className={`${tdCls} whitespace-nowrap text-right font-medium text-primary`}
                    >
                      {inr(line?.totalAmount ?? 0)}
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                        disabled={items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Old ornaments */}
      <div className="card-lux mt-4 rounded-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-primary">Old Ornament Exchange</h3>
          <button
            type="button"
            className={btnGhostCls}
            onClick={() => setOldOrnaments((prev) => [...prev, { ...EMPTY_ORNAMENT }])}
          >
            + Add Entry
          </button>
        </div>
        {oldOrnaments.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className={thCls}>Item</th>
                  <th className={thCls}>Net Wt</th>
                  <th className={thCls}>Amount</th>
                  <th className={thCls}></th>
                </tr>
              </thead>
              <tbody>
                {oldOrnaments.map((orn, index) => (
                  <tr key={index}>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} min-w-40`}
                        value={orn.itemName}
                        onChange={(e) => setOrnament(index, { itemName: e.target.value })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-28`}
                        {...numInputProps}
                        value={orn.netWt}
                        onChange={(e) => setOrnament(index, { netWt: num(e.target.value) })}
                      />
                    </td>
                    <td className={tdCls}>
                      <input
                        className={`${inputCls} w-32`}
                        {...numInputProps}
                        value={orn.amount}
                        onChange={(e) => setOrnament(index, { amount: num(e.target.value) })}
                      />
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setOldOrnaments((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charges + totals */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card-lux grid gap-4 rounded-sm p-6 sm:grid-cols-2">
          <h3 className="font-display text-2xl text-primary sm:col-span-2">Charges & Tax</h3>
          <Field label="Hallmark Qty">
            <input
              className={inputCls}
              {...numInputProps}
              value={hallmarkQty}
              onChange={(e) => setHallmarkQty(e.target.value)}
            />
          </Field>
          <Field label="Hallmark Charge Each">
            <input
              className={inputCls}
              {...numInputProps}
              value={hallmarkChargeEach}
              onChange={(e) => setHallmarkChargeEach(e.target.value)}
            />
          </Field>
          <Field label="Metal GST %">
            <input
              className={inputCls}
              {...numInputProps}
              value={metalGstPct}
              onChange={(e) => setMetalGstPct(e.target.value)}
            />
          </Field>
          <Field label="Hallmark GST %">
            <input
              className={inputCls}
              {...numInputProps}
              value={hallmarkGstPct}
              onChange={(e) => setHallmarkGstPct(e.target.value)}
            />
          </Field>
          <Field label="Old Ornament Deduction">
            <input
              className={inputCls}
              {...numInputProps}
              value={oldDeduction}
              onChange={(e) => setOldDeduction(e.target.value)}
            />
          </Field>
          <Field label="Discount">
            <input
              className={inputCls}
              {...numInputProps}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </Field>
          <Field label="Payable (manual override)" hint="Leave blank for auto total">
            <input
              className={inputCls}
              {...numInputProps}
              value={payableOverride}
              onChange={(e) => setPayableOverride(e.target.value)}
            />
          </Field>
          <Field label="Payment Received">
            <input
              className={inputCls}
              {...numInputProps}
              value={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.value)}
            />
          </Field>
          <Field label="Remarks" className="sm:col-span-2">
            <input
              className={inputCls}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Field>
        </div>

        <div className="card-lux rounded-sm p-6">
          <h3 className="font-display text-2xl text-primary">Totals</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <TotalRow label="Items Total" value={totals.totals.itemsTotal} />
            <TotalRow
              label={`Hallmark Charges (${inr(num(hallmarkQty))} x ${inr(num(hallmarkChargeEach))})`}
              value={totals.totals.hallmarkCharges}
            />
            <TotalRow label={`CGST`} value={totals.totals.cgst} />
            <TotalRow label={`SGST`} value={totals.totals.sgst} />
            <TotalRow label="Gross Amount" value={totals.totals.grossAmount} bold />
            <TotalRow label="Old Ornament Deduction" value={-totals.totals.oldOrnamentDeduction} />
            <TotalRow label="Discount" value={-totals.totals.discount} />
            <TotalRow label="Round Off" value={totals.totals.roundOff} />
            <TotalRow label="Payable Amount" value={totals.totals.payableAmount} bold accent />
            <TotalRow label="Payment Received" value={totals.totals.paymentReceived} />
            <TotalRow label="Balance" value={totals.totals.balance} bold />
            <div className="border-t border-border/40 pt-3">
              <span className={labelCls}>In Words</span>
              <p className="mt-1 text-sm italic text-foreground/80">
                {amountInWords(totals.totals.payableAmount)}
              </p>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${bold ? "font-medium" : ""} ${accent ? "text-primary" : ""}`}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{inr(value)}</dd>
    </div>
  );
}
