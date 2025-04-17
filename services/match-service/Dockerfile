FROM node:20-alpine

WORKDIR /app

ARG DEBUG_MODE

RUN apk update && apk add --no-cache sqlite

RUN if [ "$DEBUG_MODE" = "1" ]; then \
	apk update && apk add --no-cache curl openssl jq; \
	fi

COPY src/package*.json ./

RUN npm install --include=dev

RUN if [ "$DEBUG_MODE" = "1" ]; then \
	npm install --save-dev pino-pretty; \
	fi

COPY src .

EXPOSE 3003

CMD ["npm", "run", "dev"]