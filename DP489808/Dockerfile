# Use an official Node.js runtime as a parent image
FROM node:18.13.0

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD [ "node", "fetch.js" ]
