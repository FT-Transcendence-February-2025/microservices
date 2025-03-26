FROM node:20-alpine

WORKDIR /app

ARG DEBUG_MODE

RUN if [ "$DEBUG_MODE" = "1" ]; then apk update && apk add --no-cache curl openssl jq; fi

COPY src/package*.json ./

RUN npm install --include=dev

COPY src .

EXPOSE 3002

CMD ["npm", "run", "dev"]