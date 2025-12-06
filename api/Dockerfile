# --------
# Stage 1: Dependencies
# --------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install only prod dependencies
RUN npm ci --only=production

# --------
# Stage 2: Run
# --------
FROM node:22-alpine AS runner
WORKDIR /app

# Force production mode so Node/libs run with optimized settings
ENV NODE_ENV=production

USER node

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000
CMD ["node", "./src/index.js"]
