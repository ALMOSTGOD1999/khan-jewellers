import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { loginFn } from "@/fns/auth.server";
import { ErrorBanner, Field, btnPrimaryCls, inputCls } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Login - Khan Jewellers Admin" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await loginFn({ data: { id, password } });
      if (!res.ok) {
        setError(res.error ?? "Login failed.");
        return;
      }
      await router.invalidate();
      router.navigate({ to: "/admin" });
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="card-lux w-full max-w-sm rounded-sm p-8">
        <p className="text-center text-[0.65rem] uppercase tracking-[0.4em] text-primary">
          Khan Jewellers
        </p>
        <h1 className="mt-2 text-center font-display text-3xl">Admin Login</h1>
        <div className="gold-rule mx-auto mt-4 w-16" />

        <form onSubmit={submit} className="mt-8 space-y-4">
          <ErrorBanner message={error} />
          <Field label="ID">
            <input
              className={inputCls}
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                className={`${inputCls} pr-10`}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.4 4.3" />
                    <path d="M6.6 6.6A17.7 17.7 0 0 0 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.3-.9" />
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimaryCls} w-full`}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
