# --------
# Stage 1: Build
# --------
FROM node:22-alpine AS build
WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --------
# Stage 2: Run
# --------
FROM node:22-alpine
WORKDIR /frontend

COPY --from=build /frontend /frontend
RUN npm install -g serve

# Servimos en el puerto 80 dentro del contenedor
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]
