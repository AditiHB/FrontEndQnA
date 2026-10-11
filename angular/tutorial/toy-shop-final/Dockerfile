# ---- Stage 1: build the app (this stage is thrown away afterwards) ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 2: the small image we really ship ----
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /app
# The server bundle already contains everything it needs, so we copy only the build output.
COPY --from=build /app/dist/toy-shop ./dist/toy-shop
# Do not run as root.
USER node
# Behind nginx or a load balancer? Start the container with:  -e BEHIND_PROXY=true
# Visited under a real domain? Also add:  -e NG_ALLOWED_HOSTS=shop.example.com
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "fetch('http://localhost:4000/healthz').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "dist/toy-shop/server/server.mjs"]
