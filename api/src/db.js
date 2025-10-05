import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config()

const { Pool } = pkg;

const pool = new Pool({
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
