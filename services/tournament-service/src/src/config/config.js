import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const isDocker = fs.existsSync('/.dockerenv');

const config = {
  endpoints: {
    auth: isDocker ? 'http://auth:3001/api' : 'http://localhost:3001',
    user: isDocker ? 'http://user:3002/api' : 'http://localhost:3002',
    match: isDocker ? 'http://match:3003/api' : 'http://localhost:3003',
    tour: isDocker ? 'http://tour:3004/api' : 'http://localhost:3004',
    game: isDocker ? 'http://game:3005/api' : 'http://localhost:3005',
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
		customLogLevel: (req, res) => {
			// Only suppress console output for /metrics, don't interfere with the actual endpoint
			if (req.url === '/metrics') {
			  return 'silent';
			}
			// Default log level
			return res.statusCode >= 400 ? 'error' : 'info';
		  },
		  // Use serializer to control what appears in the logs without affecting data collection
		  serializers: {
			req(request) {
			  if (request.url === '/metrics') {
				// Return minimal info for metrics requests
				return undefined;
			  }
			  return {
				method: request.method,
				url: request.url,
				host: request.headers ? request.headers.host : undefined,
				remoteAddress: request.ip,
				remotePort: request.socket ? request.socket.remotePort : undefined
			  };
			}
		  }
		}
    : true,
  isDocker,
};
export default config;
