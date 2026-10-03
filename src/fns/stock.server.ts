import { createServerFn } from "@tanstack/react-start";
import { isAuthenticated } from "./auth.server";
import { dbErrorMessage } from "./billing.server";
import { ensureSchema, getSql } from "./db.server";
import type { Result, StockItem, StockTotals } from "@/lib/types";

const AUTH_ERROR = "Session expired. Please log in again.";

function authError(): { ok: false; error: string } | null {
  if (!isAuthenticated()) return { ok: false, error: AUTH_ERROR };
  return null;
}

export type StockInput = {
  id?: number;
  tagNo: string;
  itemName: string;
  category?: string;
  purity?: string;
  quantity: number;
  grossWt: number;
  netWt: number;
  rate?: number;
  status?: string;
};

export const listStockFn = createServerFn({ method: "GET" })
  .validator((search: string): string => search)
  .handler(async ({ data }): Promise<Result<{ items: StockItem[]; totals: StockTotals }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const term = data.trim();
      const rows = term
        ? await sql`
            SELECT
              id, tag_no AS "tagNo", item_name AS "itemName", category, purity,
              quantity, gross_wt AS "grossWt", net_wt AS "netWt", rate, status,
              created_at::text AS "createdAt"
            FROM stock_items
            WHERE tag_no ILIKE ${`%${term}%`}
               OR item_name ILIKE ${`%${term}%`}
               OR category ILIKE ${`%${term}%`}
            ORDER BY updated_at DESC, id DESC
            LIMIT 500`
        : await sql`
            SELECT
              id, tag_no AS "tagNo", item_name AS "itemName", category, purity,
              quantity, gross_wt AS "grossWt", net_wt AS "netWt", rate, status,
              created_at::text AS "createdAt"
            FROM stock_items
            ORDER BY updated_at DESC, id DESC
            LIMIT 500`;

      const items = rows as unknown as StockItem[];
      const totals: StockTotals = {
        count: items.length,
        quantity: round(items.reduce((sum, i) => sum + Number(i.quantity), 0)),
        grossWt: round(items.reduce((sum, i) => sum + Number(i.grossWt), 0)),
        netWt: round(items.reduce((sum, i) => sum + Number(i.netWt), 0)),
      };
      return { ok: true, data: { items, totals } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  });

export const saveStockFn = createServerFn({ method: "POST" })
  .validator((input: StockInput): StockInput => input)
  .handler(async ({ data }): Promise<Result<{ id: number }>> => {
    const denied = authError();
    if (denied) return denied;
    if (!data.tagNo?.trim()) return { ok: false, error: "Tag number is required." };
    if (!data.itemName?.trim()) return { ok: false, error: "Item name is required." };

    try {
      await ensureSchema();
      const sql = getSql();
      if (data.id) {
        const rows = await sql.query(
          `UPDATE stock_items
           SET tag_no = $2, item_name = $3, category = $4, purity = $5,
               quantity = $6, gross_wt = $7, net_wt = $8, rate = $9,
               status = $10, updated_at = now()
           WHERE id = $1
           RETURNING id`,
          [
            data.id,
            data.tagNo.trim(),
            data.itemName.trim(),
            data.category ?? null,
            data.purity ?? null,
            data.quantity ?? 0,
            data.grossWt ?? 0,
            data.netWt ?? 0,
            data.rate ?? null,
            data.status || "in_stock",
          ],
        );
        if (!rows.length) return { ok: false, error: "Stock item not found." };
        return { ok: true, data: { id: data.id } };
      }

      const rows = await sql.query(
        `INSERT INTO stock_items (tag_no, item_name, category, purity, quantity, gross_wt, net_wt, rate, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          data.tagNo.trim(),
          data.itemName.trim(),
          data.category ?? null,
          data.purity ?? null,
          data.quantity ?? 0,
          data.grossWt ?? 0,
          data.netWt ?? 0,
          data.rate ?? null,
          data.status || "in_stock",
        ],
      );
      return { ok: true, data: { id: Number(rows[0]?.["id"]) } };
    } catch (error) {
      if (error instanceof Error && /duplicate key value/i.test(error.message)) {
        return { ok: false, error: `Tag number "${data.tagNo}" already exists.` };
      }
      return { ok: false, error: dbErrorMessage(error) };
    }
  });

export const deleteStockFn = createServerFn({ method: "POST" })
  .validator((id: number): number => id)
  .handler(async ({ data }): Promise<Result<{ id: number }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`DELETE FROM stock_items WHERE id = ${data} RETURNING id`;
      if (!rows.length) return { ok: false, error: "Stock item not found." };
      return { ok: true, data: { id: data } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  });

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
