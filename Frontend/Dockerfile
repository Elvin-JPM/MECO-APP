# Stage 1: Build the React app

FROM node:14 as build
WORKDIR /applicacion
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Servir el build con Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/htmml/*
COPY --from=build /app/build /usr/share/nginx/htmml
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]