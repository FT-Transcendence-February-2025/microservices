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
	npm install --save-dev prom-client; \
	npm install rimraf@latest --save; \
	npm install npmlog@latest --save; \
	npm install --save-dev cron ; \
	fi

COPY src .

EXPOSE 3002

# CMD ["sh", "-c", "node src/database/migrations/create-users-table.js && npm run dev"]
CMD ["npm", "run", "dev"]