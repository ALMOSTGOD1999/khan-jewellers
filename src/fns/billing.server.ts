import { createServerFn } from "@tanstack/react-start";
import { isAuthenticated } from "./auth.server";
import { ensureSchema, getSql } from "./db.server";
import { computeTotals } from "@/lib/invoice-math";
import type {
  InvoiceDetail,
  InvoiceInput,
  InvoiceLine,
  InvoiceSummary,
  OldOrnamentLine,
  Result,
} from "@/lib/types";

const AUTH_ERROR = "Session expired. Please log in again.";

function n(v: number | undefined | null): number | null {
  return v ?? null;
}

function s(v: string | undefined | null): string | null {
  return v ?? null;
}

function authError(): { ok: false; error: string } | null {
  if (!isAuthenticated()) return { ok: false, error: AUTH_ERROR };
  return null;
}

export function dbErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.includes("DATABASE_URL is not configured")) {
    return "Database not configured. Set DATABASE_URL (Neon) and restart to enable storage.";
  }
  console.error(error);
  return error instanceof Error ? error.message : "Unexpected database error.";
}

export const getNextBillNoFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Result<{ billNo: string }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`SELECT COALESCE(MAX(id), 0) + 1 AS n FROM invoices`;
      const next = Number(rows[0]?.["n"] ?? 1);
      const year = new Date().getFullYear();
      return { ok: true, data: { billNo: `KJ/${year}/${String(next).padStart(4, "0")}` } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  },
);

export const listInvoicesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Result<{ invoices: InvoiceSummary[] }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`
        SELECT
          i.id,
          i.bill_no AS "billNo",
          i.bill_date::text AS "billDate",
          i.customer_name AS "customerName",
          i.customer_phone AS "customerPhone",
          i.payable_amount AS "payableAmount",
          i.payment_received AS "paymentReceived",
          COALESCE((SELECT SUM(net_wt) FROM invoice_items WHERE invoice_id = i.id), 0) AS "totalNetWt"
        FROM invoices i
        ORDER BY i.created_at DESC, i.id DESC
        LIMIT 100`;
      return { ok: true, data: { invoices: rows as unknown as InvoiceSummary[] } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  },
);

