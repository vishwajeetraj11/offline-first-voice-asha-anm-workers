import { betterAuth } from "better-auth";
import { postgres } from "@/lib/server/postgres";

export const auth = betterAuth({
  database: postgres,
  baseURL: process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000",
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
