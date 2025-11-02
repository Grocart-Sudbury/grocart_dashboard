# ---- Base image ----
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

# ---- Dependencies ----
FROM base AS deps

# Only copy dependency files (this allows Docker to cache npm install)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev  # production deps only

# ---- Builder ----
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development

# Install OS deps
RUN apk add --no-cache libc6-compat

# Copy dependency files and install all (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code after installing deps to leverage caching
COPY . .

# Build Next.js app
RUN npm run build

# ---- Production Runner ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need for runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
