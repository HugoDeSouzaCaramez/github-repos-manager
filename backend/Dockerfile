FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN yarn install

COPY . .

ENV NODE_ENV=production

CMD if [ "$WORKER" = "true" ]; then \
      yarn ts-node src/worker.ts; \
    else \
      yarn nest start; \
    fi