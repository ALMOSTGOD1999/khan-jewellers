// Shared invoice math — used by both the billing form (live preview) and the
// server (authoritative totals on save). Pure functions, client-safe.

import type {
  InvoiceItemInput,
  InvoiceLine,
  InvoiceTotals,
  OldOrnamentInput,
  OldOrnamentLine,
} from "./types";

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export type TotalsInput = {
  items: InvoiceItemInput[];
  oldOrnaments: OldOrnamentInput[];
  hallmarkQty: number;
  hallmarkChargeEach: number;
  metalGstPct: number;
  hallmarkGstPct: number;
  oldOrnamentDeduction: number;
  discount: number;
  /** Optional manual override (the printed "PAYABLE AMT." on the reference bill). */
  payableOverride?: number;
  paymentReceived: number;
};

export type TotalsResult = {
  lines: InvoiceLine[];
  oldLines: OldOrnamentLine[];
  totals: InvoiceTotals;
};

export function computeTotals(input: TotalsInput): TotalsResult {
  const lines: InvoiceLine[] = input.items.map((item, index) => {
    const totalAmount = round2(item.netWt * item.rate + item.valueAddition);
    return {
      sl: index + 1,
      itemName: item.itemName,
      ...(item.itemCode !== undefined && { itemCode: item.itemCode }),
      ...(item.hsn !== undefined && { hsn: item.hsn }),
      ...(item.huid !== undefined && { huid: item.huid }),
      ...(item.purity !== undefined && { purity: item.purity }),
      unit: item.unit || "PCS",
      qty: item.qty,
      grossWt: item.grossWt,
      netWt: item.netWt,
      rate: item.rate,
      valueAddition: item.valueAddition,
      totalAmount,
    };
  });

  const oldLines: OldOrnamentLine[] = input.oldOrnaments.map((o) => ({
    itemName: o.itemName,
    netWt: o.netWt,
    amount: o.amount,
  }));

  const itemsTotal = round2(lines.reduce((sum, l) => sum + l.totalAmount, 0));
  const totalGrossWt = round2(lines.reduce((sum, l) => sum + l.grossWt, 0));
  const totalNetWt = round2(lines.reduce((sum, l) => sum + l.netWt, 0));
  const totalLabour = round2(lines.reduce((sum, l) => sum + l.valueAddition, 0));
  const hallmarkCharges = round2(input.hallmarkQty * input.hallmarkChargeEach);

  // Reference-bill GST split: e.g. 3% metal GST (1.5 + 1.5) on item totals and
  // 18% (9 + 9) on hallmark charges.
  const cgst = round2(
    (itemsTotal * input.metalGstPct) / 200 + (hallmarkCharges * input.hallmarkGstPct) / 200,
  );
  const sgst = cgst;
  const gstTotal = round2(cgst + sgst);

  const grossAmount = round2(itemsTotal + hallmarkCharges + cgst + sgst);
  const beforeRound = round2(grossAmount - input.oldOrnamentDeduction - input.discount);
  const payableAmount = round2(input.payableOverride ?? beforeRound);
  const roundOff = round2(payableAmount - beforeRound);
  const paymentReceived = round2(input.paymentReceived);
  const balance = round2(payableAmount - paymentReceived);

  return {
    lines,
    oldLines,
    totals: {
      itemsTotal,
      totalGrossWt,
      totalNetWt,
      totalLabour,
      hallmarkCharges,
      cgst,
      sgst,
      gstTotal,
      grossAmount,
      oldOrnamentDeduction: round2(input.oldOrnamentDeduction),
      discount: round2(input.discount),
      roundOff,
      payableAmount,
      paymentReceived,
      balance,
    },
  };
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n] ?? "";
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t] ?? ""}${o ? ` ${ONES[o] ?? ""}` : ""}`;
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h) parts.push(`${ONES[h] ?? ""} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/** Indian numbering: crore / lakh / thousand / hundred. */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return "INR Zero";

  const parts: string[] = [];
  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = Math.floor((rupees % 1000) / 100);
  const rest = rupees % 100;

  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred] ?? ""} Hundred`);
  if (rest) parts.push(twoDigits(rest));

  let words = `INR ${parts.join(" ")}`;
  if (paise) words += ` and ${twoDigits(paise)} Paise`;
  return words;
}
