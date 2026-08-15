import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";

mkdirSync("./data", { recursive: true });

export const auth = betterAuth({
  database: new Database("./data/auth.db"),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "local-development-secret-change-before-deploying-1234567890",
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
      facilityId: {
        type: "string",
        required: false,
      },
    },
  },
});
