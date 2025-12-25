# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# package + lock
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src

# lock dosyan varsa en temizi:
RUN npm install
RUN npm run build

# ---- runtime stage ----
FROM nginx:1.27-alpine

# nginx config (SPA + /api proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80