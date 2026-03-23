FROM node:24-alpine
WORKDIR /home/node/app
COPY . .
RUN npm ci
USER node
CMD ["npm","run","start"]
