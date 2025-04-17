# CORS (Cross-Origin Resource Sharing)

## What is CORS?

It is a mechanism for integrating applications

- CORS defines a way for client web applications that are loaded in one domain to interact with resources in a different domain.

This is helpful in our pong game because it will allow us to communicate between containers, in other words, call third-party APIs

CORS allows the client browser to check with the third-party servers if the request is authorizes before any data transfers.

## Why is important?

To prevent CSRF (cross-site request forgery), all browsers now implement the same-origin policy.
CSRF was an issue for the past, where fake client request were sent from the victim's browser to another application

### Same-origin policy

Today, browsers enforce that clients can only send requests to a resourcee with the same origin as the client's URL. The protocol, port, and hostname of the client's URL should all match the server it requests.

For example, consider the origin comparison for the below URLS with the client URL `http://store.aws.com/dir/page.html`.

| URL                                       | Outcome          | Reason                                         |
| ----------------------------------------- | ---------------- | ---------------------------------------------- |
| http://store.aws.com/dir2/new.html        | Same origin      | Only the path differs                          |
| http://store.aws.com/dir/inner/other.html | Same origin      | Only the path differs                          |
| https://store.aws.com/page.html           | Different origin | Different protocol                             |
| http://store.aws.com:81/dir/page.html     | Different origin | Different port (http:// is port 80 by default) |
| http://news.aws.com/dir/page.html         | Different origin | Different host                                 |

CORS is an extension of the same-origin policy. You need it for authorized resource sharing with external third parties.

## How does CORS work?

Let's call the current browser URL `current origin` and the third-party URL is `cross-origin`

When the cross-origin request is made, this is what happens:

1. The browser adds an origin header to the request with information about the current origin's protocol, host and port
2. The server check the current origin header and responds with the requested data and an Access-Control-Allow-Origin header
   - For example, if a server wants to allow requests from http://www.example.com, it would include the following header in its response:
   ```bash
   	Access-Control-Allow-Origin: http://www.example.com
   ```
3. The browser sees the access control request and shares the returned data with the client application

If the server doesn't allow cross-origin access, it responds with an error message.

See an example in the reference below.

## CORS best practices

### Define appropriate access list

It is always best to grant access to individual domains using comma-separated lists. Avoid using wildcards unless you want to make the API public.

### Avoid using null origin in your list

Some browsers send the value `null` in the request header for certain scenarios like file requests or requests from the local host.

## How to implemented with Fastify?

Install the dependencie in your project

```bash
npm install @fastify/cors
```

In the file where your server is located

```JavaScript
// ...your imports
import fastifyCors from '@fastify/cors';
// ...more imports
```

Register your cors plugin

```JavaScript
//...
const fastify = Fastify({
  logger: true,
});

await fastify.register(fastifyCors, {
  origin: ['http://authentication:3000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
//...more code
```

```javascript
origin: [
  'http://authentication:3000', // For container-to-container communication
  'http://localhost:3000', // For external/host machine access
];
```

- `origin:` Configures the Access-Control-Allow-Origin CORS header. It can be boolean, string, RegExp, Array of Function.
- `methods:` Configures the Access-Control-Allow-Methods CORS header. Expects a comma-delimited string or an array.
- `credentials:` Configures the Access-Control-Allow-Credentials CORS header.

See reference below for more options

## Connect 2 databases from different containers

1. Update your `knexfile.js` in both services to point to the authentication service's database:

```javascript
export default {
  client: 'sqlite3',
  connection: {
    filename: '/app/database/database.sqlite', // Docker database path
  },
  useNullAsDefault: true,
};
```

2. Update `docker-compose.yml` to share the authentication database with the matchmaking service:

```docker
services:
  authentication:
    # ... existing config ...
    volumes:
      - ./authentication-service:/app
      - /app/node_modules
      - ./authentication-service/src/database:/app/database  # Add this line

  matchmaking:
    # ... existing config ...
    volumes:
      - ./matchmaking-service:/app
      - /app/node_modules
      - ./authentication-service/src/database:/app/database  # Add this line
    depends_on:
      - authentication
```

### TIPS

- Make sure to delete package-lock.json and node_modules

# References

`AWS - CORS:` https://aws.amazon.com/what-is/cross-origin-resource-sharing/
`Fastify-cors plugin documentation:` https://github.com/fastify/fastify-cors

password123P@@@!
password123P@@@!!
