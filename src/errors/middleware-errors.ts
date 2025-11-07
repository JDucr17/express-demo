/**
 * Middleware Error Responses
 *
 * Standardized error responses for middleware failures.
 */

//  (express.json middleware)

// JSON parsing errors
export const JSON_ERRORS = {
  INVALID_JSON: {
    status: 400,
    code: "INVALID_JSON",
    message: "Invalid JSON format",
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    code: "PAYLOAD_TOO_LARGE",
    message: "Payload too large",
  },
  UNSUPPORTED_MEDIA_TYPE: {
    status: 415,
    code: "UNSUPPORTED_MEDIA_TYPE",
    message: "Unsupported encoding",
  },
} as const;

/**
 * JSON parsing error shape from body-parser/express.json()
 */
export type JsonParseError = SyntaxError & {
  type: string;
  status: number;
  statusCode: number;
  body?: string;
};

/**
 * Detect a JSON format error from express.json() middleware
 */
export function isJsonParseError(err: unknown): err is JsonParseError {
  return (
    err instanceof SyntaxError &&
    "type" in err &&
    "status" in err &&
    typeof err.type === "string" &&
    typeof err.status === "number"
  );
}

export type JsonErrorCode = keyof typeof JSON_ERRORS;
