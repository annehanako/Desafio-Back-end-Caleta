FROM node:20-alpine
WORKDIR /caleta-bet
COPY . /caleta-bet
RUN npm install
EXPOSE 3000
CMD node ./src/index.js