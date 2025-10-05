import express from 'express';
import pool from './db.js';
import morgan from 'morgan';
import cors from 'cors';
import * as Sentry from "@sentry/node";


const app = express();

// Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});

// app.use(Sentry.Handlers.requestHandler());
// app.use(Sentry.Handlers.tracingHandler());
Sentry.setupExpressErrorHandler(app);


// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || Math.random().toString(36).slice(2, 9);
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(cors());

// Logging
morgan.token('id', req => req.id);
morgan.token('body', req => {
  try { return JSON.stringify(req.body || {}); } catch { return '-'; }
});

const loggerFormat = (tokens, req, res) => JSON.stringify({
  id: req.id,
  method: tokens.method(req, res),
  url: tokens.url(req, res),
  status: tokens.status(req, res),
  response_time: tokens['response-time'](req, res),
  body: process.env.NODE_ENV === 'production' ? '-' : req.body
});
app.use(morgan(loggerFormat));

// Health
app.get('/healthz', async (req, res) => {
  const result = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    db: { ok: false, latency_ms: null }
  };

  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    result.db.ok = true;
    result.db.latency_ms = Date.now() - dbStart;
    return res.status(200).json(result);
  } catch (err) {
    console.error("Health check failed:", err);
    result.status = 'error';
    return res.status(500).json(result);
  }

});

app.get("/tasks", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM app.tasks ORDER BY id asc");
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch tasks", details: error.message });
  }
});

app.get("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const result = await pool.query("SELECT * FROM app.tasks WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch tasks", details: error.message });
  }
});

app.post("/tasks", async (req, res, next) => {
  const { title, description } = req.body;
  let { done } = req.body;

  if (!title || typeof title !== "string") {
    return res
      .status(400)
      .json({ error: "Title is required and must be a string" });
  }
  if (done === undefined) done = false;
  if (typeof done !== "boolean") {
    return res.status(400).json({ error: "Done must be a boolean" });
  }

  try {
    const sql =
      "INSERT INTO app.tasks (title, description, done) VALUES ($1, $2, $3) RETURNING id, title, description, done";
    const result = await pool.query(sql, [title, description || null, done]);
    const task = result.rows[0];
    return res.status(201).json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return res
      .status(500)
      .json({ error: "Failed to create task", details: error.message });
  }
});

app.put("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { title, description } = req.body;
  const done = req.body.done;

  if (title === undefined && description === undefined && done === undefined) {
    return res
      .status(400)
      .json({
        error: "At least one field (title, description, done) is required",
      });
  }

  try {
    const sql =
      "UPDATE app.tasks SET title = COALESCE($1, title), description = COALESCE($2, description), done = COALESCE($3, done) WHERE id = $4 RETURNING id, title, description, done";
    const values = [
      title ?? null,
      description ?? null,
      done === undefined ? null : done,
      id,
    ];

    const result = await pool.query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ error: "Failed to update task", details: error.message });
  }
});

app.delete("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const sql = "DELETE FROM app.tasks WHERE id = $1 RETURNING id, title, description, done";
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ error: "Failed to delete task", details: error.message });

  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});




export default app;
