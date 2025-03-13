FROM node:20-alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm install --include=dev

COPY src .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
