/**
 * Calculation routes for Zi Wei Dou Shu chart data generation
 * 
 * Provides endpoints for:
 * - Basic chart calculation
 * - Life Cycle Decoder data
 * - Wealth Path Decoder data  
 * - Monthly Report data
 * - Chart information for testing
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { calculationService, CalculationRequest } from "@/services/calculationService";
import { logger } from "@/utils/logger";
import { ApiResponse, HTTP_STATUS } from "@/types";

/**
 * Zod schema for calculation request validation
 */
const CalculationRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  year: z.number().int().min(1900, "Year must be at least 1900").max(2100, "Year must be at most 2100"),
  month: z.number().int().min(1, "Month must be at least 1").max(12, "Month must be at most 12"),
  day: z.number().int().min(1, "Day must be at least 1").max(31, "Day must be at most 31"),
  hour: z.number().int().min(0, "Hour must be at least 0").max(23, "Hour must be at most 23"),
  gender: z.enum(["male", "female"]),
});

/**
 * Middleware to validate calculation request body
 */
const validateCalculationRequest = (req: Request, res: Response, next: () => void): void => {
  try {
    const validatedData = CalculationRequestSchema.parse(req.body);
    req.body = validatedData; // Replace with validated data
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => `${err.path.join(".")}: ${err.message}`);
      
      const response: ApiResponse<null> = {
        success: false,
        message: "Validation failed",
        data: null,
        timestamp: new Date().toISOString(),
      };

      logger.warn("Calculation request validation failed", { 
        errors: errorMessages,
        body: req.body,
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      return;
    }

    // Handle unexpected validation errors
    const response: ApiResponse<null> = {
      success: false,
      message: "Invalid request format",
      timestamp: new Date().toISOString(),
    };

    logger.error("Unexpected validation error", { error, body: req.body });
    res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }
};

/**
 * Create calculation router
 */
