import express from "express";
import pool from "./db.js";
import morgan from "morgan";
import cors from "cors";
import * as Sentry from "@sentry/node";

const app = express();

// Sentry config
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
  environment: process.env.RENDER ? "production" : "local",
  tracesSampleRate: 1.0
});

// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  req.id =
    req.headers["x-request-id"] || Math.random().toString(36).slice(2, 9);
  res.setHeader("X-Request-Id", req.id);
  next();
});
app.use(cors());

// Logging
morgan.token("id", (req) => req.id);
morgan.token("body", (req) => {
  try {
    return JSON.stringify(req.body || {});
  } catch {
    return "-";
  }
});

const loggerFormat = (tokens, req, res) =>
  JSON.stringify({
    id: req.id,
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    response_time: tokens["response-time"](req, res),
    body: process.env.NODE_ENV === "production" ? "-" : req.body,
  });
app.use(morgan(loggerFormat));

// Health
app.get("/healthz", async (req, res) => {
  const result = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    db: { ok: false, latency_ms: null },
  };

  try {
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    result.db.ok = true;
    result.db.latency_ms = Date.now() - dbStart;
    return res.status(200).json(result);
  } catch (err) {
    console.error("Health check failed:", err);
    result.status = "error";
    return res.status(500).json(result);
  }
});

// Test endpoint for Sentry
app.get("/error", async (req, res, next) => {
  next(new Error("Error from /error on Render"));
});

app.get("/tasks", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM app.tasks ORDER BY id asc");
    res.json({ tasks: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    const err = new Error("Invalid id");
    err.status = 400;
    throw err;
  }

  try {
    const result = await pool.query("SELECT * FROM app.tasks WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }

    return res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.post("/tasks", async (req, res, next) => {
  const { title, description } = req.body;
  let { done } = req.body;

  if (!title || typeof title !== "string") {
    const err = new Error("Title is required and must be a string");
    err.status = 400;
    throw err;
  }
  if (done === undefined) done = false;
  if (typeof done !== "boolean") {
    const err = new Error("Done must be a boolean");
    err.status = 400;
    throw err;
  }

  try {
    const sql =
      "INSERT INTO app.tasks (title, description, done) VALUES ($1, $2, $3) RETURNING id, title, description, done";
    const result = await pool.query(sql, [title, description || null, done]);
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.put("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    const err = new Error("Invalid id");
    err.status = 400;
    throw err;
  }

  const { title, description } = req.body;
  const done = req.body.done;

  if (title === undefined && description === undefined && done === undefined) {
    const err = new Error(
      "At least one field (title, description, done) is required"
    );
    err.status = 400;
    throw err;
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
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.delete("/tasks/:id", async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    const err = new Error("Invalid id");
    err.status = 400;
    throw err;
  }

  try {
    const sql =
      "DELETE FROM app.tasks WHERE id = $1 RETURNING id, title, description, done";
    const result = await pool.query(sql, [id]);

    if (!result.rows.length) {
      const err = new Error("Task not found");
      err.status = 404;
      throw err;
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.use(
  Sentry.expressErrorHandler({
    shouldHandleError(error) {
      return !error.status || Number(error.status) >= 400;
    },
  })
);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : err.message,
    request_id: req.id,
  });
});

export default app;
