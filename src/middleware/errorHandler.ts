/**
 * Error handling middleware for the nm-zwds-server application
 * 
 * Provides centralized error handling with proper logging and response formatting.
 * Following strict TypeScript guidelines with comprehensive error checking.
 */

import { Request, Response, NextFunction } from "express";
import { ErrorResponse, HTTP_STATUS } from "@/types";
import { logger } from "@/utils/logger";
import { config } from "@/config/environment";

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  /**
   * Create a new application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether this is an operational error
   */
  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {string} error - Error details
 * @param {number} statusCode - HTTP status code
 * @returns {ErrorResponse} Formatted error response
 */
function createErrorResponse(message: string, error: string, statusCode: number): ErrorResponse {
  return {
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
    statusCode,
  };
}

/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response has already been sent, delegate to default Express error handler
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorDetails = err.message;

  // Handle different error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    // Log operational errors as warnings, programming errors as errors
    if (err.isOperational) {
      logger.warn("Operational error occurred", {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
        url: req.url,
        method: req.method,
      });
    } else {
      logger.error("Programming error occurred", {
        message: err.message,
        statusCode: err.statusCode,
        stack: err.stack,
        url: req.url,
        method: req.method,
      });
    }
  } else {
    // Unknown error - log with full details
    logger.error("Unhandled error occurred", {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
    });
  }

  // In production, don't expose error details to client
  if (config.NODE_ENV === "production" && statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    errorDetails = "Something went wrong!";
  }

  const errorResponse = createErrorResponse(message, errorDetails, statusCode);
  
  res.status(statusCode).json(errorResponse);
}

/**
 * Handle 404 Not Found errors
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    HTTP_STATUS.NOT_FOUND
  );
  
  next(error);
}

/**
 * Async error wrapper to catch errors in async route handlers
 * @template T - The type of the route handler function
 * @param {T} fn - The async route handler function
 * @returns {Function} Wrapped function that catches errors
 */
export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<void>>(
  fn: T
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}