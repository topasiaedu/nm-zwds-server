/**
 * Health check routes for the nm-zwds-server application
 * 
 * Provides endpoints for monitoring server health and status.
 * Following strict TypeScript guidelines with comprehensive error checking.
 */

import { Router, Request, Response } from "express";
import { ApiResponse, HealthCheckResponse, HTTP_STATUS } from "@/types";
import { asyncHandler } from "@/middleware/errorHandler";
import { config } from "@/config/environment";

/**
 * Create health router with all health-related endpoints
 * @returns {Router} Configured Express router
 */
export function createHealthRouter(): Router {
  const router = Router();

  /**
   * GET /health - Basic health check endpoint
   * Returns server health status and basic information
   */
  router.get("/", asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const healthData: HealthCheckResponse = {
      status: "healthy",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: config.API_VERSION,
    };

    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      message: "Server is healthy",
      data: healthData,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  }));

  /**
   * GET /health/detailed - Detailed health check endpoint
   * Returns comprehensive server information
   */
  router.get("/detailed", asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const memoryUsage = process.memoryUsage();
    
    const detailedHealthData = {
      status: "healthy" as const,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: config.API_VERSION,
      environment: config.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      pid: process.pid,
    };

    const response: ApiResponse<typeof detailedHealthData> = {
      success: true,
      message: "Detailed server health information",
      data: detailedHealthData,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  }));

  return router;
}