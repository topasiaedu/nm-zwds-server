/**
 * Enhanced PDF generation service for creating various types of reports
 * 
 * Provides a reusable PDF generation architecture that can be extended
 * for different types of reports (lifecycle decoder, etc.)
 * Supports background images, Puppeteer screenshots, and multi-page layouts
 */

import PDFDocument from "pdfkit";
import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import path from "path";
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
 * Chart screenshot options
 */
export interface ChartScreenshotOptions {
  readonly frontendUrl: string;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly gender: string;
  readonly name: string;
}

/**
 * Page layout options
 */
export interface PageLayoutOptions {
  readonly backgroundImage?: string;
  readonly backgroundPosition?: "left" | "center" | "right";
  readonly margin?: number;
  readonly contentPadding?: number;
}

/**
 * Agenda item interface
 */
export interface AgendaItem {
  readonly text: string;
  readonly page: number;
}

/**
 * Abstract base class for PDF generators
 */
abstract class BasePdfGenerator {
  protected doc: InstanceType<typeof PDFDocument>;
  protected browser: Browser | null = null;
  protected currentPage: number = 0;
  
  // Font names registered in PDFKit
  protected fontRegularName: string = "Helvetica";
  protected fontBoldName: string = "Helvetica-Bold";

  constructor(options: BasePdfOptions) {
    this.doc = new PDFDocument({
      size: "A4",
      margin: 0, // We'll handle margins manually for better control
      info: {
        Title: options.title,
        Author: options.author || "CAE - Top Asia Education",
        Subject: options.subject || options.title,
        Creator: options.creator || "CAE Lifecycle Decoder",
      },
    });

    // Attempt to load brand fonts
    this.setupFonts();
  }

