/**
 * Core type definitions for the nm-zwds-server application
 * 
 * This file contains all shared type definitions used throughout the application.
 * Following strict TypeScript guidelines with no 'any' types or non-null assertions.
 */

/**
 * Standard API response structure
 * @template T - The type of data being returned
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;
  readonly timestamp: string;
}

/**
 * Error response structure for API endpoints
 */
export interface ErrorResponse {
  readonly success: false;
  readonly message: string;
  readonly error: string;
  readonly timestamp: string;
  readonly statusCode: number;
}

/**
 * Health check response structure
 */
export interface HealthCheckResponse {
  readonly status: "healthy" | "unhealthy";
  readonly uptime: number;
  readonly timestamp: string;
  readonly version: string;
}

/**
 * Email configuration type for Gmail API with service account
 */
export interface EmailConfig {
  readonly from: string;
  readonly fromName: string;
  readonly serviceAccountPath: string;
  readonly delegateEmail: string;
}

/**
 * Environment configuration type
 */
export interface EnvironmentConfig {
  readonly PORT: number;
  readonly NODE_ENV: "development" | "production" | "test";
  readonly API_VERSION: string;
  readonly EMAIL: EmailConfig;
}

/**
 * Custom Express Request with typed body
 * @template T - The expected type of the request body
 */
export interface TypedRequest<T = unknown> extends Express.Request {
  body: T;
}

/**
 * Standard HTTP status codes used in the application
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Lifecycle decoder request body structure
 */
export interface LifecycleDecoderRequest {
  readonly name: string;
  readonly email: string;
  readonly birthday: string; // ISO date string (YYYY-MM-DD)
  readonly birthTime: string; // HH:MM format
  readonly gender: "male" | "female" | "other";
}

/**
 * PDF generation result
 */
export interface PdfGenerationResult {
  readonly buffer: Buffer;
  readonly filename: string;
  readonly mimeType: string;
}

/**
 * Email sending result
 */
export interface EmailSendResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
}