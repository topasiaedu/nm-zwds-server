/**
 * Calculation service for Zi Wei Dou Shu chart calculations
 * 
 * Handles the business logic for generating chart data using the calculator
 * and preparing it for different report types (Life Cycle Decoder, Wealth Path Decoder, Monthly Report)
 */

import { ZWDSCalculator } from "@/calculation/calculator";
import { ChartInput, ChartData } from "@/calculation/types";
import { logger } from "@/utils/logger";

/**
 * Input validation for chart calculation requests
 */
export interface CalculationRequest {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: "male" | "female";
}

/**
 * Response structure for chart calculations
 */
export interface CalculationResponse {
  success: boolean;
  data?: ChartData;
  error?: string;
  timestamp: string;
}

/**
 * Main calculation service class
 */
export class CalculationService {
  
  /**
   * Validate input data for chart calculation
   */
  private validateInput(input: CalculationRequest): string[] {
    const errors: string[] = [];

    // Validate name
    if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
      errors.push("Name is required and must be a non-empty string");
    }

    // Validate year (reasonable range for calculations)
    if (!input.year || typeof input.year !== "number" || input.year < 1900 || input.year > 2100) {
      errors.push("Year must be a number between 1900 and 2100");
    }

    // Validate month
    if (!input.month || typeof input.month !== "number" || input.month < 1 || input.month > 12) {
      errors.push("Month must be a number between 1 and 12");
    }

    // Validate day
    if (!input.day || typeof input.day !== "number" || input.day < 1 || input.day > 31) {
      errors.push("Day must be a number between 1 and 31");
    }

    // Validate hour
    if (typeof input.hour !== "number" || input.hour < 0 || input.hour > 23) {
      errors.push("Hour must be a number between 0 and 23");
    }

    // Validate gender
    if (!input.gender || (input.gender !== "male" && input.gender !== "female")) {
      errors.push("Gender must be either 'male' or 'female'");
    }

    return errors;
  }

  /**
   * Calculate chart data from input parameters
   */
  public async calculateChart(request: CalculationRequest): Promise<CalculationResponse> {
    const startTime = Date.now();
    
    try {
      // Validate input
      const validationErrors = this.validateInput(request);
      if (validationErrors.length > 0) {
        logger.warn("Chart calculation validation failed", { 
          errors: validationErrors,
          input: request 
        });
        
        return {
          success: false,
          error: `Validation failed: ${validationErrors.join(", ")}`,
          timestamp: new Date().toISOString(),
        };
      }

      // Prepare chart input
      const chartInput: ChartInput = {
        name: request.name.trim(),
        year: request.year,
        month: request.month,
        day: request.day,
        hour: request.hour,
        gender: request.gender,
      };

      logger.info("Starting chart calculation", { input: chartInput });

      // Perform calculation
      const calculator = new ZWDSCalculator(chartInput);
      const chartData = calculator.calculate();

      const calculationTime = Date.now() - startTime;
      
      logger.info("Chart calculation completed successfully", { 
        calculationTime: `${calculationTime}ms`,
        mainStar: chartData.mainStar,
        fiveElements: chartData.fiveElements,
        lifePalace: chartData.lifePalace,
      });

      return {
        success: true,
        data: chartData,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      const calculationTime = Date.now() - startTime;
      
      logger.error("Chart calculation failed", { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        input: request,
        calculationTime: `${calculationTime}ms`,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during calculation",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get chart data for Life Cycle Decoder report
   * This method prepares the chart data specifically for Life Cycle Decoder PDF generation
   */
  public async getLifeCycleDecoderData(request: CalculationRequest): Promise<CalculationResponse> {
    const response = await this.calculateChart(request);
    
    if (!response.success || !response.data) {
      return response;
    }

    // Add any specific processing for Life Cycle Decoder here
    // For now, we return the standard chart data
    logger.info("Life Cycle Decoder data prepared", { 
      name: request.name,
      lifePalace: response.data.lifePalace,
    });

    return response;
  }

  /**
   * Get chart data for Wealth Path Decoder report
   * This method prepares the chart data specifically for Wealth Path Decoder PDF generation
   */
  public async getWealthPathDecoderData(request: CalculationRequest): Promise<CalculationResponse> {
    const response = await this.calculateChart(request);
    
    if (!response.success || !response.data) {
      return response;
    }

    // Add any specific processing for Wealth Path Decoder here
    // For now, we return the standard chart data
    logger.info("Wealth Path Decoder data prepared", { 
      name: request.name,
      fiveElements: response.data.fiveElements,
    });

    return response;
  }

  /**
   * Get chart data for Monthly Report
   * This method prepares the chart data specifically for Monthly Report PDF generation
   */
  public async getMonthlyReportData(request: CalculationRequest): Promise<CalculationResponse> {
    const response = await this.calculateChart(request);
    
    if (!response.success || !response.data) {
      return response;
    }

    // Add any specific processing for Monthly Report here
    // For now, we return the standard chart data
    logger.info("Monthly Report data prepared", { 
      name: request.name,
      currentYear: new Date().getFullYear(),
    });

    return response;
  }

  /**
   * Get basic chart information for testing/debugging
   */
  public async getChartInfo(request: CalculationRequest): Promise<{
    success: boolean;
    data?: {
      name: string;
      birthInfo: string;
      lifePalace: number;
      fiveElements?: string;
      mainStar?: string;
      calculationSteps: Record<string, string>;
    };
    error?: string;
    timestamp: string;
  }> {
    try {
      const response = await this.calculateChart(request);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to calculate chart",
          timestamp: new Date().toISOString(),
        };
      }

      const chartData = response.data;
      
      return {
        success: true,
        data: {
          name: chartData.input.name,
          birthInfo: `${chartData.input.year}-${chartData.input.month}-${chartData.input.day} ${chartData.input.hour}:00 (${chartData.input.gender})`,
          lifePalace: chartData.lifePalace,
          fiveElements: chartData.fiveElements || "",
          mainStar: chartData.mainStar || "",
          calculationSteps: chartData.calculationSteps,
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      logger.error("Failed to get chart info", { 
        error: error instanceof Error ? error.message : "Unknown error",
        input: request,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const calculationService = new CalculationService();