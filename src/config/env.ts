import "dotenv/config";

/**
 * Interface describing database connection settings.
 */
export interface DatabaseConfig {
  mongoUri: string;
}

/**
 * Interface describing JWT authentication session settings.
 */
export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

/**
 * Interface describing one-time password (OTP) delivery and rate-limit rules.
 */
export interface OtpConfig {
  secret: string;
  expiryMinutes: number;
  cooldownSeconds: number;
  maxAttempts: number;
}

/**
 * Interface describing transactional email service settings (Resend API).
 */
export interface EmailConfig {
  resendApiKey: string;
  from: string;
}

/**
 * Interface describing Google OAuth 2.0 credentials and redirection callback.
 */
export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

/**
 * Interface describing file upload size and handling boundaries.
 */
export interface UploadsConfig {
  maxFileSizeBytes: number;
}

/**
 * Root application configuration shape.
 */
export interface AppConfig {
  env: string;
  port: number;
  database: DatabaseConfig;
  jwt: JwtConfig;
  otp: OtpConfig;
  email: EmailConfig;
  googleAuth: GoogleAuthConfig;
  uploads: UploadsConfig;
}

/**
 * Centralized environment configuration.
 * Exposes strongly typed and defaulted configuration properties
 * across database, authentication, external services, and runtime.
 */
export const config: AppConfig = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000", 10),

  database: {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/begin_db",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "default_jwt_secret_dev_only",
    expiresIn: "7d",
  },

  otp: {
    secret: process.env.OTP_SECRET || "default_otp_secret_dev_only",
    expiryMinutes: 5,
    cooldownSeconds: 60,
    maxAttempts: 5,
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY || "re_dummy_dev_key",
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  },

  googleAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/auth/google/callback",
  },

  uploads: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
  },
};

export default config;
