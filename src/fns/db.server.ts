import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";
import { loadLocalEnv } from "@/lib/local-env";

loadLocalEnv();

type AnySql = NeonQueryFunction<false, false>;

let cached: AnySql | null = null;
let schemaReady = false;

export function dbConfigured(): boolean {
  return Boolean(process.env["DATABASE_URL"]);
}

export function getSql(): AnySql {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!cached) cached = neon(url);
  return cached;
}

// Idempotent DDL — runs once per process on first DB access so the app works
// with a freshly-provisioned Neon database without a separate migration step.
const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS invoices (
    id serial PRIMARY KEY,
    bill_no text UNIQUE NOT NULL,
    order_no text,
    bill_date date NOT NULL,
    bill_time text,
    order_date date,
    customer_name text NOT NULL,
    customer_phone text,
    customer_address text,
    customer_gstin text,
    customer_aadhar text,
    customer_pan text,
    rate_gold22 double precision,
    rate_gold18 double precision,
    rate_silver double precision,
    items_total double precision NOT NULL DEFAULT 0,
    total_gross_wt double precision NOT NULL DEFAULT 0,
    total_net_wt double precision NOT NULL DEFAULT 0,
    total_labour double precision NOT NULL DEFAULT 0,
    hallmark_qty double precision NOT NULL DEFAULT 0,
    hallmark_charge_each double precision NOT NULL DEFAULT 0,
    hallmark_charges double precision NOT NULL DEFAULT 0,
    metal_gst_pct double precision NOT NULL DEFAULT 3,
    hallmark_gst_pct double precision NOT NULL DEFAULT 18,
    cgst double precision NOT NULL DEFAULT 0,
    sgst double precision NOT NULL DEFAULT 0,
    gst_total double precision NOT NULL DEFAULT 0,
    gross_amount double precision NOT NULL DEFAULT 0,
    old_ornament_deduction double precision NOT NULL DEFAULT 0,
    discount double precision NOT NULL DEFAULT 0,
    round_off double precision NOT NULL DEFAULT 0,
    payable_amount double precision NOT NULL DEFAULT 0,
    payment_received double precision NOT NULL DEFAULT 0,
    balance double precision NOT NULL DEFAULT 0,
    payment_mode text,
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices (created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS invoice_items (
    id serial PRIMARY KEY,
    invoice_id integer NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    sl integer NOT NULL DEFAULT 1,
    item_name text NOT NULL,
    item_code text,
    hsn text,
    huid text,
    purity text,
    unit text DEFAULT 'PCS',
    qty double precision NOT NULL DEFAULT 1,
    gross_wt double precision NOT NULL DEFAULT 0,
    net_wt double precision NOT NULL DEFAULT 0,
    rate double precision NOT NULL DEFAULT 0,
    value_addition double precision NOT NULL DEFAULT 0,
    total_amount double precision NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id)`,
  `CREATE TABLE IF NOT EXISTS old_ornaments (
    id serial PRIMARY KEY,
    invoice_id integer NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_name text NOT NULL,
    net_wt double precision NOT NULL DEFAULT 0,
    amount double precision NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_old_ornaments_invoice ON old_ornaments (invoice_id)`,
  `CREATE TABLE IF NOT EXISTS stock_items (
    id serial PRIMARY KEY,
    tag_no text UNIQUE NOT NULL,
    item_name text NOT NULL,
    category text,
    purity text,
    quantity double precision NOT NULL DEFAULT 0,
    gross_wt double precision NOT NULL DEFAULT 0,
    net_wt double precision NOT NULL DEFAULT 0,
    rate double precision,
    status text NOT NULL DEFAULT 'in_stock',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS purchases (
    id serial PRIMARY KEY,
    purchase_no text,
    purchase_date date NOT NULL DEFAULT current_date,
    supplier_name text NOT NULL,
    supplier_phone text,
    item_name text NOT NULL,
    category text,
    purity text,
    quantity double precision NOT NULL DEFAULT 1,
    gross_wt double precision NOT NULL DEFAULT 0,
    net_wt double precision NOT NULL DEFAULT 0,
    rate double precision NOT NULL DEFAULT 0,
    amount double precision NOT NULL DEFAULT 0,
    payment_mode text,
    remarks text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS promotion_campaigns (
    id serial PRIMARY KEY,
    subject text NOT NULL,
    body_html text NOT NULL,
    recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
    sent_count integer NOT NULL DEFAULT 0,
    failed_count integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'sent',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = getSql();
  for (const stmt of DDL) {
    await sql.query(stmt);
  }
  schemaReady = true;
}

export type { AnySql };
