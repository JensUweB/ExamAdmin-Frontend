#### Stage 1
FROM node:12 as node
LABEL author="Jens Uwe Becker"
LABEL maintainer="jens.becker@root-itsolutions.de"
LABEL version="0.1"
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build:de

#### Stage 2
FROM httpd:latest
COPY --from=node /app/dist/ExamAdmin-DE /usr/local/apache2/htdocs/
COPY ./config/.htaccess /usr/local/apache2/htdocs/