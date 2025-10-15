const { ApplicationError } = require('../errors');

function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not Found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApplicationError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, details: err.details });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
