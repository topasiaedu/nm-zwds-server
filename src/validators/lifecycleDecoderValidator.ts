/**
 * Validation schemas for lifecycle decoder endpoint
 * 
 * Uses Zod for runtime type validation with detailed error messages
 * Following strict TypeScript guidelines
 */

import { z } from "zod";
import { LifecycleDecoderRequest } from "@/types";

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Time validation regex pattern (HH:MM format)
 */
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Date validation helper function
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Whether the date is valid and not in the future
 */
function isValidBirthDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Check if date is not in the future
  if (date > now) {
    return false;
  }
  
  // Check if date is not too far in the past (reasonable birth date)
  const minDate = new Date("1900-01-01");
  if (date < minDate) {
    return false;
  }
  
  return true;
}

/**
 * Lifecycle decoder request validation schema
 */
export const lifecycleDecoderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .refine(
      (name: string) => name.length > 0,
      "Name cannot be empty after trimming whitespace"
    ),
    
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email must be less than 254 characters")
    .trim()
    .toLowerCase()
    .refine(
      (email: string) => EMAIL_REGEX.test(email),
      "Please provide a valid email address"
    ),
    
  birthday: z
    .string()
    .min(1, "Birthday is required")
    .refine(
      (date: string) => {
        // Check if it's a valid ISO date format (YYYY-MM-DD)
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return isoDateRegex.test(date);
      },
      "Birthday must be in YYYY-MM-DD format"
    )
    .refine(
      (date: string) => isValidBirthDate(date),
      "Please provide a valid birth date (not in the future and after 1900)"
    ),
    
  birthTime: z
    .string()
    .min(1, "Birth time is required")
    .refine(
      (time: string) => TIME_REGEX.test(time),
      "Birth time must be in HH:MM format (24-hour)"
    ),
    
  gender: z.enum(["male", "female", "other"]).describe("Gender must be one of: male, female, other"),
});

/**
 * Type guard to check if data matches LifecycleDecoderRequest
 * @param {unknown} data - Data to validate
 * @returns {data is LifecycleDecoderRequest} Type predicate
 */
export function isLifecycleDecoderRequest(data: unknown): data is LifecycleDecoderRequest {
  try {
    lifecycleDecoderSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate and parse lifecycle decoder request data
 * @param {unknown} data - Raw request data to validate
 * @returns {LifecycleDecoderRequest} Validated and parsed data
 * @throws {z.ZodError} If validation fails
 */
export function validateLifecycleDecoderRequest(data: unknown): LifecycleDecoderRequest {
  return lifecycleDecoderSchema.parse(data);
}

/**
 * Safe validation that returns a result object instead of throwing
 * @param {unknown} data - Raw request data to validate
 * @returns {z.SafeParseReturnType<unknown, LifecycleDecoderRequest>} Validation result
 */
export function safeValidateLifecycleDecoderRequest(data: unknown) {
  return lifecycleDecoderSchema.safeParse(data);
}

/**
 * Format validation errors for API responses
 * @param {z.ZodError} error - Zod validation error
 * @returns {string[]} Array of formatted error messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join(".")}: ` : "";
    return `${path}${err.message}`;
  });
}