export const getInvoiceFn = createServerFn({ method: "GET" })
  .validator((id: number): number => id)
  .handler(async ({ data }): Promise<Result<{ invoice: InvoiceDetail }>> => {
    const denied = authError();
    if (denied) return denied;
    try {
      await ensureSchema();
      const sql = getSql();
      const invRows = await sql`
        SELECT
          id,
          bill_no AS "billNo",
          bill_date::text AS "billDate",
          bill_time AS "billTime",
          order_no AS "orderNo",
          order_date::text AS "orderDate",
          customer_name AS "customerName",
          customer_phone AS "customerPhone",
          customer_address AS "customerAddress",
          customer_gstin AS "customerGstin",
          customer_aadhar AS "customerAadhar",
          customer_pan AS "customerPan",
          rate_gold22 AS "rateGold22",
          rate_gold18 AS "rateGold18",
          rate_silver AS "rateSilver",
          total_net_wt AS "totalNetWt",
          hallmark_qty AS "hallmarkQty",
          hallmark_charge_each AS "hallmarkChargeEach",
          metal_gst_pct AS "metalGstPct",
          hallmark_gst_pct AS "hallmarkGstPct",
          items_total AS "itemsTotal",
          total_gross_wt AS "totalGrossWt",
          total_labour AS "totalLabour",
          hallmark_charges AS "hallmarkCharges",
          cgst,
          sgst,
          gst_total AS "gstTotal",
          gross_amount AS "grossAmount",
          old_ornament_deduction AS "oldOrnamentDeduction",
          discount,
          round_off AS "roundOff",
          payable_amount AS "payableAmount",
          payment_received AS "paymentReceived",
          balance,
          payment_mode AS "paymentMode",
          remarks,
          created_at::text AS "createdAt"
        FROM invoices
        WHERE id = ${data}`;
      const inv = invRows[0] as Record<string, unknown> | undefined;
      if (!inv) return { ok: false, error: "Invoice not found." };

      const itemRows = await sql`
        SELECT
          sl,
          item_name AS "itemName",
          item_code AS "itemCode",
          hsn,
          huid,
          purity,
          unit,
          qty,
          gross_wt AS "grossWt",
          net_wt AS "netWt",
          rate,
          value_addition AS "valueAddition",
          total_amount AS "totalAmount"
        FROM invoice_items
        WHERE invoice_id = ${data}
        ORDER BY sl`;

      const ornRows = await sql`
        SELECT
          item_name AS "itemName",
          net_wt AS "netWt",
          amount
        FROM old_ornaments
        WHERE invoice_id = ${data}
        ORDER BY id`;

      const opt = (key: string): Record<string, string> => {
        const v = inv[key];
        return v === null || v === undefined ? {} : { [key]: String(v) };
      };
      const numOpt = (key: string): Record<string, number> => {
        const v = inv[key];
        return v === null || v === undefined ? {} : { [key]: Number(v) };
      };

      const invoice: InvoiceDetail = {
        id: Number(inv["id"]),
        billNo: String(inv["billNo"]),
        billDate: String(inv["billDate"]),
        customerName: String(inv["customerName"]),
        totalNetWt: Number(inv["totalNetWt"] ?? 0),
        payableAmount: Number(inv["payableAmount"] ?? 0),
        paymentReceived: Number(inv["paymentReceived"] ?? 0),
        ...opt("billTime"),
        ...opt("orderNo"),
        ...opt("orderDate"),
        ...opt("customerPhone"),
        ...opt("customerAddress"),
        ...opt("customerGstin"),
        ...opt("customerAadhar"),
        ...opt("customerPan"),
        ...numOpt("rateGold22"),
        ...numOpt("rateGold18"),
        ...numOpt("rateSilver"),
        ...opt("paymentMode"),
        ...opt("remarks"),
        items: itemRows as unknown as InvoiceLine[],
        oldOrnaments: ornRows as unknown as OldOrnamentLine[],
        hallmarkQty: Number(inv["hallmarkQty"] ?? 0),
        hallmarkChargeEach: Number(inv["hallmarkChargeEach"] ?? 0),
        metalGstPct: Number(inv["metalGstPct"] ?? 3),
        hallmarkGstPct: Number(inv["hallmarkGstPct"] ?? 18),
        totals: {
          itemsTotal: Number(inv["itemsTotal"] ?? 0),
          totalGrossWt: Number(inv["totalGrossWt"] ?? 0),
          totalNetWt: Number(inv["totalNetWt"] ?? 0),
          totalLabour: Number(inv["totalLabour"] ?? 0),
          hallmarkCharges: Number(inv["hallmarkCharges"] ?? 0),
          cgst: Number(inv["cgst"] ?? 0),
          sgst: Number(inv["sgst"] ?? 0),
          gstTotal: Number(inv["gstTotal"] ?? 0),
          grossAmount: Number(inv["grossAmount"] ?? 0),
          oldOrnamentDeduction: Number(inv["oldOrnamentDeduction"] ?? 0),
          discount: Number(inv["discount"] ?? 0),
          roundOff: Number(inv["roundOff"] ?? 0),
          payableAmount: Number(inv["payableAmount"] ?? 0),
          paymentReceived: Number(inv["paymentReceived"] ?? 0),
          balance: Number(inv["balance"] ?? 0),
        },
        createdAt: String(inv["createdAt"]),
      };
      return { ok: true, data: { invoice } };
    } catch (error) {
      return { ok: false, error: dbErrorMessage(error) };
    }
  });

