FROM mhart/alpine-node:10
MAINTAINER Christoffer Söderberg <christoffer@delitech.se>

WORKDIR /app
COPY . .

# If you have native dependencies, you’ll need extra tools
# RUN apk add --no-cache make gcc g++ python

RUN npm install --production

CMD ["node", "app.js"]
