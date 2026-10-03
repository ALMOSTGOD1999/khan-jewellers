// Loads `.env` from the working directory into process.env for LOCAL runs.
//
// - The production Docker/Coolify image has no .env (secrets arrive as real
//   environment variables), so this is a no-op there.
// - In the browser this guard makes it a no-op as well.
// - Node's loadEnvFile() never overrides variables already set in the
//   environment, so explicit env vars always win.

let loaded = false;

export function loadLocalEnv(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (typeof process !== "undefined" && typeof process.loadEnvFile === "function") {
      process.loadEnvFile(".env");
    }
  } catch {
    // No .env file present — rely on real environment variables.
  }
}
