# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only the files needed for install
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm install

# Copy rest of the project
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only the build & needed files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
