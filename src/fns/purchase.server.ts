import { createServerFn } from "@tanstack/react-start";
import { isAuthenticated } from "./auth.server";
import { dbErrorMessage } from "./billing.server";
import { ensureSchema, getSql } from "./db.server";
import type { PurchaseEntry, Result } from "@/lib/types";

const AUTH_ERROR = "Session expired. Please log in again.";

function authError(): { ok: false; error: string } | null {
  if (!isAuthenticated()) return { ok: false, error: AUTH_ERROR };
  return null;
}

export type PurchaseInput = {
  id?: number;
  purchaseNo?: string;
  purchaseDate: string;
  supplierName: string;
  supplierPhone?: string;
  itemName: string;
  category?: string;
  purity?: string;
  quantity: number;
  grossWt: number;
  netWt: number;
  rate: number;
  amount: number;
  paymentMode?: string;
  remarks?: string;
};

export const listPurchasesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Result<{ purchases: PurchaseEntry[] }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`
        SELECT
          id,
          purchase_no AS "purchaseNo",
          purchase_date::text AS "purchaseDate",
          supplier_name AS "supplierName",
          supplier_phone AS "supplierPhone",
          item_name AS "itemName",
          category,
          purity,
          quantity,
          gross_wt AS "grossWt",
          net_wt AS "netWt",
          rate,
          amount,
          payment_mode AS "paymentMode",
          remarks,
          created_at::text AS "createdAt"
        FROM purchases
        ORDER BY purchase_date DESC, id DESC
        LIMIT 500`;
      return { ok: true, data: { purchases: rows as unknown as PurchaseEntry[] } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  },
);

export const savePurchaseFn = createServerFn({ method: "POST" })
  .validator((input: PurchaseInput): PurchaseInput => input)
  .handler(async ({ data }): Promise<Result<{ id: number }>> => {
    const denied = authError();
    if (denied) return denied;
    if (!data.supplierName?.trim()) return { ok: false, error: "Supplier name is required." };
    if (!data.itemName?.trim()) return { ok: false, error: "Item name is required." };
    if (!data.purchaseDate) return { ok: false, error: "Purchase date is required." };

    const amount = data.amount || Math.round((data.netWt * data.rate + Number.EPSILON) * 100) / 100;

    try {
      await ensureSchema();
      const sql = getSql();
      if (data.id) {
        const rows = await sql.query(
          `UPDATE purchases
           SET purchase_no = $2, purchase_date = $3::date, supplier_name = $4,
               supplier_phone = $5, item_name = $6, category = $7, purity = $8,
               quantity = $9, gross_wt = $10, net_wt = $11, rate = $12,
               amount = $13, payment_mode = $14, remarks = $15
           WHERE id = $1
           RETURNING id`,
          [
            data.id,
            data.purchaseNo ?? null,
            data.purchaseDate,
            data.supplierName.trim(),
            data.supplierPhone ?? null,
            data.itemName.trim(),
            data.category ?? null,
            data.purity ?? null,
            data.quantity ?? 1,
            data.grossWt ?? 0,
            data.netWt ?? 0,
            data.rate ?? 0,
            amount,
            data.paymentMode ?? null,
            data.remarks ?? null,
          ],
        );
        if (!rows.length) return { ok: false, error: "Purchase entry not found." };
        return { ok: true, data: { id: data.id } };
      }

      const rows = await sql.query(
        `INSERT INTO purchases (
           purchase_no, purchase_date, supplier_name, supplier_phone, item_name,
           category, purity, quantity, gross_wt, net_wt, rate, amount,
           payment_mode, remarks
         ) VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [
          data.purchaseNo ?? null,
          data.purchaseDate,
          data.supplierName.trim(),
          data.supplierPhone ?? null,
          data.itemName.trim(),
          data.category ?? null,
          data.purity ?? null,
          data.quantity ?? 1,
          data.grossWt ?? 0,
          data.netWt ?? 0,
          data.rate ?? 0,
          amount,
          data.paymentMode ?? null,
          data.remarks ?? null,
        ],
      );
      return { ok: true, data: { id: Number(rows[0]?.["id"]) } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  });

export const deletePurchaseFn = createServerFn({ method: "POST" })
  .validator((id: number): number => id)
  .handler(async ({ data }): Promise<Result<{ id: number }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`DELETE FROM purchases WHERE id = ${data} RETURNING id`;
      if (!rows.length) return { ok: false, error: "Purchase entry not found." };
      return { ok: true, data: { id: data } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  });
