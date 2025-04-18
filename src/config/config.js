import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const isDocker = fs.existsSync('/.dockerenv');

const config = {
  endpoints: {
    auth: isDocker ? 'http://auth:3001' : 'http://localhost:3001',
    user: isDocker ? 'http://user:3002' : 'http://localhost:3002',
    match: isDocker ? 'http://match:3003' : 'http://localhost:3003',
    tour: isDocker ? 'http://tour:3004' : 'http://localhost:3004',
    game: isDocker ? 'http://game:3005' : 'http://localhost:3005',
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
  isDocker,
};
export default config;