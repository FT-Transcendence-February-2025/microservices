FROM node:20-alpine

WORKDIR /app

ARG DEBUG_MODE

RUN apk update && apk add --no-cache \
	sqlite-dev \
	python3 \
	make \
	g++ \
	build-base

RUN if [ "$DEBUG_MODE" = "1" ]; then \
	apk update && apk add --no-cache curl openssl jq; \
	fi

COPY src/package*.json ./

RUN npm install --include=dev

RUN npm install --save-dev pino-pretty; \
    npm install --save-dev prom-client; \
    npm install --save-dev dotenv; \
    npm install --save-dev cron; \
    npx npm-check-updates -u; \
    npm install;

COPY src .

EXPOSE 3001

CMD ["npm", "run", "dev"]