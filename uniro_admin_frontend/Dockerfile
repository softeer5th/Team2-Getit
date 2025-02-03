FROM node:22-slim AS build

WORKDIR /app
COPY ./uniro_admin_frontend .

RUN npm install --legacy-peer-deps --no-audit && npm run build

FROM nginx

COPY uniro_admin_frontend/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]