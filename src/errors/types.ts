/**
 * Base shape for all HTTP error objects
 */
export interface BaseError {
  status: number;
  code: string;
  message: string;
}

/**
 * JSON response body sent to clients
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
