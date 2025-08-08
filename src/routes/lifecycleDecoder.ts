/**
 * Lifecycle Decoder API routes
 * 
 * Handles lifecycle decoder requests, generates PDFs, and sends them via email
 * Following the established patterns and strict TypeScript guidelines
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { 
  validateLifecycleDecoderRequest, 
  formatValidationErrors 
} from "@/validators/lifecycleDecoderValidator";
import { pdfService } from "@/services/pdfService";
import { emailService } from "@/services/emailService";
import { logger } from "@/utils/logger";
import { ApiResponse, HTTP_STATUS, TypedRequest, LifecycleDecoderRequest } from "@/types";

const router = Router();

/**
 * Async wrapper to handle errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: Function) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * POST /lifecycle-decoder
 * Generate and email a lifecycle decoder PDF report
 */
router.post("/lifecycle-decoder", asyncHandler(async (
  req: TypedRequest<LifecycleDecoderRequest>, 
  res: Response<ApiResponse<{ messageId?: string }>>
) => {
  try {
    // Validate request body
    const validatedData = validateLifecycleDecoderRequest(req.body);

    logger.info("Processing lifecycle decoder request", {
      name: validatedData.name,
      email: validatedData.email,
      requestId: req.headers["x-request-id"] || "unknown",
    });

    // Generate PDF
    const pdfResult = await pdfService.generateLifecycleDecoderPdf(validatedData);

    // Send email with PDF attachment
    const emailResult = await emailService.sendLifecycleDecoderPdf(
      validatedData.email,
      validatedData.name,
      pdfResult.buffer,
      pdfResult.filename
    );

    if (!emailResult.success) {
      logger.error("Failed to send email", {
        email: validatedData.email,
        error: emailResult.error,
      });

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to send email with PDF report",
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Lifecycle decoder request completed successfully", {
      name: validatedData.name,
      email: validatedData.email,
      messageId: emailResult.messageId,
      pdfSize: pdfResult.buffer.length,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Lifecycle decoder report has been generated and sent to ${validatedData.email}`,
      data: {
        messageId: emailResult.messageId,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = formatValidationErrors(error);
      
      logger.warn("Validation failed for lifecycle decoder request", {
        errors: validationErrors,
        body: req.body,
      });

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        data: {
          errors: validationErrors,
        },
        timestamp: new Date().toISOString(),
      });
    }

    logger.error("Unexpected error in lifecycle decoder endpoint", error);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing your request",
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * POST /lifecycle-decoder/test
 * Test endpoint for easy testing - sends to predefined email
 */
router.post("/lifecycle-decoder/test", asyncHandler(async (
  req: Request, 
  res: Response<ApiResponse<{ messageId?: string }>>
) => {
  try {
    // Use predefined test data
    const testData: LifecycleDecoderRequest = {
      name: "Stanley Test User",
      email: "stanley121499@gmail.com",
      birthday: "1990-05-15",
      birthTime: "14:30",
      gender: "male",
    };

    logger.info("Processing test lifecycle decoder request", {
      testEmail: testData.email,
      requestId: req.headers["x-request-id"] || "unknown",
    });

    // Generate PDF
    const pdfResult = await pdfService.generateLifecycleDecoderPdf(testData);

    // Send email with PDF attachment
    const emailResult = await emailService.sendLifecycleDecoderPdf(
      testData.email,
      testData.name,
      pdfResult.buffer,
      pdfResult.filename
    );

    if (!emailResult.success) {
      logger.error("Failed to send test email", {
        error: emailResult.error,
      });

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to send test email with PDF report",
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Test lifecycle decoder request completed successfully", {
      messageId: emailResult.messageId,
      pdfSize: pdfResult.buffer.length,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Test lifecycle decoder report has been sent to ${testData.email}`,
      data: {
        messageId: emailResult.messageId,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error("Unexpected error in test lifecycle decoder endpoint", error);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing the test request",
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * GET /lifecycle-decoder/info
 * Get information about the lifecycle decoder endpoint
 */
router.get("/lifecycle-decoder/info", (req: Request, res: Response<ApiResponse>) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Lifecycle Decoder API Information",
    data: {
      endpoints: {
        "POST /lifecycle-decoder": {
          description: "Generate and email a lifecycle decoder PDF report",
          requiredFields: ["name", "email", "birthday", "birthTime", "gender"],
          fieldFormats: {
            name: "String (1-100 characters)",
            email: "Valid email address",
            birthday: "Date in YYYY-MM-DD format",
            birthTime: "Time in HH:MM format (24-hour)",
            gender: "One of: male, female, other",
          },
        },
        "POST /lifecycle-decoder/test": {
          description: "Test endpoint that sends a sample report to stanley121499@gmail.com",
          requiredFields: [],
        },
        "GET /lifecycle-decoder/info": {
          description: "Get information about available endpoints",
          requiredFields: [],
        },
      },
      emailSettings: {
        sender: "CAE - Top Asia Education",
        senderEmail: "askcae@topasiaedu.com",
      },
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;