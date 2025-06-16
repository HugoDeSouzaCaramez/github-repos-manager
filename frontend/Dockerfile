FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN sed -i 's/listen  .*/listen 3001;/g' /etc/nginx/conf.d/default.conf
EXPOSE 3001
CMD ["nginx", "-g", "daemon off;"]