import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { checkSessionFn, logoutFn } from "@/fns/auth.server";
import { btnGhostCls } from "@/components/admin-ui";

const NAV = [
  ["/admin", "Dashboard"],
  ["/admin/billing", "Billing"],
  ["/admin/stock", "Stock"],
  ["/admin/purchase", "Purchase"],
  ["/admin/promotion", "Promotion"],
] as const;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin - Khan Jewellers" }],
  }),
  beforeLoad: async ({ location }) => {
    // The login screen must render without a session, otherwise the redirect
    // would loop. Everything under /admin/* except login requires a session.
    if (location.pathname === "/admin/login") return { authed: false };
    const session = await checkSessionFn();
    if (!session.authed) throw redirect({ to: "/admin/login" });
    return { authed: true };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/admin/login") return <Outlet />;

  async function logout() {
    await logoutFn();
    await router.invalidate();
    router.navigate({ to: "/admin/login" });
  }

  return (
    <div className="mx-auto min-h-[70vh] max-w-6xl px-6 py-10 print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-primary">Control Panel</p>
          <h1 className="mt-1 font-display text-4xl">Khan Jewellers Admin</h1>
        </div>
        <button type="button" onClick={logout} className={btnGhostCls}>
          Log out
        </button>
      </div>

      <nav className="mt-5 flex flex-wrap gap-1">
        {NAV.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="rounded-sm px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
            activeOptions={{ exact: to === "/admin" }}
            activeProps={{
              className:
                "rounded-sm bg-secondary px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-primary",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
