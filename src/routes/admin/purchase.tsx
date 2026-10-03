import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  deletePurchaseFn,
  listPurchasesFn,
  savePurchaseFn,
  type PurchaseInput,
} from "@/fns/purchase.server";
import {
  ErrorBanner,
  Field,
  btnGhostCls,
  btnPrimaryCls,
  inr,
  inputCls,
  num,
  numInputProps,
  shortDate,
  tdCls,
  thCls,
} from "@/components/admin-ui";
import type { PurchaseEntry } from "@/lib/types";

export const Route = createFileRoute("/admin/purchase")({
  component: PurchasePage,
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const BLANK: PurchaseInput = {
  purchaseDate: today(),
  supplierName: "",
  supplierPhone: "",
  itemName: "",
  category: "",
  purity: "",
  quantity: 1,
  grossWt: 0,
  netWt: 0,
  rate: 0,
  amount: 0,
  paymentMode: "",
  remarks: "",
};

function PurchasePage() {
  const [purchases, setPurchases] = useState<PurchaseEntry[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PurchaseInput | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await listPurchasesFn();
    if (res.ok) {
      setPurchases(res.data.purchases);
    } else {
      setPurchases([]);
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    load().catch(() => setError("Failed to load purchases."));
  }, [load]);

  async function save() {
    if (!form) return;
    setBusy(true);
    setError("");
    const res = await savePurchaseFn({ data: form });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setForm(null);
    load().catch(() => undefined);
  }

  async function remove(entry: PurchaseEntry) {
    if (!confirm(`Delete purchase ${entry.purchaseNo ?? entry.id} from ${entry.supplierName}?`))
      return;
    const res = await deletePurchaseFn({ data: entry.id });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    load().catch(() => undefined);
  }

  const totalAmount = purchases.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Purchase</h2>
          <p className="mt-1 text-sm text-muted-foreground">Supplier purchase register.</p>
        </div>
        <button type="button" className={btnPrimaryCls} onClick={() => setForm({ ...BLANK })}>
          + Add Purchase
        </button>
      </div>

      {purchases.length > 0 && (
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {purchases.length} entries &middot; total &#8377;{inr(totalAmount)}
        </p>
      )}

      <div className="mt-4">
        <ErrorBanner message={error} />
      </div>

      {form && (
        <div className="card-lux mt-4 grid gap-4 rounded-sm p-6 md:grid-cols-4">
          <h3 className="font-display text-2xl text-primary md:col-span-4">
            {form.id ? "Edit Purchase" : "Add Purchase"}
          </h3>
          <Field label="Date">
            <input
              className={inputCls}
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            />
          </Field>
          <Field label="Supplier">
            <input
              className={inputCls}
              value={form.supplierName}
              onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
            />
          </Field>
          <Field label="Supplier Phone">
            <input
              className={inputCls}
              value={form.supplierPhone ?? ""}
              onChange={(e) => setForm({ ...form, supplierPhone: e.target.value })}
            />
          </Field>
          <Field label="Purchase No">
            <input
              className={inputCls}
              value={form.purchaseNo ?? ""}
              onChange={(e) => setForm({ ...form, purchaseNo: e.target.value })}
            />
          </Field>
          <Field label="Item">
            <input
              className={inputCls}
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <input
              className={inputCls}
              value={form.category ?? ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Purity">
            <input
              className={inputCls}
              value={form.purity ?? ""}
              onChange={(e) => setForm({ ...form, purity: e.target.value })}
            />
          </Field>
          <Field label="Quantity">
            <input
              className={inputCls}
              {...numInputProps}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: num(e.target.value) })}
            />
          </Field>
          <Field label="Gross Wt">
            <input
              className={inputCls}
              {...numInputProps}
              value={form.grossWt}
              onChange={(e) => setForm({ ...form, grossWt: num(e.target.value) })}
            />
          </Field>
          <Field label="Net Wt">
            <input
              className={inputCls}
              {...numInputProps}
              value={form.netWt}
              onChange={(e) => setForm({ ...form, netWt: num(e.target.value) })}
            />
          </Field>
          <Field label="Rate">
            <input
              className={inputCls}
              {...numInputProps}
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: num(e.target.value) })}
            />
          </Field>
          <Field label="Amount" hint="Blank = net wt x rate">
            <input
              className={inputCls}
              {...numInputProps}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: num(e.target.value) })}
            />
          </Field>
          <Field label="Payment Mode">
            <input
              className={inputCls}
              placeholder="Cash / UPI"
              value={form.paymentMode ?? ""}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
            />
          </Field>
          <Field label="Remarks" className="md:col-span-4">
            <input
              className={inputCls}
              value={form.remarks ?? ""}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2 md:col-span-4">
            <button type="button" onClick={save} disabled={busy} className={btnPrimaryCls}>
              {busy ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setForm(null)} className={btnGhostCls}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card-lux mt-4 overflow-x-auto rounded-sm">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className={thCls}>No</th>
              <th className={thCls}>Date</th>
              <th className={thCls}>Supplier</th>
              <th className={thCls}>Item</th>
              <th className={thCls}>Purity</th>
              <th className={`${thCls} text-right`}>Qty</th>
              <th className={`${thCls} text-right`}>Gross Wt</th>
              <th className={`${thCls} text-right`}>Net Wt</th>
              <th className={`${thCls} text-right`}>Rate</th>
              <th className={`${thCls} text-right`}>Amount</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td className={`${tdCls} text-muted-foreground`} colSpan={11}>
                  No purchase entries yet.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className={`${tdCls} font-medium text-primary`}>{p.purchaseNo || p.id}</td>
                  <td className={tdCls}>{shortDate(p.purchaseDate)}</td>
                  <td className={tdCls}>
                    {p.supplierName}
                    {p.supplierPhone ? (
                      <span className="ml-2 text-xs text-muted-foreground">{p.supplierPhone}</span>
                    ) : null}
                  </td>
                  <td className={tdCls}>{p.itemName}</td>
                  <td className={tdCls}>{p.purity ?? "-"}</td>
                  <td className={`${tdCls} text-right`}>{p.quantity}</td>
                  <td className={`${tdCls} text-right`}>{inr(p.grossWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(p.netWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(p.rate)}</td>
                  <td className={`${tdCls} text-right font-medium`}>{inr(p.amount)}</td>
                  <td className={`${tdCls} whitespace-nowrap text-right`}>
                    <button
                      type="button"
                      className="mr-3 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
                      onClick={() =>
                        setForm({
                          id: p.id,
                          purchaseNo: p.purchaseNo ?? "",
                          purchaseDate: p.purchaseDate.slice(0, 10),
                          supplierName: p.supplierName,
                          supplierPhone: p.supplierPhone ?? "",
                          itemName: p.itemName,
                          category: p.category ?? "",
                          purity: p.purity ?? "",
                          quantity: p.quantity,
                          grossWt: p.grossWt,
                          netWt: p.netWt,
                          rate: p.rate,
                          amount: p.amount,
                          paymentMode: p.paymentMode ?? "",
                          remarks: p.remarks ?? "",
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      onClick={() => remove(p)}
                    >
                      Delete
                    </button>
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