export function createCalculationRouter(): Router {
  const router = Router();

  /**
   * POST /calculate
   * Calculate complete chart data
   */
  router.post("/calculate", validateCalculationRequest, async (req: Request, res: Response): Promise<void> => {
    try {
      const calculationRequest: CalculationRequest = req.body;
      
      logger.info("Chart calculation request received", { 
        name: calculationRequest.name,
        birthDate: `${calculationRequest.year}-${calculationRequest.month}-${calculationRequest.day}`,
        hour: calculationRequest.hour,
        gender: calculationRequest.gender,
      });

      const result = await calculationService.calculateChart(calculationRequest);

      if (result.success && result.data) {
        const response: ApiResponse<typeof result.data> = {
          success: true,
          message: "Chart calculation completed successfully",
          data: result.data,
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          message: result.error || "Chart calculation failed",
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }

    } catch (error) {
      logger.error("Chart calculation endpoint error", { 
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
      });

      const response: ApiResponse<null> = {
        success: false,
        message: "Internal server error during calculation",
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
    }
  });

  /**
   * POST /lifecycle-decoder
   * Get chart data specifically formatted for Life Cycle Decoder PDF
   */
  router.post("/lifecycle-decoder", validateCalculationRequest, async (req: Request, res: Response): Promise<void> => {
    try {
      const calculationRequest: CalculationRequest = req.body;
      
      logger.info("Life Cycle Decoder request received", { 
        name: calculationRequest.name,
      });

      const result = await calculationService.getLifeCycleDecoderData(calculationRequest);

      if (result.success && result.data) {
        const response: ApiResponse<typeof result.data> = {
          success: true,
          message: "Life Cycle Decoder data generated successfully",
          data: result.data,
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          message: result.error || "Life Cycle Decoder data generation failed",
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }

    } catch (error) {
      logger.error("Life Cycle Decoder endpoint error", { 
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
      });

      const response: ApiResponse<null> = {
        success: false,
        message: "Internal server error during Life Cycle Decoder data generation",
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
    }
  });

  /**
   * POST /wealth-path-decoder
   * Get chart data specifically formatted for Wealth Path Decoder PDF
   */
  router.post("/wealth-path-decoder", validateCalculationRequest, async (req: Request, res: Response): Promise<void> => {
    try {
      const calculationRequest: CalculationRequest = req.body;
      
      logger.info("Wealth Path Decoder request received", { 
        name: calculationRequest.name,
      });

      const result = await calculationService.getWealthPathDecoderData(calculationRequest);

      if (result.success && result.data) {
        const response: ApiResponse<typeof result.data> = {
          success: true,
          message: "Wealth Path Decoder data generated successfully",
          data: result.data,
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          message: result.error || "Wealth Path Decoder data generation failed",
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }

    } catch (error) {
      logger.error("Wealth Path Decoder endpoint error", { 
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
      });

      const response: ApiResponse<null> = {
        success: false,
        message: "Internal server error during Wealth Path Decoder data generation",
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
    }
  });

  /**
   * POST /monthly-report
   * Get chart data specifically formatted for Monthly Report PDF
   */
  router.post("/monthly-report", validateCalculationRequest, async (req: Request, res: Response): Promise<void> => {
    try {
      const calculationRequest: CalculationRequest = req.body;
      
      logger.info("Monthly Report request received", { 
        name: calculationRequest.name,
      });

      const result = await calculationService.getMonthlyReportData(calculationRequest);

      if (result.success && result.data) {
        const response: ApiResponse<typeof result.data> = {
          success: true,
          message: "Monthly Report data generated successfully",
          data: result.data,
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          message: result.error || "Monthly Report data generation failed",
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }

    } catch (error) {
      logger.error("Monthly Report endpoint error", { 
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
      });

      const response: ApiResponse<null> = {
        success: false,
        message: "Internal server error during Monthly Report data generation",
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
    }
  });

  /**
   * POST /info
   * Get basic chart information for testing/debugging
   */
  router.post("/info", validateCalculationRequest, async (req: Request, res: Response): Promise<void> => {
    try {
      const calculationRequest: CalculationRequest = req.body;
      
      logger.info("Chart info request received", { 
        name: calculationRequest.name,
      });

      const result = await calculationService.getChartInfo(calculationRequest);

      if (result.success && result.data) {
        const response: ApiResponse<typeof result.data> = {
          success: true,
          message: "Chart information retrieved successfully",
          data: result.data,
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse<null> = {
          success: false,
          message: result.error || "Failed to retrieve chart information",
          timestamp: result.timestamp,
        };

        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }

    } catch (error) {
      logger.error("Chart info endpoint error", { 
        error: error instanceof Error ? error.message : "Unknown error",
        body: req.body,
      });

      const response: ApiResponse<null> = {
        success: false,
        message: "Internal server error during chart information retrieval",
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
    }
  });

  /**
   * GET /
   * Get information about available calculation endpoints
   */
  router.get("/", (_req: Request, res: Response): void => {
    const response: ApiResponse<{
      message: string;
      availableEndpoints: Array<{
        method: string;
        path: string;
        description: string;
        requiredFields: string[];
      }>;
    }> = {
      success: true,
      message: "Calculation API endpoints",
      data: {
        message: "Available calculation endpoints for Zi Wei Dou Shu chart generation",
        availableEndpoints: [
          {
            method: "POST",
            path: "/calculate",
            description: "Calculate complete chart data",
            requiredFields: ["name", "year", "month", "day", "hour", "gender"],
          },
          {
            method: "POST",
            path: "/lifecycle-decoder",
            description: "Get chart data for Life Cycle Decoder PDF",
            requiredFields: ["name", "year", "month", "day", "hour", "gender"],
          },
          {
            method: "POST",
            path: "/wealth-path-decoder",
            description: "Get chart data for Wealth Path Decoder PDF",
            requiredFields: ["name", "year", "month", "day", "hour", "gender"],
          },
          {
            method: "POST",
            path: "/monthly-report",
            description: "Get chart data for Monthly Report PDF",
            requiredFields: ["name", "year", "month", "day", "hour", "gender"],
          },
          {
            method: "POST",
            path: "/info",
            description: "Get basic chart information for testing",
            requiredFields: ["name", "year", "month", "day", "hour", "gender"],
          },
        ],
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(response);
  });

  return router;
}

export default createCalculationRouter();