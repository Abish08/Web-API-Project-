// Custom exception class for HTTP errors
/**
 * CustomHttpException extends Error class
 * Used to throw HTTP-specific errors with status codes
 */
export class CustomHttpException extends Error {
  statusCode: number;

  constructor(status: number, message: string) {
    super(message);
    this.statusCode = status;
    this.name = "CustomHttpException";
  }
}