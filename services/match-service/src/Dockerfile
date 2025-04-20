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

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]