// src/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Crear un pool de conexiones usando las variables de entorno
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Probar conexión inicial
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

module.exports = pool;
