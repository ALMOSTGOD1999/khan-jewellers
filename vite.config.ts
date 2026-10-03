// Explicit build config for TanStack Start (replaces the previous
// zero-config wrapper package). Wired in the same order as that wrapper:
// tailwindcss, tsconfig paths, tanstackStart (+ SSR server entry override),
// nitro (build only), React plugin — plus the shared resolve/optimizeDeps
// and dev-watch defaults. Sandbox-only behavior (editor telemetry loggers,
// preview asset proxy, devtools overlay, port/host pinning) is not ported.
import { defineConfig, loadEnv, type UserConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  // Inline VITE_* vars so client and SSR builds resolve them identically.
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "VITE_"))) {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const isDevBuild = command === "build" && mode === "development";

  return {
    define,
    ...(isDevBuild
      ? {
          environments: {
            client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
          },
        }
      : {}),
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
      watch: { awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 } },
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          // `specifiers`/`files` are DENY lists (defaults already deny
          // `@tanstack/react-start/server`); `ignoreImporters` exempts these
          // files from import checks. auth.server.ts only touches cookie APIs
          // inside createServerFn handler bodies (RPC-bridged, never executed
          // in the browser).
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
          ignoreImporters: ["src/fns/auth.server.ts"],
        },
        // Redirect TanStack Start's bundled server entry to src/server.ts
        // (the project's SSR error wrapper); nitro builds from this.
        server: { entry: "server" },
      }),
      // Node server output for Docker/Coolify deploys (reads PORT at runtime).
      ...(command === "build" ? [nitro({ preset: "node-server" })] : []),
      viteReact(),
    ],
  };
});
