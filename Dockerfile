# The entire file is optimized for NODE_ENV=production, 
# which is the safest setting for the App Router build phase.

# ---- Base image (Used for dependencies caching) ----
FROM node:18-alpine AS base
WORKDIR /app
# Set NODE_ENV to production universally. This is crucial for the Next.js build.
# This setting is *correct* for the final build output and runtime.
ENV NODE_ENV=production

# Install OS dependencies required by Next.js
RUN apk add --no-cache libc6-compat

# --- Dependencies (Production dependencies only) ----
FROM base AS deps
# Copy only package files to leverage Docker's build cache
COPY package.json package-lock.json* ./
# Install only production dependencies for the final runtime image
RUN npm ci --omit=dev

# 🔑 ---- Builder (Install all dependencies for build + run build) ----
FROM base AS builder
# This stage inherits NODE_ENV=production. We must temporarily override it 
# for the installation step so devDependencies (like typescript) are installed.

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (dev dependencies are required for 'next build').
# Temporarily set NODE_ENV=development to force devDependencies installation.
RUN NODE_ENV=development npm ci

# Copy source code after installing deps to leverage caching
COPY . .

# Build Next.js app
# The fix: Removed the redundant 'npm install' step. 
# The issue was not native modules, but missing devDependencies.
# We now only run the build command. The temporary fix for native modules is likely not needed.
RUN npm run build

# ---- Production Runner (Final image, smallest size) ----
FROM node:18-alpine AS runner
WORKDIR /app
# Ensure runtime environment is also production
ENV NODE_ENV=production

# Install OS dependencies
RUN apk add --no-cache libc6-compat

# Copy only what is strictly needed for runtime:
# 1. package.json for 'npm start'
COPY --from=builder /app/package.json ./
# 2. .next build output (built with production settings)
COPY --from=builder /app/.next ./.next
# 3. public static files
COPY --from=builder /app/public ./public
# 4. Production node_modules from the 'deps' stage (smallest node_modules possible)
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]