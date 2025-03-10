FROM node:20-alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm install --include=dev

COPY src .

EXPOSE 3001

CMD ["npm", "run", "dev"]