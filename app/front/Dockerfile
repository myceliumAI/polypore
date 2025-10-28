# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files
COPY package.json package-lock.json* yarn.lock* .npmrc* .yarnrc* ./
RUN if [ -f yarn.lock ]; then yarn install; else yarn install; fi

# Copy source code
COPY . /app

ARG VITE_API_URL=/api
ENV NODE_ENV=production

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template and entrypoint
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"] 