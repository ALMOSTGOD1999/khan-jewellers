import { createServerFn } from "@tanstack/react-start";
import { loadLocalEnv } from "@/lib/local-env";

loadLocalEnv();

// NOTE: this module is reachable from client route code (server-fn stubs
// keep it alive in the browser), so it must not touch node builtins or the
// client-denied `@tanstack/react-start/server` specifier at module scope:
//   - static `node:crypto` imports are externalized by vite dev and throw
//     when their bindings are read during client evaluation;
//   - `@tanstack/react-start/server` is rejected by import-protection.
// Every such import is therefore dynamic and happens inside async helpers
// that only ever execute on the server (RPC handlers / route guards).

const COOKIE_NAME = "kj_admin_session";
const SESSION_TTL_SEC = 7 * 24 * 60 * 60; // 7 days

type NodeCrypto = typeof import("node:crypto");

let cryptoMod: Promise<NodeCrypto> | null = null;
function nodeCrypto(): Promise<NodeCrypto> {
  if (!cryptoMod) cryptoMod = import("node:crypto");
  return cryptoMod;
}

function envAdminId(): string {
  return process.env["ADMIN_ID"] || "Admin";
}

function envAdminPassword(): string {
  return process.env["ADMIN_PASSWORD"] || "KJ@2026";
}

async function sessionSecret(): Promise<string> {
  if (process.env["SESSION_SECRET"]) return process.env["SESSION_SECRET"];
  // Stable fallback derived from the admin password so sessions survive
  // restarts even without an explicit SESSION_SECRET.
  const { createHash } = await nodeCrypto();
  return createHash("sha256").update(`kj-session:${envAdminPassword()}`).digest("hex");
}

async function hmac(payload: string): Promise<string> {
  const { createHmac } = await nodeCrypto();
  const secret = await sessionSecret();
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

async function issueSessionToken(): Promise<string> {
  const { createHash } = await nodeCrypto();
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SEC);
  const nonce = createHash("sha256")
    .update(`${exp}:${Math.random()}:${Date.now()}`)
    .digest("base64url")
    .slice(0, 16);
  const payload = `${exp}.${nonce}`;
  return `${payload}.${await hmac(payload)}`;
}

async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!exp || !nonce || !sig) return false;
  const { timingSafeEqual } = await nodeCrypto();
  const expected = await hmac(`${exp}.${nonce}`);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expNum = Number(exp);
  return Number.isFinite(expNum) && expNum > Math.floor(Date.now() / 1000);
}

async function secretsMatch(provided: string, expected: string): Promise<boolean> {
  const { createHash, timingSafeEqual } = await nodeCrypto();
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function cookieSecure(): boolean {
  const raw = process.env["COOKIE_SECURE"];
  if (raw === "true") return true;
  if (raw === "false") return false;
  return import.meta.env.PROD;
}

export type LoginInput = { id: string; password: string };
export type LoginResult = { ok: boolean; error?: string };

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: LoginInput): LoginInput => data)
  .handler(async ({ data }): Promise<LoginResult> => {
    const idOk = await secretsMatch(data.id, envAdminId());
    const pwOk = await secretsMatch(data.password, envAdminPassword());
    if (!idOk || !pwOk) {
      return { ok: false, error: "Invalid ID or password." };
    }
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(COOKIE_NAME, await issueSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SEC,
      secure: cookieSecure(),
    });
    return { ok: true };
  });

export const checkSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return { authed: await verifySessionToken(getCookie(COOKIE_NAME)) };
});

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true };
});

/** Server-side session check for route guards. Async: cookie access is dynamic. */
export async function isAuthenticated(): Promise<boolean> {
  const { getCookie } = await import("@tanstack/react-start/server");
  return verifySessionToken(getCookie(COOKIE_NAME));
}
