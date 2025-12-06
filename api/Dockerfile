# --------
# Stage 1: Dependencies
# --------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install only prod dependencies
RUN npm ci --only:production

COPY . .
# --------
# Stage 2: Run
# --------
FROM node:22-alpine
WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000
CMD ["node", "./src/index.js"]
