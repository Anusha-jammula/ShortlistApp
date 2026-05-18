FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx ng build --configuration=production

RUN echo "===== DIST FOLDER =====" && ls -la /app/dist
RUN echo "===== SHORTLIST DIST =====" && ls -la /app/dist/shortlist-app

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/shortlist-app/ /usr/share/nginx/html/

RUN echo "===== NGINX HTML =====" && ls -la /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