  /**
   * Attempts to register Bricolage Grotesque fonts if available under assets/fonts.
   * Falls back to Helvetica if not found.
   */
  protected setupFonts(): void {
    try {
      const fontsDir = path.join(__dirname, "../assets/fonts");
      if (!fs.existsSync(fontsDir)) {
        // No custom fonts available
        return;
      }

      // Candidate filenames for regular and bold
      const regularCandidates = [
        "BricolageGrotesque-Regular.ttf",
        "BricolageGrotesqueText-Regular.ttf",
        "BricolageGrotesque-Regular.otf",
      ];
      const boldCandidates = [
        "BricolageGrotesque-Bold.ttf",
        "BricolageGrotesqueText-Bold.ttf",
        "BricolageGrotesque-Bold.otf",
      ];

      const findFont = (candidates: string[]): string | null => {
        for (const name of candidates) {
          const p = path.join(fontsDir, name);
          if (fs.existsSync(p)) return p;
        }
        return null;
      };

      const regularPath = findFont(regularCandidates);
      const boldPath = findFont(boldCandidates);

      if (regularPath) {
        this.doc.registerFont("Bricolage-Regular", regularPath);
        this.fontRegularName = "Bricolage-Regular";
      }
      if (boldPath) {
        this.doc.registerFont("Bricolage-Bold", boldPath);
        this.fontBoldName = "Bricolage-Bold";
      } else if (regularPath) {
        // If bold is missing, still use regular as fallback
        this.fontBoldName = this.fontRegularName;
      }
    } catch (error) {
      // Silently fall back to system fonts; log for diagnostics
      logger.warn("Custom font setup failed; falling back to Helvetica", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Initialize Puppeteer browser
   * @returns {Promise<void>}
   */
  protected async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }
  }

  /**
   * Close Puppeteer browser
   * @returns {Promise<void>}
   */
  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Take screenshot of chart from frontend
   * @param {ChartScreenshotOptions} options - Screenshot options
   * @returns {Promise<Buffer>} Screenshot buffer
   */
  protected async takeChartScreenshot(options: ChartScreenshotOptions): Promise<Buffer> {
    try {
      await this.initializeBrowser();
      
      if (!this.browser) {
        throw new Error("Browser not initialized");
      }

      const page: Page = await this.browser.newPage();
      
      // Set viewport to match the chart container size
      await page.setViewport({ width: 900, height: 900 });
      
      // Construct the URL
      const url = `${options.frontendUrl}/chart-only?year=${options.year}&month=${options.month}&day=${options.day}&hour=${options.hour}&gender=${encodeURIComponent(options.gender)}&name=${encodeURIComponent(options.name)}`;
      
      logger.info("Taking chart screenshot", { url });
      
      // Navigate to the page
      await page.goto(url, { waitUntil: "networkidle2" });
      
      // Wait for the chart container to be present - try multiple selectors
      let element = null;
      const selectors = [
        ".w-\\[900px\\].h-\\[900px\\].flex.items-center.justify-center",
        "[class*='w-[900px]'][class*='h-[900px]']",
        ".chart-container",
        "[class*='chart']",
        "div[class*='900px']"
      ];
      
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          element = await page.$(selector);
          if (element) {
            logger.info("Found chart element with selector", { selector });
            break;
          }
        } catch (error) {
          logger.warn("Selector not found", { selector, error: error instanceof Error ? error.message : "Unknown error" });
        }
      }
      
      if (!element) {
        // Try to take a screenshot of the entire page as fallback
        logger.warn("Chart container not found, taking full page screenshot");
        const screenshot = await page.screenshot({
          type: "png",
          omitBackground: false,
        });
        await page.close();
        return Buffer.from(screenshot);
      }
      
      const screenshot = await element.screenshot({
        type: "png",
        omitBackground: false,
      });
      
      await page.close();
      
      logger.info("Chart screenshot taken successfully", { 
        size: screenshot.length,
        url 
      });
      
      return Buffer.from(screenshot);
      
    } catch (error) {
      logger.error("Failed to take chart screenshot", error);
      throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Add background image to page
   * @param {string} imagePath - Path to background image
   * @param {string} position - Background position
   * @returns {void}
   */
  protected addBackgroundImage(imagePath: string, position: "left" | "center" | "right" = "center"): void {
    try {
      if (!fs.existsSync(imagePath)) {
        logger.warn("Background image not found", { imagePath });
        return;
      }

      const pageWidth = this.doc.page.width;
      const pageHeight = this.doc.page.height;
      
      // For now, we'll add the image with fixed dimensions
      // This can be enhanced later with proper image dimension handling
      const imageWidth = pageWidth;
      const imageHeight = pageHeight;
      let x = 0;
      let y = 0;
      
      // Position the image based on the position parameter
      switch (position) {
        case "left":
          x = 0;
          break;
        case "right":
          x = pageWidth / 2;
          break;
        case "center":
        default:
          x = 0;
          break;
      }
      
      // Add the background image
      this.doc.image(imagePath, x, y, { width: imageWidth, height: imageHeight });
      
    } catch (error) {
      logger.error("Failed to add background image", { error, imagePath });
    }
  }

  /**
   * Calculate text width with current font settings
   * @param {string} text - Text to measure
   * @param {number} fontSize - Font size
   * @returns {number} Text width
   */
  protected getTextWidth(text: string, fontSize: number): number {
    // Simple estimation based on character count and font size
    // This is a rough approximation - can be improved later
    return text.length * fontSize * 0.6;
  }

  /**
   * Render a standardized cover page with background and centered title box
   * Shared by all PDF types; title can span multiple lines separated by \n
   * @param {string} title - Title text, use "\n" for line breaks
   * @param {string} backgroundPath - Path to the cover background image
   */
  protected renderCoverPage(title: string, backgroundPath: string): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Title settings
    const fontSize = 42;
    const lineSpacing = 10; // px between lines
    const padding = 28; // border padding

    const lines = title.split("\n");

    // Compute max line width for box sizing (rough but consistent)
    const lineWidths = lines.map((line) => this.getTextWidth(line, fontSize));
    const maxLineWidth = Math.max(...lineWidths);

    const textBlockHeight = lines.length * fontSize + (lines.length - 1) * lineSpacing;
    const borderWidth = maxLineWidth + padding * 2;
    const borderHeight = textBlockHeight + padding * 2;

    // Position: perfectly centered
    const borderX = (pageWidth - borderWidth) / 2;
    const borderY = (pageHeight - borderHeight) / 2;

    // Draw border
    this.doc
      .lineWidth(3)
      .strokeColor("#1f2937")
      .rect(borderX, borderY, borderWidth, borderHeight)
      .stroke();

    // Draw title
    this.doc
      .font(this.fontBoldName)
      .fontSize(fontSize)
      .fillColor("#1f2937")
      .text(lines.join("\n"), borderX + padding, borderY + padding, {
        width: borderWidth - padding * 2,
        align: "center",
        lineGap: lineSpacing,
      });
  }

