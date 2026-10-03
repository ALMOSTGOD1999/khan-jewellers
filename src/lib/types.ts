// Client-safe shared types for the admin backend.

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type SessionState = { authed: boolean };

export type InvoiceItemInput = {
  itemName: string;
  itemCode?: string;
  hsn?: string;
  huid?: string;
  purity?: string;
  unit?: string;
  qty: number;
  grossWt: number;
  netWt: number;
  rate: number;
  valueAddition: number;
};

export type OldOrnamentInput = {
  itemName: string;
  netWt: number;
  amount: number;
};

export type InvoiceInput = {
  billNo: string;
  orderNo?: string;
  billDate: string; // YYYY-MM-DD
  billTime?: string; // HH:MM (24h)
  orderDate?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerAadhar?: string;
  customerPan?: string;
  rateGold22?: number;
  rateGold18?: number;
  rateSilver?: number;
  items: InvoiceItemInput[];
  oldOrnaments: OldOrnamentInput[];
  hallmarkQty: number;
  hallmarkChargeEach: number;
  // GST rates (percent). Defaults match the reference bill:
  // 3% on item totals (1.5 + 1.5) and 18% on hallmark charges (9 + 9).
  metalGstPct?: number;
  hallmarkGstPct?: number;
  oldOrnamentDeduction?: number;
  discount?: number;
  /** Manual override of the payable amount (auto-computed when omitted). */
  payableAmount?: number;
  paymentReceived?: number;
  paymentMode?: string;
  remarks?: string;
};

export type InvoiceLine = {
  sl: number;
  itemName: string;
  itemCode?: string;
  hsn?: string;
  huid?: string;
  purity?: string;
  unit?: string;
  qty: number;
  grossWt: number;
  netWt: number;
  rate: number;
  valueAddition: number;
  totalAmount: number;
};

export type OldOrnamentLine = {
  itemName: string;
  netWt: number;
  amount: number;
};

export type InvoiceTotals = {
  itemsTotal: number;
  totalGrossWt: number;
  totalNetWt: number;
  totalLabour: number;
  hallmarkCharges: number;
  cgst: number;
  sgst: number;
  gstTotal: number;
  grossAmount: number;
  oldOrnamentDeduction: number;
  discount: number;
  roundOff: number;
  payableAmount: number;
  paymentReceived: number;
  balance: number;
};

export type InvoiceSummary = {
  id: number;
  billNo: string;
  billDate: string;
  customerName: string;
  customerPhone?: string;
  payableAmount: number;
  paymentReceived: number;
  totalNetWt: number;
};

export type InvoiceDetail = InvoiceSummary & {
  orderNo?: string;
  billTime?: string;
  orderDate?: string;
  customerAddress?: string;
  customerGstin?: string;
  customerAadhar?: string;
  customerPan?: string;
  rateGold22?: number;
  rateGold18?: number;
  rateSilver?: number;
  items: InvoiceLine[];
  oldOrnaments: OldOrnamentLine[];
  hallmarkQty: number;
  hallmarkChargeEach: number;
  metalGstPct: number;
  hallmarkGstPct: number;
  totals: InvoiceTotals;
  paymentMode?: string;
  remarks?: string;
  createdAt: string;
};

export type StockItem = {
  id: number;
  tagNo: string;
  itemName: string;
  category?: string;
  purity?: string;
  quantity: number;
  grossWt: number;
  netWt: number;
  rate?: number;
  status: string;
  createdAt: string;
};

export type StockTotals = { count: number; quantity: number; grossWt: number; netWt: number };

export type PurchaseEntry = {
  id: number;
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
  createdAt: string;
};

export type PromotionCampaign = {
  id: number;
  subject: string;
  recipients: string[];
  sentCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
};
