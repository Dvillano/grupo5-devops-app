# --------
# Stage 1: Build
# --------
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime: use nginx for static files (smaller, production-ready)
FROM nginx:alpine AS production
ARG APP_VERSION=0.0.0
LABEL org.opencontainers.image.version=$APP_VERSION

# Remove default nginx static content and copy build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Simple healthcheck (will be a no-op if wget/curl unavailable in some base images)
# Keep lightweight: check index.html exists
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD ["/bin/sh", "-c", "[ -s /usr/share/nginx/html/index.html ] || exit 1"]

CMD ["nginx", "-g", "daemon off;"]
