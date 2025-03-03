import path from 'path';

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
  matchmaking: {
    client: 'sqlite3',
    connection: {
      filename: matchmakingDbPath,
    },
    useNullAsDefault: true,
  },
};

export default config;
