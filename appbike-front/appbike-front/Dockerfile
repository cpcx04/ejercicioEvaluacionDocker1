FROM node:18.13.0-alpine as angular
WORKDIR /home/app
COPY  ./package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=angular /home/app/src .
EXPOSE 80