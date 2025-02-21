import path from 'path';

const authDbPath =
  process.env.NODE_ENV === 'production'
    ? '/app/database/database.sqlite'
    : path.join(
        process.cwd(),
        '../authentication-service/src/database/database.sqlite'
      );

const matchmakingDbPath =
  process.env.NODE_ENV === 'production'
    ? '/app/data/database.sqlite'
    : path.join(process.cwd(), './data/database.sqlite');

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: matchmakingDbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: matchmakingDbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
    },
  },
  authentication: {
    client: 'sqlite3',
    connection: {
      filename: authDbPath,
    },
    useNullAsDefault: true,
  },
  matchmaking: {
    client: 'sqlite3',
    connection: {
      filename: matchmakingDbPath,
    },
    useNullAsDefault: true,
  },
};

export default config;
