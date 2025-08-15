/**
 * Environment configuration for the nm-zwds-server application
 * 
 * Centralizes all environment variable handling with type safety and validation.
 * Following strict TypeScript guidelines with proper error checking.
 */

import { config as loadEnv } from "dotenv";
import path from "path";
import { EnvironmentConfig } from "@/types";
import { logger } from "@/utils/logger";

// Load environment variables from .env file with explicit path
const envPath = path.resolve(process.cwd(), ".env");
const envResult = loadEnv({ path: envPath });

if (envResult.error) {
  console.error("Failed to load .env file:", envResult.error);
}

/**
 * Safely converts a string to a number with validation
 * @param {string} value - String value to convert
 * @param {string} key - Environment variable key for error messages
 * @returns {number} The converted number
 * @throws {Error} If conversion fails or number is invalid
 */
function parseNumberEnvVar(value: string, key: string): number {
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${key} must be a positive number, got: ${value}`);
  }
  
  return parsed;
}

/**
 * Validates NODE_ENV value
 * @param {string | undefined} env - NODE_ENV value
 * @returns {EnvironmentConfig["NODE_ENV"]} Validated environment
 */
function validateNodeEnv(env: string | undefined): EnvironmentConfig["NODE_ENV"] {
  const validEnvs: EnvironmentConfig["NODE_ENV"][] = ["development", "production", "test"];
  const nodeEnv = (env || "development") as EnvironmentConfig["NODE_ENV"];
  
  if (!validEnvs.includes(nodeEnv)) {
    logger.warn(`Invalid NODE_ENV value: ${env}, defaulting to development`);
    return "development";
  }
  
  return nodeEnv;
}

/**
 * Load and validate environment configuration
 * @returns {EnvironmentConfig} Validated configuration object
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  try {
    const portValue = process.env.PORT || "3000";
    const apiVersion = process.env.API_VERSION || "v1";

    return {
      PORT: parseNumberEnvVar(portValue, "PORT"),
      NODE_ENV: validateNodeEnv(process.env.NODE_ENV),
      API_VERSION: apiVersion.trim(),
      FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
      SUPABASE: {
        url: process.env.SUPABASE_URL || "",
        key: process.env.SUPABASE_KEY || "",
        bucket: process.env.SUPABASE_BUCKET || "Low Ticket Funnel PDF",
      },
    };
  } catch (error) {
    logger.error("Failed to load environment configuration", error);
    throw error;
  }
}

/**
 * Exported environment configuration
 */
export const config: EnvironmentConfig = loadEnvironmentConfig();

/**
 * Log current configuration (excluding sensitive data)
 */
logger.info("Environment configuration loaded", {
  PORT: config.PORT,
  NODE_ENV: config.NODE_ENV,
  API_VERSION: config.API_VERSION,
  FRONTEND_URL: config.FRONTEND_URL,
});