# --------
# Stage 1: Build
# --------
FROM node:22-alpine AS build
WORKDIR /api

COPY package*.json ./api

RUN npm install 

COPY . . 

# --------
# Stage 2: Run
# --------
FROM node:22-alpine
WORKDIR /api

COPY --from=build /api /api

EXPOSE 3000
CMD ["node", "./src/index.js"]
