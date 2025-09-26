# --------
# Stage 1: Build
# --------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .
# --------
# Stage 2: Run
# --------
FROM node:22-alpine
WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000
CMD ["node", "./src/index.js"]
