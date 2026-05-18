# Stage 1: Build the Angular application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application and build
COPY . .
RUN npx ng build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
# Copy the build output from Stage 1 to Nginx's public folder
# Note: Check your 'dist/' folder structure. It might be /app/dist/<project-name>/browser
COPY --from=build /app/dist/shortlist-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