  /**
   * Render a standardized agenda page
   * @param {string} title - Agenda title
   * @param {string} backgroundPath - Path to the content background image
   * @param {AgendaItem[]} items - List of agenda items to render
   */
  protected renderAgendaPage(title: string, backgroundPath: string, items: AgendaItem[]): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Title
    const titleFontSize = 32;
    const marginHorizontal = 60;
    const titleY = Math.round(pageHeight * 0.12);

    this.doc
      .font(this.fontBoldName)
      .fontSize(titleFontSize)
      .fillColor("#1f2937")
      .text(title, marginHorizontal, titleY, { width: pageWidth - marginHorizontal * 2, align: "center" });

    // Items
    const startX = marginHorizontal;
    const endX = pageWidth - marginHorizontal;
    const startY = titleY + 80;
    const itemFontSize = 24;
    const lineHeight = 38;

    items.forEach((item, idx) => {
      const y = startY + idx * lineHeight;
      // Text
      this.doc
        .font(this.fontRegularName)
        .fontSize(itemFontSize)
        .fillColor("#1f2937")
        .text(item.text, startX, y, { align: "left", width: endX - startX - 140 });

      // Page indicator on the right
      const pageIndicator = `page ${item.page}`;
      this.doc
        .font(this.fontRegularName)
        .fontSize(itemFontSize)
        .fillColor("#1f2937")
        .text(pageIndicator, endX - 120, y, { width: 120, align: "right" });
    });
  }

  /**
   * Render standardized conclusion page shared by all PDFs
   * @param {string} backgroundPath - Path to the content background image
   * @param {string[]} paragraphs - Body paragraphs to draw
   */
  protected renderConclusionPage(backgroundPath: string, paragraphs: string[]): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const marginHorizontal = 60;
    const topY = Math.round(pageHeight * 0.1);

    // Title
    this.doc
      .font(this.fontBoldName)
      .fontSize(32)
      .fillColor("#1f2937")
      .text("Conclusion", marginHorizontal, topY, { align: "left" });

    // Body
    let y = topY + 40;
    const bodyWidth = pageWidth - marginHorizontal * 2;
    const paragraphGap = 14;

    paragraphs.forEach((p) => {
      this.doc
        .font(this.fontRegularName)
        .fontSize(16)
        .fillColor("#1f2937")
        .text(p, marginHorizontal, y, { width: bodyWidth, align: "left", lineGap: 4 });
      // Advance Y by measuring height roughly: assume ~20px per line for 16pt
      // To avoid complex measurement, move Y by fixed block and rely on text's auto-wrap pushing internal cursor
      y = this.doc.y + paragraphGap; // use PDFKit internal cursor after last text
    });
  }

  /**
   * Generate the PDF content (to be implemented by subclasses)
   * @returns {Promise<void>}
   */
  protected abstract generateContent(): Promise<void>;

  /**
   * Generate the complete PDF
   * @returns {Promise<PdfGenerationResult>}
   */
  async generate(): Promise<PdfGenerationResult> {
    try {
      // Generate the content
      await this.generateContent();

      // Close browser if it was opened
      await this.closeBrowser();

      // Convert to buffer
      const buffer = await this.convertToBuffer();

      return {
        buffer,
        filename: `${this.doc.info.Title || "report"}_${Date.now()}.pdf`,
        mimeType: "application/pdf",
      };
    } catch (error) {
      // Ensure browser is closed even on error
      await this.closeBrowser();
      
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
  private readonly frontendUrl: string;
  private readonly coverBackgroundPath: string;
  private readonly contentBackgroundPath: string;

  constructor(data: LifecycleDecoderRequest, frontendUrl: string) {
    super({
      title: "Life Cycle Decoder Report",
      subject: `Life Cycle Analysis for ${data.name}`,
    });
    this.data = data;
    this.frontendUrl = frontendUrl;
    this.coverBackgroundPath = path.join(__dirname, "../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../assets/content-bg.png");
  }

  /**
   * Generate the lifecycle decoder content
   * @returns {Promise<void>}
   */
  protected async generateContent(): Promise<void> {
    // Cover + Agenda + Chart (page-by-page development)
    await this.generateCoverPage();
    await this.generateAgendaPage();
    await this.generateChartPage();
    await this.generateConclusionPage();
  }

  /**
   * Generate cover page
   * @returns {Promise<void>}
   */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;

    // Render standardized cover page
    this.renderCoverPage("LIFE CYCLE\nDECODER", this.coverBackgroundPath);
  }

  /**
   * Generate agenda page
   * @returns {Promise<void>}
   */
  private async generateAgendaPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;

    const items: AgendaItem[] = [
      { text: "Your Zi Wei Chart", page: 3 },
      { text: "Conclusion", page: 4 },
    ];

    this.renderAgendaPage(
      "What is in this report",
      this.contentBackgroundPath,
      items
    );
  }

  /**
   * Generate chart page
   * @returns {Promise<void>}
   */
  private async generateChartPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Add content background image
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Add title
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const titleText = "Your Zi Wei Chart";
    const titleFontSize = 32;
    this.doc
      .font(this.fontBoldName)
      .fontSize(titleFontSize)
      .fillColor("#1f2937")
      .text(titleText, 60, Math.round(pageHeight * 0.12), { width: pageWidth - 120, align: "center" });
    
    try {
      // Parse birth date
      const birthDate = new Date(this.data.birthday);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      
      // Parse birth time
      const [hourStr] = this.data.birthTime.split(":");
      const hour = parseInt(hourStr || "0", 10);
      
      // Take chart screenshot
      const screenshot = await this.takeChartScreenshot({
        frontendUrl: this.frontendUrl,
        year,
        month,
        day,
        hour,
        gender: this.data.gender,
        name: this.data.name,
      });
      
      // Add screenshot to PDF
      const maxWidth = pageWidth - 120;
      const imageWidth = Math.min(560, maxWidth);
      const imageHeight = imageWidth; // square chart
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = Math.round(pageHeight * 0.12) + 50;
      
      this.doc.image(screenshot, imageX, imageY, { width: imageWidth, height: imageHeight });
      
    } catch (error) {
      logger.error("Failed to add chart screenshot", error);
      
      // Add placeholder text if screenshot fails
      this.doc
        .font(this.fontRegularName)
        .fontSize(16)
        .fillColor("#e74c3c")
        .text("Chart could not be generated", 60, Math.round(pageHeight * 0.45), { width: pageWidth - 120, align: "center" });
    }
  }

  /**
   * Generate conclusion page
   */
  private async generateConclusionPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    const paragraphs: string[] = [
      "While Zi Wei Dou Shu provides a powerful framework for understanding your unique destiny, it is important to remember that astrology serves as a map rather than a rigid set of instructions. The stars and palaces highlight your innate strengths, natural tendencies, and potential timing for opportunities and challenges, but they do not dictate your every move. The true value of this report lies in the self-awareness and clarity it offers, empowering you to make thoughtful, intentional choices as you move through each phase of life.",
      "If some aspects of your reading feel challenging or uncertain, remember that this does not define your future nor spell the end of the story. In fact, facing difficulties often opens doors to personal growth, resilience, and transformation. Zi Wei Dou Shu is a remarkably deep and nuanced system, capable of offering further layers of insight and guidance for those who wish to explore it more fully. There are always paths to navigate obstacles, make wise decisions, and turn adversity into opportunity.",
      "Let this report serve as both a compass and a source of encouragement, illuminating possibilities without limiting your sense of agency or hope. Use the insights here as inspiration for proactive steps, confident that your actions and mindset are the true keys to shaping a meaningful and fulfilling journey. Ultimately, your destiny is not only what is written in the stars, but also what you choose to create with courage, wisdom, and heart.",
    ];
    this.renderConclusionPage(this.contentBackgroundPath, paragraphs);
  }
}

