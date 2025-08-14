/**
 * PDF Generation API routes
 * 
 * Handles all PDF generation requests and sends them via email
 * Following the established patterns and strict TypeScript guidelines
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { 
  validateLifecycleDecoderRequest, 
  formatValidationErrors 
} from "@/validators/lifecycleDecoderValidator";
import { pdfService } from "@/services/pdfService";
import { uploadPdfToSupabase } from "@/services/storageService";
// import { emailService } from "@/services/emailService";
import { logger } from "@/utils/logger";
import { ApiResponse, HTTP_STATUS, TypedRequest, LifecycleDecoderRequest } from "@/types";
import { config } from "@/config/environment";
import fs from "fs";
import path from "path";

const router = Router();

/**
 * Async wrapper to handle errors in async route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Save PDF to appropriate folder based on environment
 * @param {Buffer} buffer - PDF buffer
 * @param {string} filename - PDF filename
 * @returns {string} File path where PDF was saved
 */
function savePdfToFolder(buffer: Buffer, filename: string): string {
  const isDevelopment = config.NODE_ENV === "development";
  const folderPath = isDevelopment ? "temp" : "pdfs";
  
  // Create folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  const filePath = path.join(folderPath, filename);
  fs.writeFileSync(filePath, buffer);
  
  logger.info("PDF saved to folder", { 
    filePath, 
    environment: config.NODE_ENV,
    size: buffer.length 
  });
  
  return filePath;
}

/**
 * POST /lifecycle-decoder
 * Generate and email a lifecycle decoder PDF report
 */
