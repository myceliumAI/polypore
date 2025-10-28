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

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 