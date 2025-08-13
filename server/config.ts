import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Export environment variables for use throughout the application
export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
