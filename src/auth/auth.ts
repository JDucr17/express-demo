import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/config.js';
import type { BetterAuthOptions } from 'better-auth';
import { config } from '../config/index.js';
import * as schema from '../db/schema/auth.js';

const userConfig: BetterAuthOptions['user'] = {
  additionalFields: {
    firstName: { type: 'string', required: true },
    lastName: { type: 'string', required: true },
  },
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  user: userConfig,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minute session cache
    },
  },
  telemetry: { enabled: false },
  trustedOrigins: [config.clientUrl],
});
