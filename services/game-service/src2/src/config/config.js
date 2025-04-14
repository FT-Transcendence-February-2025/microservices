require('dotenv').config();
const fs = require('fs');
const isDocker = fs.existsSync('/.dockerenv');

const config = {
  endpoints: {
    auth: isDocker ? 'http://auth:3001' : 'http://localhost:3001',
    user: isDocker ? 'http://user:3002' : 'http://localhost:3002',
    tour: isDocker ? 'http://match:3003' : 'http://localhost:3003',
    match: isDocker ? 'http://tour:3004' : 'http://localhost:3004',
    game: isDocker ? 'http://game:3005' : 'http://localhost:3005'
  },
  apiPrefix: isDocker ? '/api' : '',
  logger: isDocker
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM',
            colorize: true,
          },
        },
      }
    : true,
  // CORS configuration centralized here:
  cors: {
    origin: [
      `https://${process.env.DOMAIN}`,
      `http://auth.${process.env.DOMAIN}`,
      'localhost'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  isDocker,
};

module.exports = config;