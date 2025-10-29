# ---- Base builder ----
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install only the OS packages we need
RUN apk add --no-cache libc6-compat

# ---- Dependencies layer ----
FROM base AS deps

# Copy only dependency files
COPY package.json package-lock.json* ./

# Install dependencies using npm ci for reproducibility
RUN npm ci

# ---- Build layer ----
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps to use cache
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the project
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Production runner ----
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary runtime files
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
