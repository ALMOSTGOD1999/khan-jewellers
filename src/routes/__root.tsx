import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";

import appCss from "../styles.css?url";
import logoImg from "@/assets/logo.png";

const CREDIT_TEXT = "crafted by Incodent";

/**
 * Footer credit with a typewriter reveal: characters appear one by one when
 * the credit scrolls into view. SSR renders the full text (hydration-safe);
 * motion-allowed clients hide it and type it once, at ~65ms/char. Respects
 * prefers-reduced-motion (text shown immediately, no animation).
 */
function CraftedByCredit() {
  const ref = useRef<HTMLSpanElement>(null);
  // null = show full text (server render + reduced motion); number = chars shown.
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        let i = 0;
        timer = setInterval(() => {
          i += 1;
          setShown(i);
          if (i >= CREDIT_TEXT.length && timer) clearInterval(timer);
        }, 65);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  const visible = shown ?? CREDIT_TEXT.length;
  const typing = visible < CREDIT_TEXT.length;

  return (
    <a
      href="https://www.incodent.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-5 inline-block text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary"
    >
      <span ref={ref} className="inline-block">
        {CREDIT_TEXT.slice(0, visible)}
        {typing ? (
          <span aria-hidden="true" className="ml-0.5 animate-pulse text-primary/70">
            ▌
          </span>
        ) : null}
      </span>
      <span className="sr-only">crafted by Incodent</span>
    </a>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Khan Jewellers — Rajarhat, Kolkata" },
      {
        name: "description",
        content:
          "Handcrafted gold, silver and pearl jewellery from Khan Jewellers, Rajarhat, Kolkata.",
      },
      { name: "author", content: "Khan Jewellers" },
      { property: "og:title", content: "Khan Jewellers — Rajarhat, Kolkata" },
      {
        property: "og:description",
        content:
          "Handcrafted gold, silver and pearl jewellery from Khan Jewellers, Rajarhat, Kolkata.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Jost:wght@300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur print:hidden">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="flex items-center gap-3 font-display text-xl tracking-wide">
            <img
              src={logoImg}
              alt="Khan Jewellers logo"
              className="h-10 w-10 rounded-full ring-1 ring-primary/40"
            />
            <span className="text-gold-gradient">Khan Jewellers</span>
          </Link>
          <div className="flex flex-wrap items-center gap-5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {(
              [
                ["/gold", "Gold"],
                ["/silver", "Silver"],
                ["/pearl", "Pearl"],
                ["/about", "About"],
                ["/contact", "Contact"],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/admin/login"
              className="rounded-sm border border-primary/50 px-3 py-1.5 text-[0.65rem] tracking-[0.25em] text-primary transition-colors hover:bg-primary/10"
              activeProps={{ className: "bg-primary/10" }}
            >
              Login
            </Link>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-10 text-center print:hidden">
        <img
          src={logoImg}
          alt="Khan Jewellers logo"
          className="mx-auto mb-3 h-16 w-16 rounded-full ring-1 ring-primary/40"
        />
        <p className="font-display text-2xl text-gold-gradient">Khan Jewellers</p>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Noipukur, Rajarhat &middot; +91 8240570878 &middot; +91 7439491412
        </p>
        <CraftedByCredit />
      </footer>
    </QueryClientProvider>
  );
}
