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
            <input
              className={inputCls}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <button type="submit" disabled={busy} className={`${btnPrimaryCls} w-full`}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