/**
 * Wealth Decoder PDF Generator
 */
class WealthDecoderPdfGenerator extends BasePdfGenerator {
  private readonly data: LifecycleDecoderRequest;
  private readonly frontendUrl: string;
  private readonly coverBackgroundPath: string;
  private readonly contentBackgroundPath: string;

  constructor(data: LifecycleDecoderRequest, frontendUrl: string) {
    super({
      title: "Wealth Decoder Report",
      subject: `Wealth Analysis for ${data.name}`,
    });
    this.data = data;
    this.frontendUrl = frontendUrl;
    this.coverBackgroundPath = path.join(__dirname, "../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../assets/content-bg.png");
  }

  /**
   * Generate the wealth decoder content
   * @returns {Promise<void>}
   */
  protected async generateContent(): Promise<void> {
    // Generate cover page
    await this.generateCoverPage();
    
    // Generate agenda page
    await this.generateAgendaPage();
    
    // Generate chart page
    await this.generateChartPage();
    
    // Generate conclusion page
    await this.generateConclusionPage();
  }

  /**
   * Generate cover page
   * @returns {Promise<void>}
   */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;

    // Render standardized cover page
    this.renderCoverPage("WEALTH\nDECODER", this.coverBackgroundPath);
  }

  /**
   * Generate agenda page
   * @returns {Promise<void>}
   */
  private async generateAgendaPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Add content background image
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Add main title
    const pageWidth = this.doc.page.width;
    const titleText = "What is in this report";
    const titleFontSize = 28;
    const titleWidth = this.getTextWidth(titleText, titleFontSize);
    const titleX = (pageWidth - titleWidth) / 2;
    const titleY = 150;

    this.doc
      .fontSize(titleFontSize)
      .fillColor("#2c3e50")
      .text(titleText, titleX, titleY, { align: "center" });
    
    // Add agenda items
    const agendaItems = this.getAgendaItems();
    
    const startY = titleY + 80;
    const lineHeight = 35;
    
    agendaItems.forEach((item, index) => {
      const y = startY + index * lineHeight;
      
      // Add item text
      this.doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .text(item.text, 100, y, { align: "left" });
      
      // Add page number
      this.doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .text(`(page ${item.page})`, pageWidth - 150, y, { align: "right" });
    });
  }

  /**
   * Get agenda items for wealth decoder
   * @returns {AgendaItem[]} Agenda items
   */
  private getAgendaItems(): AgendaItem[] {
    return [
      { text: "Your Wealth Chart", page: 3 },
      { text: "Wealth Analysis", page: 4 },
      { text: "Financial Opportunities", page: 5 },
      { text: "Investment Timing", page: 6 },
      { text: "Risk Assessment", page: 7 },
      { text: "Wealth Building Strategies", page: 8 },
      { text: "Action Plan", page: 9 },
      { text: "Conclusion", page: 10 },
    ];
  }

  /**
   * Generate chart page
   * @returns {Promise<void>}
   */
  private async generateChartPage(): Promise<void> {
    this.currentPage++;
    
    // Add content background image
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Add title
    const pageWidth = this.doc.page.width;
    const titleText = "Your Wealth Chart";
    const titleFontSize = 24;
    const titleWidth = this.getTextWidth(titleText, titleFontSize);
    const titleX = (pageWidth - titleWidth) / 2;
    const titleY = 120;
    
    this.doc
      .fontSize(titleFontSize)
      .fillColor("#2c3e50")
      .text(titleText, titleX, titleY, { align: "center" });
    
    try {
      // Parse birth date
      const birthDate = new Date(this.data.birthday);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      
      // Parse birth time
      const [hourStr] = this.data.birthTime.split(":");
      const hour = parseInt(hourStr || "0", 10);
      
      // Take chart screenshot
      const screenshot = await this.takeChartScreenshot({
        frontendUrl: this.frontendUrl,
        year,
        month,
        day,
        hour,
        gender: this.data.gender,
        name: this.data.name,
      });
      
      // Add screenshot to PDF
      const imageWidth = 600;
      const imageHeight = 600;
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = titleY + 50;
      
      this.doc.image(screenshot, imageX, imageY, { width: imageWidth, height: imageHeight });
      
    } catch (error) {
      logger.error("Failed to add chart screenshot", error);
      
      // Add placeholder text if screenshot fails
    this.doc
        .fontSize(16)
        .fillColor("#e74c3c")
        .text("Chart could not be generated", pageWidth / 2 - 100, 300, { align: "center" });
    }
  }

  private async generateConclusionPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    const paragraphs: string[] = [
      "While Zi Wei Dou Shu provides a powerful framework for understanding your unique destiny, it is important to remember that astrology serves as a map rather than a rigid set of instructions. The stars and palaces highlight your innate strengths, natural tendencies, and potential timing for opportunities and challenges, but they do not dictate your every move. The true value of this report lies in the self-awareness and clarity it offers, empowering you to make thoughtful, intentional choices as you move through each phase of life.",
      "If some aspects of your reading feel challenging or uncertain, remember that this does not define your future nor spell the end of the story. In fact, facing difficulties often opens doors to personal growth, resilience, and transformation. Zi Wei Dou Shu is a remarkably deep and nuanced system, capable of offering further layers of insight and guidance for those who wish to explore it more fully. There are always paths to navigate obstacles, make wise decisions, and turn adversity into opportunity.",
      "Let this report serve as both a compass and a source of encouragement, illuminating possibilities without limiting your sense of agency or hope. Use the insights here as inspiration for proactive steps, confident that your actions and mindset are the true keys to shaping a meaningful and fulfilling journey. Ultimately, your destiny is not only what is written in the stars, but also what you choose to create with courage, wisdom, and heart.",
    ];
    this.renderConclusionPage(this.contentBackgroundPath, paragraphs);
  }
}

