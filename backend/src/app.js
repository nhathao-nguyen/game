'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: '*', // Cho phép React Native gọi từ mọi nơi
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev only) ───────────────────────────────────────────────
if (env.isDev()) {
  app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/', routes);

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
