FROM node:22-slim AS build

WORKDIR /app
COPY . .

RUN npm install --legacy-peer-deps --no-audit && npm run build

FROM nginx

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

VOLUME ["/usr/share/nginx/html/.env"]

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]