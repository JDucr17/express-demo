/**
 * API routing constants
 *
 * These constants define the base path and version prefixes for the API.
 * Used for versioning the API routes in a composable way.
 */

export const API_BASE = "/api";

export const API_VERSIONS = {
  V1: "/v1",
  V2: "/v2",
} as const;
