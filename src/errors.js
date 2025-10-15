class ApplicationError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message, details = null) {
    super(message || 'Validation failed', 400, details);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource, identifier, details = null) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' was not found`
      : `${resource} was not found`;
    super(message, 404, details || { resource, identifier });
  }
}

class ConflictError extends ApplicationError {
  constructor(message, details = null) {
    super(message || 'Conflict detected', 409, details);
  }
}

module.exports = {
  ApplicationError,
  ValidationError,
  NotFoundError,
  ConflictError
};
