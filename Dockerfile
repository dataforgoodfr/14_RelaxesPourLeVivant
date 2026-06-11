FROM node:lts-bookworm-slim AS base

# ----------------------------
# Stage 1: Install all dependencies
# ----------------------------
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ----------------------------
# Stage 2: Build the application
# ----------------------------
FROM deps AS build
WORKDIR /app
COPY . .
RUN node ace build

# ----------------------------
# Stage 3: Production runtime
# ----------------------------
FROM base AS production
WORKDIR /app
ARG APP_VERSION
ENV NODE_ENV=production HUSKY=0 APP_VERSION=$APP_VERSION

LABEL VERSION=$APP_VERSION

COPY --from=build /app/build ./
RUN npm ci --omit=dev

EXPOSE 3333
CMD ["node", "bin/server.js"]