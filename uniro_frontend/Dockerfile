FROM node:22-slim AS build

WORKDIR /app
COPY ./uniro_frontend .

RUN npm install --legacy-peer-deps --no-audit && npm run build

FROM nginx

COPY uniro_frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]