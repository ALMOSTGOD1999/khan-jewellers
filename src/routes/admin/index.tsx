import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const SECTIONS = [
  {
    to: "/admin/billing",
    title: "Billing",
    desc: "Create GST tax invoices, print bills, track payments.",
  },
  {
    to: "/admin/stock",
    title: "Stock",
    desc: "Tag-wise inventory: weights, rates and status.",
  },
  {
    to: "/admin/purchase",
    title: "Purchase",
    desc: "Supplier purchase entries with weight and amount.",
  },
  {
    to: "/admin/promotion",
    title: "Promotion",
    desc: "Send promotional emails to customers via Resend.",
  },
] as const;

function AdminDashboard() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">Manage billing, inventory and promotions.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="card-lux group rounded-sm p-6 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="font-display text-3xl text-primary">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            <span className="mt-4 inline-block text-[0.65rem] uppercase tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Open &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
