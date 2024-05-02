FROM node:14

WORKDIR /app
COPY package.json ./
RUN npm install 
COPY index.js ./
COPY ./ /usr/local/apache2/htdocs

EXPOSE 3000

CMD ["node", "index.js"]

 