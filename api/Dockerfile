# --------
# Stage 1: Dependencies
# --------
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

# Install only production deps in a separate stage to keep final image small
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:${NODE_VERSION}-alpine AS runtime
ARG APP_VERSION=0.0.0
LABEL org.opencontainers.image.version=$APP_VERSION
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup -S app && adduser -S app -G app

# Copy production node_modules from deps stage and application source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure files are owned by the non-root user
RUN chown -R app:app /app
USER app

EXPOSE 3000

# Basic TCP check to ensure app port is accepting connections
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD node -e "require('net').createConnection(3000).on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
