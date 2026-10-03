import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { deleteStockFn, listStockFn, saveStockFn, type StockInput } from "@/fns/stock.server";
import {
  ErrorBanner,
  Field,
  btnGhostCls,
  btnPrimaryCls,
  inr,
  inputCls,
  num,
  numInputProps,
  tdCls,
  thCls,
} from "@/components/admin-ui";
import type { StockItem, StockTotals } from "@/lib/types";

export const Route = createFileRoute("/admin/stock")({
  component: StockPage,
});

const BLANK: StockInput = {
  tagNo: "",
  itemName: "",
  category: "",
  purity: "",
  quantity: 1,
  grossWt: 0,
  netWt: 0,
  rate: 0,
  status: "in_stock",
};

function StockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [totals, setTotals] = useState<StockTotals | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [form, setForm] = useState<StockInput | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (term: string) => {
    const res = await listStockFn({ data: term });
    if (res.ok) {
      setItems(res.data.items);
      setTotals(res.data.totals);
      setBanner("");
    } else {
      setItems([]);
      setTotals(null);
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    load("").catch(() => setError("Failed to load stock."));
  }, [load]);

  function onSearch(value: string) {
    setSearch(value);
    load(value).catch(() => setError("Search failed."));
  }

  async function save() {
    if (!form) return;
    setBusy(true);
    setError("");
    const res = await saveStockFn({ data: form });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setForm(null);
    load(search).catch(() => undefined);
  }

  async function remove(item: StockItem) {
    if (!confirm(`Delete tag ${item.tagNo} (${item.itemName})?`)) return;
    const res = await deleteStockFn({ data: item.id });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    load(search).catch(() => undefined);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Stock</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tag-wise inventory register.</p>
        </div>
        <button type="button" className={btnPrimaryCls} onClick={() => setForm({ ...BLANK })}>
          + Add Item
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <input
          className={`${inputCls} max-w-xs`}
          placeholder="Search tag, item or category..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {totals && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {totals.count} items &middot; qty {inr(totals.quantity)} &middot; gross{" "}
            {inr(totals.grossWt)} g &middot; net {inr(totals.netWt)} g
          </p>
        )}
      </div>

      <div className="mt-4">
        <ErrorBanner message={error || banner} />
      </div>

      {form && (
        <div className="card-lux mt-4 grid gap-4 rounded-sm p-6 md:grid-cols-4">
          <h3 className="font-display text-2xl text-primary md:col-span-4">
            {form.id ? "Edit Item" : "Add Item"}
          </h3>
          <Field label="Tag No">
            <input
              className={inputCls}
              value={form.tagNo}
              onChange={(e) => setForm({ ...form, tagNo: e.target.value })}
            />
          </Field>
          <Field label="Item Name">
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
              placeholder="22K / 18K"
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
              value={form.rate ?? 0}
              onChange={(e) => setForm({ ...form, rate: num(e.target.value) })}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={form.status ?? "in_stock"}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
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
        <table className="w-full min-w-[860px]">
          <thead>
            <tr>
              <th className={thCls}>Tag</th>
              <th className={thCls}>Item</th>
              <th className={thCls}>Category</th>
              <th className={thCls}>Purity</th>
              <th className={`${thCls} text-right`}>Qty</th>
              <th className={`${thCls} text-right`}>Gross Wt</th>
              <th className={`${thCls} text-right`}>Net Wt</th>
              <th className={`${thCls} text-right`}>Rate</th>
              <th className={thCls}>Status</th>
              <th className={thCls}></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className={`${tdCls} text-muted-foreground`} colSpan={10}>
                  {search ? "No matches." : "No stock items yet."}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className={`${tdCls} font-medium text-primary`}>{item.tagNo}</td>
                  <td className={tdCls}>{item.itemName}</td>
                  <td className={tdCls}>{item.category ?? "-"}</td>
                  <td className={tdCls}>{item.purity ?? "-"}</td>
                  <td className={`${tdCls} text-right`}>{item.quantity}</td>
                  <td className={`${tdCls} text-right`}>{inr(item.grossWt)}</td>
                  <td className={`${tdCls} text-right`}>{inr(item.netWt)}</td>
                  <td className={`${tdCls} text-right`}>
                    {item.rate != null ? inr(item.rate) : "-"}
                  </td>
                  <td className={tdCls}>
                    <span className="rounded-sm border border-primary/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-primary">
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`${tdCls} whitespace-nowrap text-right`}>
                    <button
                      type="button"
                      className="mr-3 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
                      onClick={() =>
                        setForm({
                          id: item.id,
                          tagNo: item.tagNo,
                          itemName: item.itemName,
                          category: item.category ?? "",
                          purity: item.purity ?? "",
                          quantity: item.quantity,
                          grossWt: item.grossWt,
                          netWt: item.netWt,
                          rate: item.rate ?? 0,
                          status: item.status,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      onClick={() => remove(item)}
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