/**
 * Career Timing Window PDF Generator
 */
class CareerTimingWindowPdfGenerator extends BasePdfGenerator {
  private readonly data: LifecycleDecoderRequest;
  private readonly frontendUrl: string;
  private readonly coverBackgroundPath: string;
  private readonly contentBackgroundPath: string;

  constructor(data: LifecycleDecoderRequest, frontendUrl: string) {
    super({
      title: "Career Timing Window Report",
      subject: `Career Analysis for ${data.name}`,
    });
    this.data = data;
    this.frontendUrl = frontendUrl;
    this.coverBackgroundPath = path.join(__dirname, "../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../assets/content-bg.png");
  }

  /**
   * Generate the career timing window content
   * @returns {Promise<void>}
   */
  protected async generateContent(): Promise<void> {
    // Generate cover page
    await this.generateCoverPage();
    
    // Generate agenda page
    await this.generateAgendaPage();
    
    // Generate chart page
    await this.generateChartPage();
    
    // Generate conclusion page
    await this.generateConclusionPage();
  }

  /**
   * Generate cover page
   * @returns {Promise<void>}
   */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;

    // Render standardized cover page
    this.renderCoverPage("CAREER TIMING\nWINDOW", this.coverBackgroundPath);
  }

  /**
   * Generate agenda page
   * @returns {Promise<void>}
   */
  private async generateAgendaPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Add content background image
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Add main title
    const pageWidth = this.doc.page.width;
    const titleText = "What is in this report";
    const titleFontSize = 28;
    const titleWidth = this.getTextWidth(titleText, titleFontSize);
    const titleX = (pageWidth - titleWidth) / 2;
    const titleY = 150;
    
    this.doc
      .fontSize(titleFontSize)
      .fillColor("#2c3e50")
      .text(titleText, titleX, titleY, { align: "center" });
    
    // Add agenda items
    const agendaItems = this.getAgendaItems();
    
    const startY = titleY + 80;
    const lineHeight = 35;
    
    agendaItems.forEach((item, index) => {
      const y = startY + index * lineHeight;
      
      // Add item text
      this.doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .text(item.text, 100, y, { align: "left" });
      
      // Add page number
    this.doc
        .fontSize(16)
        .fillColor("#2c3e50")
        .text(`(page ${item.page})`, pageWidth - 150, y, { align: "right" });
    });
  }

  /**
   * Get agenda items for career timing window
   * @returns {AgendaItem[]} Agenda items
   */
  private getAgendaItems(): AgendaItem[] {
    return [
      { text: "Your Career Chart", page: 3 },
      { text: "Career Analysis", page: 4 },
      { text: "Timing Windows", page: 5 },
      { text: "Opportunity Periods", page: 6 },
      { text: "Career Transitions", page: 7 },
      { text: "Strategic Planning", page: 8 },
      { text: "Action Plan", page: 9 },
      { text: "Conclusion", page: 10 },
    ];
  }

  /**
   * Generate chart page
   * @returns {Promise<void>}
   */
  private async generateChartPage(): Promise<void> {
    this.currentPage++;
    
    // Add content background image
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Add title
    const pageWidth = this.doc.page.width;
    const titleText = "Your Career Chart";
    const titleFontSize = 24;
    const titleWidth = this.getTextWidth(titleText, titleFontSize);
    const titleX = (pageWidth - titleWidth) / 2;
    const titleY = 120;
    
    this.doc
      .fontSize(titleFontSize)
      .fillColor("#2c3e50")
      .text(titleText, titleX, titleY, { align: "center" });
    
    try {
      // Parse birth date
      const birthDate = new Date(this.data.birthday);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      
      // Parse birth time
      const [hourStr] = this.data.birthTime.split(":");
      const hour = parseInt(hourStr || "0", 10);
      
      // Take chart screenshot
      const screenshot = await this.takeChartScreenshot({
        frontendUrl: this.frontendUrl,
        year,
        month,
        day,
        hour,
        gender: this.data.gender,
        name: this.data.name,
      });
      
      // Add screenshot to PDF
      const imageWidth = 600;
      const imageHeight = 600;
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = titleY + 50;
      
      this.doc.image(screenshot, imageX, imageY, { width: imageWidth, height: imageHeight });
      
    } catch (error) {
      logger.error("Failed to add chart screenshot", error);
      
      // Add placeholder text if screenshot fails
    this.doc
        .fontSize(16)
        .fillColor("#e74c3c")
        .text("Chart could not be generated", pageWidth / 2 - 100, 300, { align: "center" });
    }
  }

  private async generateConclusionPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    const paragraphs: string[] = [
      "While Zi Wei Dou Shu provides a powerful framework for understanding your unique destiny, it is important to remember that astrology serves as a map rather than a rigid set of instructions. The stars and palaces highlight your innate strengths, natural tendencies, and potential timing for opportunities and challenges, but they do not dictate your every move. The true value of this report lies in the self-awareness and clarity it offers, empowering you to make thoughtful, intentional choices as you move through each phase of life.",
      "If some aspects of your reading feel challenging or uncertain, remember that this does not define your future nor spell the end of the story. In fact, facing difficulties often opens doors to personal growth, resilience, and transformation. Zi Wei Dou Shu is a remarkably deep and nuanced system, capable of offering further layers of insight and guidance for those who wish to explore it more fully. There are always paths to navigate obstacles, make wise decisions, and turn adversity into opportunity.",
      "Let this report serve as both a compass and a source of encouragement, illuminating possibilities without limiting your sense of agency or hope. Use the insights here as inspiration for proactive steps, confident that your actions and mindset are the true keys to shaping a meaningful and fulfilling journey. Ultimately, your destiny is not only what is written in the stars, but also what you choose to create with courage, wisdom, and heart.",
    ];
    this.renderConclusionPage(this.contentBackgroundPath, paragraphs);
  }
}

/**
 * PDF Service class for managing different types of PDF generation
 */
class PdfService {
  /**
   * Generate a lifecycle decoder PDF
   * @param {LifecycleDecoderRequest} data - User data for the report
   * @param {string} frontendUrl - Frontend URL for chart generation
   * @returns {Promise<PdfGenerationResult>} Generated PDF result
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
   * @param {LifecycleDecoderRequest} data - User data for the report
   * @param {string} frontendUrl - Frontend URL for chart generation
   * @returns {Promise<PdfGenerationResult>} Generated PDF result
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
   * @param {LifecycleDecoderRequest} data - User data for the report
   * @param {string} frontendUrl - Frontend URL for chart generation
   * @returns {Promise<PdfGenerationResult>} Generated PDF result
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

/**
 * Singleton instance of the PDF service
 */
export const pdfService = new PdfService();