const SAVE_SQL = `
  WITH inv AS (
    INSERT INTO invoices (
      bill_no, order_no, bill_date, bill_time, order_date,
      customer_name, customer_phone, customer_address, customer_gstin,
      customer_aadhar, customer_pan,
      rate_gold22, rate_gold18, rate_silver,
      items_total, total_gross_wt, total_net_wt, total_labour,
      hallmark_qty, hallmark_charge_each, hallmark_charges,
      metal_gst_pct, hallmark_gst_pct, cgst, sgst, gst_total,
      gross_amount, old_ornament_deduction, discount, round_off,
      payable_amount, payment_received, balance, payment_mode, remarks
    ) VALUES (
      $1, $2, $3::date, $4, $5::date,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14,
      $15, $16, $17, $18,
      $19, $20, $21,
      $22, $23, $24, $25, $26,
      $27, $28, $29, $30,
      $31, $32, $33, $34, $35
    )
    RETURNING id, bill_no
  ), items AS (
    INSERT INTO invoice_items (
      invoice_id, sl, item_name, item_code, hsn, huid, purity, unit,
      qty, gross_wt, net_wt, rate, value_addition, total_amount
    )
    SELECT
      inv.id,
      (x->>'sl')::int,
      x->>'itemName',
      x->>'itemCode',
      x->>'hsn',
      x->>'huid',
      x->>'purity',
      x->>'unit',
      (x->>'qty')::float8,
      (x->>'grossWt')::float8,
      (x->>'netWt')::float8,
      (x->>'rate')::float8,
      (x->>'valueAddition')::float8,
      (x->>'totalAmount')::float8
    FROM inv, jsonb_array_elements($36::jsonb) x
  ), orns AS (
    INSERT INTO old_ornaments (invoice_id, item_name, net_wt, amount)
    SELECT
      inv.id,
      x->>'itemName',
      (x->>'netWt')::float8,
      (x->>'amount')::float8
    FROM inv, jsonb_array_elements($37::jsonb) x
  )
  SELECT id, bill_no AS "billNo" FROM inv`;

export const saveInvoiceFn = createServerFn({ method: "POST" })
  .validator((input: InvoiceInput): InvoiceInput => input)
  .handler(async ({ data }): Promise<Result<{ id: number; billNo: string }>> => {
    const denied = authError();
    if (denied) return denied;
    const input = data;
    if (!input.customerName?.trim()) return { ok: false, error: "Customer name is required." };
    if (!input.billNo?.trim()) return { ok: false, error: "Bill number is required." };
    if (!input.billDate) return { ok: false, error: "Bill date is required." };
    if (!input.items?.length) return { ok: false, error: "Add at least one item." };

    try {
      await ensureSchema();
      const sql = getSql();

      // Server-side recalculation is authoritative — client totals are ignored.
      const { lines, oldLines, totals } = computeTotals({
        items: input.items,
        oldOrnaments: input.oldOrnaments ?? [],
        hallmarkQty: input.hallmarkQty ?? 0,
        hallmarkChargeEach: input.hallmarkChargeEach ?? 0,
        metalGstPct: input.metalGstPct ?? 3,
        hallmarkGstPct: input.hallmarkGstPct ?? 18,
        oldOrnamentDeduction: input.oldOrnamentDeduction ?? 0,
        discount: input.discount ?? 0,
        ...(input.payableAmount !== undefined && { payableOverride: input.payableAmount }),
        paymentReceived: input.paymentReceived ?? 0,
      });

      const params = [
        input.billNo.trim(),
        s(input.orderNo),
        input.billDate,
        s(input.billTime),
        s(input.orderDate),
        input.customerName.trim(),
        s(input.customerPhone),
        s(input.customerAddress),
        s(input.customerGstin),
        s(input.customerAadhar),
        s(input.customerPan),
        n(input.rateGold22),
        n(input.rateGold18),
        n(input.rateSilver),
        totals.itemsTotal,
        totals.totalGrossWt,
        totals.totalNetWt,
        totals.totalLabour,
        input.hallmarkQty ?? 0,
        input.hallmarkChargeEach ?? 0,
        totals.hallmarkCharges,
        input.metalGstPct ?? 3,
        input.hallmarkGstPct ?? 18,
        totals.cgst,
        totals.sgst,
        totals.gstTotal,
        totals.grossAmount,
        totals.oldOrnamentDeduction,
        totals.discount,
        totals.roundOff,
        totals.payableAmount,
        totals.paymentReceived,
        totals.balance,
        s(input.paymentMode),
        s(input.remarks),
        JSON.stringify(lines),
        JSON.stringify(oldLines),
      ];

      const rows = await sql.query(SAVE_SQL, params);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return { ok: false, error: "Failed to save invoice." };
      return {
        ok: true,
        data: { id: Number(row["id"]), billNo: String(row["billNo"]) },
      };
    } catch (error) {
      if (error instanceof Error && /duplicate key value/i.test(error.message)) {
        return { ok: false, error: `Bill number "${input.billNo}" already exists.` };
      }
      return { ok: false, error: dbErrorMessage(error) };
    }
  });
