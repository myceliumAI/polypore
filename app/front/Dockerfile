FROM node:20-alpine

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

COPY package.json package-lock.json* yarn.lock* .npmrc* .yarnrc* ./
RUN if [ -f yarn.lock ]; then yarn install; else yarn install; fi

COPY . /app

EXPOSE 5173

CMD ["sh", "-lc", "make dev"] 