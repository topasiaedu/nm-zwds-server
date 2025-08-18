/**
 * PDF Service facade
 *
 * Thin wrapper that delegates to specialized generator classes under src/services/pdf/
 * No logic changes from the previous implementation; only code organization.
 */

import { logger } from "@/utils/logger";
import { PdfGenerationResult, LifecycleDecoderRequest } from "@/types";
import { LifecycleDecoderPdfGenerator } from "./pdf/lifecycle";
import { WealthDecoderPdfGenerator } from "./pdf/wealth";
import { CareerTimingWindowPdfGenerator } from "./pdf/career";

class PdfService {
  /**
   * Generate a lifecycle decoder PDF
   */
  async generateLifecycleDecoderPdf(
    data: LifecycleDecoderRequest,
    frontendUrl: string
  ): Promise<PdfGenerationResult> {
    try {
      logger.info("Generating lifecycle decoder PDF", {
        name: data.name,
        email: data.email,
        frontendUrl,
      });

      const generator = new LifecycleDecoderPdfGenerator(data, frontendUrl);
      const result = await generator.generate();

      logger.info("Lifecycle decoder PDF generated successfully", {
        filename: result.filename,
        bufferSize: result.buffer.length,
      });

      return result;
    } catch (error) {
      logger.error("Failed to generate lifecycle decoder PDF", error);
      throw error;
    }
  }

  /**
   * Generate a wealth decoder PDF
   */
  async generateWealthDecoderPdf(
    data: LifecycleDecoderRequest,
    frontendUrl: string
  ): Promise<PdfGenerationResult> {
    try {
      logger.info("Generating wealth decoder PDF", {
        name: data.name,
        email: data.email,
        frontendUrl,
      });

      const generator = new WealthDecoderPdfGenerator(data, frontendUrl);
      const result = await generator.generate();

      logger.info("Wealth decoder PDF generated successfully", {
        filename: result.filename,
        bufferSize: result.buffer.length,
      });

      return result;
    } catch (error) {
      logger.error("Failed to generate wealth decoder PDF", error);
      throw error;
    }
  }

  /**
   * Generate a career timing window PDF
   */
  async generateCareerTimingWindowPdf(
    data: LifecycleDecoderRequest,
    frontendUrl: string
  ): Promise<PdfGenerationResult> {
    try {
      logger.info("Generating career timing window PDF", {
        name: data.name,
        email: data.email,
        frontendUrl,
      });

      const generator = new CareerTimingWindowPdfGenerator(data, frontendUrl);
      const result = await generator.generate();

      logger.info("Career timing window PDF generated successfully", {
        filename: result.filename,
        bufferSize: result.buffer.length,
      });

      return result;
    } catch (error) {
      logger.error("Failed to generate career timing window PDF", error);
      throw error;
    }
  }
}

export const pdfService = new PdfService();



