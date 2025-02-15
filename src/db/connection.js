import knex from 'knex';
import config from '../../knexfile.js';

export const db = knex(config);

/* 
- db can be reusable later in the code
- The connection is established lazily (only when first used)
- Knex handles connection pooling automatically
- The same connection can be reused across your application
*/