router.post("/lifecycle-decoder", asyncHandler(async (
  req: TypedRequest<LifecycleDecoderRequest>, 
  res: Response<ApiResponse<{ url?: string }>>
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = validateLifecycleDecoderRequest(req.body);

    logger.info("Processing lifecycle decoder request", {
      name: validatedData.name,
      email: validatedData.email,
      requestId: (req as Request).headers["x-request-id"] || "unknown",
    });

    // Generate PDF with frontend URL for chart screenshot
    const pdfResult = await pdfService.generateLifecycleDecoderPdf(
      validatedData,
      config.FRONTEND_URL
    );

    // Save locally for dev visibility
    savePdfToFolder(pdfResult.buffer, pdfResult.filename);

    // Upload to Supabase and return the link
    const uploaded = await uploadPdfToSupabase({
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
      category: "lifecycle",
      userName: validatedData.name,
    });

    // TODO: Uncomment when email service is ready
    // // Send email with PDF attachment
    // const emailResult = await emailService.sendLifecycleDecoderPdf(
    //   validatedData.email,
    //   validatedData.name,
    //   pdfResult.buffer,
    //   pdfResult.filename
    // );

    // if (!emailResult.success) {
    //   logger.error("Failed to send email", {
    //     email: validatedData.email,
    //     error: emailResult.error,
    //   });

    //   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    //     success: false,
    //     message: "Failed to send email with PDF report",
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    logger.info("Lifecycle decoder request completed successfully", {
      name: validatedData.name,
      email: validatedData.email,
      pdfSize: pdfResult.buffer.length,
      storagePath: uploaded.path,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Lifecycle decoder report has been generated and uploaded`,
      data: { url: uploaded.url },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = formatValidationErrors(error);
      
      logger.warn("Validation failed for lifecycle decoder request", {
        errors: validationErrors,
        body: req.body,
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        data: {
          errors: validationErrors,
        } as any,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error("Unexpected error in lifecycle decoder endpoint", error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing your request",
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * POST /wealth-decoder
 * Generate and email a wealth decoder PDF report
 */
router.post("/wealth-decoder", asyncHandler(async (
  req: TypedRequest<LifecycleDecoderRequest>, 
  res: Response<ApiResponse<{ url?: string }>>
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = validateLifecycleDecoderRequest(req.body);

    logger.info("Processing wealth decoder request", {
      name: validatedData.name,
      email: validatedData.email,
      requestId: (req as Request).headers["x-request-id"] || "unknown",
    });

    // Generate PDF with frontend URL for chart screenshot
    const pdfResult = await pdfService.generateWealthDecoderPdf(
      validatedData,
      config.FRONTEND_URL
    );

    // Save locally for dev visibility
    savePdfToFolder(pdfResult.buffer, pdfResult.filename);

    // Upload to Supabase and return the link
    const uploaded = await uploadPdfToSupabase({
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
      category: "wealth",
      userName: validatedData.name,
    });

    // if (!emailResult.success) {
    //   logger.error("Failed to send email", {
    //     email: validatedData.email,
    //     error: emailResult.error,
    //   });

    //   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    //     success: false,
    //     message: "Failed to send email with PDF report",
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    logger.info("Wealth decoder request completed successfully", {
      name: validatedData.name,
      email: validatedData.email,
      pdfSize: pdfResult.buffer.length,
      storagePath: uploaded.path,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Wealth decoder report has been generated and uploaded`,
      data: { url: uploaded.url },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = formatValidationErrors(error);
      
      logger.warn("Validation failed for wealth decoder request", {
        errors: validationErrors,
        body: req.body,
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        data: {
          errors: validationErrors,
        } as any,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error("Unexpected error in wealth decoder endpoint", error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing your request",
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * POST /career-timing-window
 * Generate and email a career timing window PDF report
 */
router.post("/career-timing-window", asyncHandler(async (
  req: TypedRequest<LifecycleDecoderRequest>, 
  res: Response<ApiResponse<{ url?: string }>>
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = validateLifecycleDecoderRequest(req.body);

    logger.info("Processing career timing window request", {
      name: validatedData.name,
      email: validatedData.email,
      requestId: (req as Request).headers["x-request-id"] || "unknown",
    });

    // Generate PDF with frontend URL for chart screenshot
    const pdfResult = await pdfService.generateCareerTimingWindowPdf(
      validatedData,
      config.FRONTEND_URL
    );

    // Save locally for dev visibility
    savePdfToFolder(pdfResult.buffer, pdfResult.filename);

    // Upload to Supabase and return the link
    const uploaded = await uploadPdfToSupabase({
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
      category: "career",
      userName: validatedData.name,
    });

    // if (!emailResult.success) {
    //   logger.error("Failed to send email", {
    //     email: validatedData.email,
    //     error: emailResult.error,
    //   });

    //   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    //     success: false,
    //     message: "Failed to send email with PDF report",
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    logger.info("Career timing window request completed successfully", {
      name: validatedData.name,
      email: validatedData.email,
      pdfSize: pdfResult.buffer.length,
      storagePath: uploaded.path,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Career timing window report has been generated and uploaded`,
      data: { url: uploaded.url },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = formatValidationErrors(error);
      
      logger.warn("Validation failed for career timing window request", {
        errors: validationErrors,
        body: req.body,
      });

      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        data: {
          errors: validationErrors,
        } as any,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    logger.error("Unexpected error in career timing window endpoint", error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing your request",
      timestamp: new Date().toISOString(),
    });
  }
}));

/**
 * POST /health
 * Health check endpoint
 */
router.post("/health", (_req: Request, res: Response<ApiResponse>): void => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Server is healthy",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /test
 * Test endpoint for PDF generation
 */
router.post("/test", asyncHandler(async (
  req: Request, 
  res: Response<ApiResponse<{ url?: string }>>
): Promise<void> => {
  try {
    const { pdfType = "lifecycle-decoder" } = req.body;

    // Use predefined test data
    const testData: LifecycleDecoderRequest = {
      name: "Stanley Test User",
      email: "stanley121499@gmail.com",
      birthday: "1990-05-15",
      birthTime: "17",
      gender: "male",
    };

    logger.info("Processing test PDF request", {
      pdfType,
      testEmail: testData.email,
      requestId: req.headers["x-request-id"] || "unknown",
    });

    // Generate PDF based on type
    let pdfResult;
    switch (pdfType) {
      case "wealth-decoder":
        pdfResult = await pdfService.generateWealthDecoderPdf(
          testData,
          config.FRONTEND_URL
        );
        break;
      case "career-timing-window":
        pdfResult = await pdfService.generateCareerTimingWindowPdf(
          testData,
          config.FRONTEND_URL
        );
        break;
      case "lifecycle-decoder":
      default:
        pdfResult = await pdfService.generateLifecycleDecoderPdf(
          testData,
          config.FRONTEND_URL
        );
        break;
    }

    // Save locally for dev visibility
    savePdfToFolder(pdfResult.buffer, pdfResult.filename);

    // Map type to category
    const category = pdfType === "wealth-decoder" ? "wealth" : pdfType === "career-timing-window" ? "career" : "lifecycle";
    const uploaded = await uploadPdfToSupabase({
      buffer: pdfResult.buffer,
      filename: pdfResult.filename,
      category,
      userName: testData.name,
    });

    // TODO: Uncomment when email service is ready
    // // Send email with PDF attachment
    // const emailResult = await emailService.sendLifecycleDecoderPdf(
    //   testData.email,
    //   testData.name,
    //   pdfResult.buffer,
    //   pdfResult.filename
    // );

    // if (!emailResult.success) {
    //   logger.error("Failed to send test email", {
    //     error: emailResult.error,
    //   });

    //   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    //     success: false,
    //     message: "Failed to send test email with PDF report",
    //     timestamp: new Date().toISOString(),
    //   });
    //   return;
    // }

    logger.info("Test PDF request completed successfully", {
      pdfType,
      pdfSize: pdfResult.buffer.length,
      storagePath: uploaded.path,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Test ${pdfType} report has been generated and uploaded`,
      data: { url: uploaded.url },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error("Unexpected error in test endpoint", error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An unexpected error occurred while processing the test request",
      timestamp: new Date().toISOString(),
    });
  }
}));

export default router; 