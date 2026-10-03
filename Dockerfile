# Khan Jewellers — production image for Coolify / Docker.
# Build:  docker build -t khan-jewellers .
# Run:    docker run -p 3000:3000 --env-file .env khan-jewellers
#
# The build produces a Nitro "node-server" bundle at .output/server/index.mjs
# which reads PORT (and HOST) at runtime.

FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies first for layer caching.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---- Runtime -------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=build /app/.output ./.output

# Non-root user for production.
RUN useradd --system --create-home --shell /usr/sbin/nologin app \
    && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
