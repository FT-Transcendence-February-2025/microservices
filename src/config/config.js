import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()
const isDocker = fs.existsSync('/.dockerenv')

const config = {
  endpoints: {
    auth: isDocker ? 'http://auth:3001/api' : 'http://localhost:3001',
    user: isDocker ? 'http://user:3002/api' : 'http://localhost:3002',
    tour: isDocker ? 'http://match:3003/api' : 'http://localhost:3003',
    match: isDocker ? 'http://tour:3004/api' : 'http://localhost:3004',
    game: isDocker ? 'http://game:3005/api' : 'http://localhost:3005'
  },
  apiPrefix: isDocker ? '/api' : '',
  logger: isDocker
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM',
          colorize: true
        }
      }
    }
    : true,
  isDocker
}
export default config
