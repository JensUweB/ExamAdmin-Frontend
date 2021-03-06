#### Stage 1
FROM node:12 as node
LABEL author="Jens Uwe Becker"
LABEL maintainer="jens.becker@root-itsolutions.de"
LABEL version="0.3.5"
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build:de

#### Stage 2
FROM httpd:latest
COPY --from=node /app/dist/ExamAdmin-DE /usr/local/apache2/htdocs/
COPY ./config/.htaccess /usr/local/apache2/htdocs/
