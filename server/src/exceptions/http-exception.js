export class HttpException extends Error {
  message;
  errorCode;
  statusCode;
  errors;

  constructor(message, errorCode, statusCode, errors) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
