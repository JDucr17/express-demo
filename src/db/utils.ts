import { sql } from "drizzle-orm";
import type { AnyColumn } from "drizzle-orm";

/**
 * Creates an accent-insensitive ILIKE condition using PostgreSQL's unaccent extension.
 */
export function unaccentIlike(column: AnyColumn, pattern: string) {
  return sql`unaccent(${column}) ILIKE unaccent(${pattern})`;
}
