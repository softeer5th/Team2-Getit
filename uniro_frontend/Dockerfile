FROM node:22-alpine AS build

WORKDIR /app
COPY ./uniro_frontend/package*.json .

RUN --mount=type=cache,target=/root/.npm \
    npm set cache /root/.npm && \
    npm install

COPY ./uniro_frontend .

RUN npm run build

RUN cd dist && find . -type f -exec brotli --best {} \;

FROM alpine

RUN apk update && apk add nginx-mod-http-brotli

COPY uniro_frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]