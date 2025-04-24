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

# COPY src .

COPY src/package*.json ./

# RUN rm -f package-lock.json 
# RUN rm -rf node_modules
RUN ls -la
RUN npm install --include=dev --build-from-source --no-package-lock

COPY src .

EXPOSE 3003

CMD ["npm", "run", "dev"]