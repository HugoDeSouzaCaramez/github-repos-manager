FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN yarn install

COPY . .

ENV NODE_ENV=production

CMD if [ "$WORKER" = "true" ]; then \
      ./wait-for.sh db:3306 rabbitmq:5672 -- yarn ts-node src/worker.ts; \
    else \
      ./wait-for.sh db:3306 rabbitmq:5672 -- yarn nest start; \
    fi