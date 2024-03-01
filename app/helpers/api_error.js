class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

class Unauthorized extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class Forbidden extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class BadRequest extends ApiError {
  constructor(message = "BadRequest") {
    super(message, 400);
  }
}

class NotFound extends ApiError {
  constructor(message = "NotFound") {
    super(message, 404);
  }
}

class Locked extends ApiError {
  constructor(message = "Locked") {
    super(message, 423);
  }
}

class NotAllowed extends ApiError {
  constructor(message = "NotAllowed") {
    super(message, 419);
  }
}

module.exports = ApiError;
module.exports.Unauthorized = Unauthorized;
module.exports.Forbidden = Forbidden;
module.exports.BadRequest = BadRequest;
module.exports.NotFound = NotFound;
module.exports.Locked = Locked;
module.exports.NotAllowed = NotAllowed;
module.exports.InternalServerError = InternalServerError;
