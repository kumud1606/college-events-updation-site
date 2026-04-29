export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

export function notFound(message) {
  return new AppError(message, 404);
}

export function badRequest(message) {
  return new AppError(message, 400);
}

export function unauthorized(message = "Authentication required.") {
  return new AppError(message, 401);
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new AppError(message, 403);
}
