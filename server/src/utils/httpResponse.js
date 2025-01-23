export class HttpResponse {
  constructor(statusCode, status, message, data = null) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(message, data = null) {
    return new HttpResponse(200, "success", message, data);
  }

  static created(message, data = null) {
    return new HttpResponse(201, "success", message, data);
  }

  static badRequest(message = "Bad Request") {
    return new HttpResponse(400, "error", message, null);
  }

  static unauthorized(message = "Unauthorized") {
    return new HttpResponse(401, "error", message, null);
  }

  static forbidden(message = "Forbidden") {
    return new HttpResponse(403, "error", message, null);
  }

  static notFound(message = "Not Found") {
    return new HttpResponse(404, "error", message, null);
  }

  static conflict(message = "Conflict") {
    return new HttpResponse(409, "error", message, null);
  }

  static internalError(message = "Internal Server Error") {
    return new HttpResponse(500, "error", message, null);
  }

  send(res) {
    return res.status(this.statusCode).json({
      statusCode: this.statusCode,
      status: this.status,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    });
  }
}
