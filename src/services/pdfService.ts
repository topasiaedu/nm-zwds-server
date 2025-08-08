/**
 * PDF generation service for creating various types of reports
 * 
 * Provides a reusable PDF generation architecture that can be extended
 * for different types of reports (lifecycle decoder, etc.)
 */

import PDFDocument from "pdfkit";
import { PdfGenerationResult, LifecycleDecoderRequest } from "@/types";
import { logger } from "@/utils/logger";

/**
 * Base PDF generator options
 */
export interface BasePdfOptions {
  readonly title: string;
  readonly author?: string;
  readonly subject?: string;
  readonly creator?: string;
}

/**
 * Abstract base class for PDF generators
 */
abstract class BasePdfGenerator {
  protected doc: PDFDocument;

  constructor(options: BasePdfOptions) {
    this.doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: options.title,
        Author: options.author || "CAE - Top Asia Education",
        Subject: options.subject || options.title,
        Creator: options.creator || "CAE Lifecycle Decoder",
      },
    });
  }

  /**
   * Generate the PDF content (to be implemented by subclasses)
   * @returns {Promise<void>}
   */
  protected abstract generateContent(): Promise<void>;

  /**
   * Add header to the PDF
   * @param {string} title - Header title
   * @returns {void}
   */
  protected addHeader(title: string): void {
    // Add logo placeholder (you can replace with actual logo later)
    this.doc
      .fontSize(24)
      .fillColor("#2c3e50")
      .text("CAE", 50, 50, { align: "left" })
      .fontSize(12)
      .fillColor("#7f8c8d")
      .text("Top Asia Education", 50, 80);

    // Add title
    this.doc
      .fontSize(20)
      .fillColor("#2c3e50")
      .text(title, 50, 120, { align: "center" })
      .moveDown(2);
  }

  /**
   * Add footer to the PDF
   * @param {number} pageNumber - Current page number
   * @returns {void}
   */
  protected addFooter(pageNumber: number): void {
    const bottomMargin = 50;
    const pageHeight = this.doc.page.height;

    this.doc
      .fontSize(10)
      .fillColor("#7f8c8d")
      .text(
        `© ${new Date().getFullYear()} CAE - Top Asia Education | Page ${pageNumber}`,
        50,
        pageHeight - bottomMargin,
        { align: "center", width: this.doc.page.width - 100 }
      );
  }

  /**
   * Generate the complete PDF
   * @returns {Promise<PdfGenerationResult>}
   */
  async generate(): Promise<PdfGenerationResult> {
    try {
      // Generate the content
      await this.generateContent();

      // Convert to buffer
      const buffer = await this.convertToBuffer();

      return {
        buffer,
        filename: `${this.doc.info.Title || "report"}_${Date.now()}.pdf`,
        mimeType: "application/pdf",
      };
    } catch (error) {
      logger.error("Failed to generate PDF", error);
      throw new Error("PDF generation failed");
    }
  }

  /**
   * Convert the PDF document to a buffer
   * @returns {Promise<Buffer>}
   */
  private convertToBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];

      this.doc.on("data", (chunk: Buffer) => {
        buffers.push(chunk);
      });

      this.doc.on("end", () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer);
      });

      this.doc.on("error", (error: Error) => {
        reject(error);
      });

      // Finalize the PDF
      this.doc.end();
    });
  }
}

/**
 * Lifecycle Decoder PDF Generator
 */
class LifecycleDecoderPdfGenerator extends BasePdfGenerator {
  private readonly data: LifecycleDecoderRequest;

  constructor(data: LifecycleDecoderRequest) {
    super({
      title: "Lifecycle Decoder Report",
      subject: `Lifecycle Analysis for ${data.name}`,
    });
    this.data = data;
  }

  /**
   * Generate the lifecycle decoder content
   * @returns {Promise<void>}
   */
  protected async generateContent(): Promise<void> {
    // Add header
    this.addHeader("Lifecycle Decoder Report");

    // Personal Information Section
    this.addPersonalInfoSection();

    // Birth Chart Information (placeholder for now)
    this.addBirthChartSection();

    // Analysis Section (placeholder for now)
    this.addAnalysisSection();

    // Recommendations Section (placeholder for now)
    this.addRecommendationsSection();

    // Add footer
    this.addFooter(1);
  }

