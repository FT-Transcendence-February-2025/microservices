# SQLite

## Install SQLite using Docker
The container needs to be located in the rood directory:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002

CMD ["npm", "start"]
```

Then create `docker-compose.yml` file:
```docker compose
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    volumes:
      - ./data:/app/data
```

Update the `package.json` file to include SQLite dependencies by running:
```bash
npm install sqlite3
```

Create a `data` directory in your root folder to persist SQLite data:
```bash
mkdir data
```

The file structure should look like this:
```
.
├── Dockerfile
├── docker-compose.yml
├── data/
├── src/
└── package.json
```

To build and run:
```bash
docker-compose up --build
```

Your SQLite database will persist in the data directory and be available to your Fastify application running in the container.

## Code explanation
In index.js, fastify.decorate() is used to add custom properties or methods to the Fastify instance.

This line:

```javascript
fastify.decorate('sqlite', db);
```

Does the following:

Adds a db property to the Fastify instance
Makes the SQLite database connection available throughout your application
Allows you to access the database in your route handlers/controllers using fastify.db

For example, in books-controller.js, you can access the database connection like this:
```javascript
const booksController = (fastify, options, done) => {
    fastify.get('/', async (req, reply) => {
        // Access the database using fastify.db
        return new Promise((resolve, reject) => {
            fastify.db.all('SELECT * FROM books', [], (err, rows) => {
                if (err) reject(err);
                resolve({ books: rows });
            });
        });
    });
    done();
};
```

This is a way to share the database connection across your entire application without having to create new connections in each controller.

## Docker
Command to fo inside the SQLite3 container

Using the running SQLite container:
```bash
# Connect to the running container
docker exec -it sqlite3 sh

# Inside the container, access SQLite
sqlite3 /data/database.sqlite

find / -name "database.sqlite" 2>/dev/null
```

Once inside the SQLite CLI, run these commands:
```sql
-- Show all tables
.tables

-- Show table schema
.schema books

-- Query the books table
SELECT * FROM books;

-- Exit SQLite CLI
.quit
```