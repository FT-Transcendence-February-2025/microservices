// Get domain from env vars or use localhost
const domain = import.meta.env.VITE_HOST || 'localhost';

// If domain is NOT localhost, we're in Docker environment
const isDocker = domain !== 'localhost';

const protocol = isDocker ? 'https://' : 'http://';

// Define interface for configuration
interface ServiceEndpoints {
  auth: string;
  user: string;
  match: string;
  tour: string;
  game: string;
}

interface Config {
  toBackend: ServiceEndpoints;
  isDocker: boolean;
  protocol: string; 
}

const config: Config = {
	toBackend: {
		// These are for frontend-to-backend communication
		auth: isDocker ? `${domain}/api/auth` : 'localhost:3001',
		user: isDocker ? `${domain}/api/user` : 'localhost:3002',
		match: isDocker ? `${domain}/api/match` : 'localhost:3003',
		tour: isDocker ? `${domain}/api/tour` : 'localhost:3004',
		game: isDocker ? `${domain}/api/game` : 'localhost:3005',
	},
	isDocker,
	protocol
};
  
export default config;