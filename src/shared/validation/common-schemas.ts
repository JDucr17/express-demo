import { z } from "zod";

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(10),
});

export const IdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Type exports
export type PaginationSchema = z.infer<typeof PaginationSchema>;
export type IdSchema = z.infer<typeof IdSchema>;

/**
 * Escapes SQL LIKE operator wildcards in user input
 *
 * PostgreSQL LIKE operator only has 2 wildcards:
 * - % (percent) = matches zero or more characters
 * - _ (underscore) = matches single character
 *
 * Default escape character is backslash (\)
 */
export function escapeSqlLikeWildcards(input: string): string {
  return input
    .replaceAll("\\", String.raw`\\`)
    .replaceAll("%", String.raw`\%`)
    .replaceAll("_", String.raw`\_`);
}
export function createSearchSchema(maxLength = 100) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((val) => (val ? escapeSqlLikeWildcards(val) : val));
}
