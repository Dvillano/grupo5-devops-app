# --------
# Stage 1: Build
# --------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --------
# Stage 2: Nginx Runner
# --------
FROM nginx:alpine

# Use lightweight nginx to serve static build files instead of Node runtime
COPY --from=builder /app/build /usr/share/nginx/html

# Override default nginx config to support client-side routing (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
