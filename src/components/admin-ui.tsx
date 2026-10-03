// Shared styling + tiny helpers for the admin section.
// Keeps the admin pages consistent with the public site's dark-luxury tokens.

import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-sm border border-input bg-black/40 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary";

export const labelCls = "block text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground";

export const btnPrimaryCls =
  "inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhostCls =
  "inline-flex items-center justify-center rounded-sm border border-border px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50";

export const btnDangerCls =
  "inline-flex items-center justify-center rounded-sm border border-destructive/50 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50";

export const thCls =
  "border-b border-border/60 px-3 py-2 text-left text-[0.62rem] font-medium uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap";

export const tdCls = "border-b border-border/30 px-3 py-2 text-sm text-foreground/90";

export const numInputProps = {
  type: "number",
  inputMode: "decimal",
  step: "any",
} as const;

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? (
        <span className="mt-1 block text-[0.65rem] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

/** Parse an input value to a finite number (0 when invalid). */
export function num(v: string | number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Indian grouping format with 2 decimals. */
export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Short date display (YYYY-MM-DD -> DD MMM YYYY). */
export function shortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="rounded-sm border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
      {message}
    </div>
  );
}
