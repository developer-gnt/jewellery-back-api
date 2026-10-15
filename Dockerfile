# Multi-stage production Dockerfile for Zewar Mahal API
# Stage 1: Build application
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

RUN npm run build

# Stage 2: Production runner
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Create uploads directory with appropriate permissions
RUN mkdir -p uploads && chown -R node:node /usr/src/app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