  /**
   * Add personal information section
   * @returns {void}
   */
  private addPersonalInfoSection(): void {
    this.doc
      .fontSize(16)
      .fillColor("#2c3e50")
      .text("Personal Information", { underline: true })
      .moveDown(1);

    const birthDate = new Date(this.data.birthday);
    const formattedDate = birthDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Name: ${this.data.name}`)
      .text(`Email: ${this.data.email}`)
      .text(`Birth Date: ${formattedDate}`)
      .text(`Birth Time: ${this.data.birthTime}`)
      .text(`Gender: ${this.data.gender.charAt(0).toUpperCase() + this.data.gender.slice(1)}`)
      .moveDown(2);
  }

  /**
   * Add birth chart section (placeholder)
   * @returns {void}
   */
  private addBirthChartSection(): void {
    this.doc
      .fontSize(16)
      .fillColor("#2c3e50")
      .text("Birth Chart Analysis", { underline: true })
      .moveDown(1);

    this.doc
      .fontSize(12)
      .fillColor("#000")
      .text("Your birth chart reveals important insights about your personality and life path.")
      .moveDown(1)
      .text("• Sun Sign: Based on your birth date, we can determine your core personality traits")
      .text("• Birth Time: The exact time provides insights into your rising sign and houses")
      .text("• Planetary Positions: Each planet's position influences different aspects of your life")
      .moveDown(2);
  }

  /**
   * Add analysis section (placeholder)
   * @returns {void}
   */
  private addAnalysisSection(): void {
    this.doc
      .fontSize(16)
      .fillColor("#2c3e50")
      .text("Lifecycle Analysis", { underline: true })
      .moveDown(1);

    this.doc
      .fontSize(12)
      .fillColor("#000")
      .text("Based on your birth information, here are key insights about your life journey:")
      .moveDown(1)
      .text("• Personality Traits: Your core characteristics and natural tendencies")
      .text("• Life Path: Major themes and lessons in your life journey")
      .text("• Strengths: Natural abilities and talents you possess")
      .text("• Challenges: Areas for growth and development")
      .text("• Relationships: How you connect with others")
      .text("• Career: Professional inclinations and opportunities")
      .moveDown(2);
  }

  /**
   * Add recommendations section (placeholder)
   * @returns {void}
   */
  private addRecommendationsSection(): void {
    this.doc
      .fontSize(16)
      .fillColor("#2c3e50")
      .text("Recommendations", { underline: true })
      .moveDown(1);

    this.doc
      .fontSize(12)
      .fillColor("#000")
      .text("Based on your lifecycle analysis, here are personalized recommendations:")
      .moveDown(1)
      .text("• Focus on developing your natural strengths")
      .text("• Be mindful of potential challenges and prepare accordingly")
      .text("• Consider timing for major life decisions")
      .text("• Embrace opportunities for personal growth")
      .text("• Maintain balance in all aspects of life")
      .moveDown(2);

    // Add disclaimer
    this.doc
      .fontSize(10)
      .fillColor("#7f8c8d")
      .text(
        "Disclaimer: This report is for entertainment and self-reflection purposes only. " +
        "It should not be used as a substitute for professional advice in important life decisions.",
        { align: "justify" }
      );
  }
}

/**
 * PDF Service class for managing different types of PDF generation
 */
class PdfService {
  /**
   * Generate a lifecycle decoder PDF
   * @param {LifecycleDecoderRequest} data - User data for the report
   * @returns {Promise<PdfGenerationResult>} Generated PDF result
   */
  async generateLifecycleDecoderPdf(data: LifecycleDecoderRequest): Promise<PdfGenerationResult> {
    try {
      logger.info("Generating lifecycle decoder PDF", {
        name: data.name,
        email: data.email,
      });

      const generator = new LifecycleDecoderPdfGenerator(data);
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

  // TODO: Add methods for the other 2 PDF types
  // async generateSecondTypePdf(data: SecondTypeRequest): Promise<PdfGenerationResult>
  // async generateThirdTypePdf(data: ThirdTypeRequest): Promise<PdfGenerationResult>
}

/**
 * Singleton instance of the PDF service
 */
export const pdfService = new PdfService();