FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn run build

ENV NODE_ENV=production

CMD if [ "$WORKER" = "true" ]; then \
      yarn run start:worker; \
    else \
      yarn run start; \
    fi