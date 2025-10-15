const express = require('express');
const { registerRoutes } = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error');

function createApp(service) {
  const app = express();
  app.use(express.json());

  registerRoutes(app, service);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
