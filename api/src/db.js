import { Pool } from 'pg';
// eslint-disable-next-line no-undef
require('dotenv').config();

const pool = new Pool({
  // eslint-disable-next-line no-undef
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(client => {
    return client
      .query('SELECT NOW()')
      .then(res => {
        console.log('✅ Connected to Postgres:', res.rows[0].now);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('❌ Error running initial test query', err.stack);
      });
  })
  .catch(err => console.error('❌ Could not connect to Postgres', err.stack));

export default pool;
