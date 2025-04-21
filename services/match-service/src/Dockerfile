FROM node:20-alpine

RUN apk update && apk add --no-cache \
	sqlite-dev \
	python3 \
	make \
	g++ \
	build-base
	
WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

RUN npm install --save-dev pino-pretty; \
    npm install --save-dev prom-client; \
    npm install --save-dev dotenv; \
    npm install --save-dev cron; \
    npx npm-check-updates -u; \
    npm install;

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]