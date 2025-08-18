/**
 * Shared base and types for PDF generation
 */

import PDFDocument from "pdfkit";
import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { PdfGenerationResult } from "@/types";
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
  readonly daming?: boolean;
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
  /** Optional subitems to render beneath this agenda entry (e.g., the 12-cycle sections) */
  readonly subitems?: readonly { text: string; page: number }[];
}

/**
 * Abstract base class for PDF generators
 */
export abstract class BasePdfGenerator {
  protected doc: InstanceType<typeof PDFDocument>;
  protected browser: Browser | null = null;
  protected currentPage: number = 0;
  // Unified horizontal content margin applied across pages
  protected readonly contentMargin: number = 80;
  
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
   * Draw a centered footer page number for the current page (except cover page)
   */
  protected drawPageNumber(): void {
    try {
      if (this.currentPage <= 1) return; // Skip cover page
      const pageWidth = this.doc.page.width;
      const pageHeight = this.doc.page.height;
      const margin = this.contentMargin;
      const footerText = `Page ${this.currentPage}`;
      this.doc
        .font(this.fontRegularName)
        .fontSize(12)
        .fillColor("#1f2937")
        .text(footerText, margin, pageHeight - 36, {
          width: pageWidth - margin * 2,
          align: "center",
        });
    } catch {}
  }

  /**
   * Attempts to register Bricolage Grotesque fonts if available under assets/fonts.
   * Falls back to Helvetica if not found.
   */
  protected setupFonts(): void {
    try {
      // This file compiles to dist/services/pdf/base.js → assets is at ../../assets
      const fontsDir = path.join(__dirname, "../../assets/fonts");
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
   */
  protected async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--ignore-certificate-errors",
          "--no-zygote",
        ],
      });
    }
  }

  /**
   * Close Puppeteer browser
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
      // Harden navigation for remote servers (TLS, headless bot checks)
      await page.setDefaultNavigationTimeout(60000);
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      // Set viewport to match the chart container size
      await page.setViewport({ width: 900, height: 900 });
      
      // Construct the URL
      const url = `${options.frontendUrl}/chart-only?year=${options.year}&month=${options.month}&day=${options.day}&hour=${options.hour}&gender=${encodeURIComponent(options.gender)}&name=${encodeURIComponent(options.name)}${options.daming ? "&daming=true" : ""}`;
      
      logger.info("Taking chart screenshot", { url });
      
      // Navigate to the page
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      } catch (err) {
        logger.warn("First navigation attempt failed, retrying with 'load'", {
          url,
          error: err instanceof Error ? err.message : String(err),
        });
        await page.goto(url, { waitUntil: "load", timeout: 60000 });
      }
      
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
          await page.waitForSelector(selector, { timeout: 15000 });
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
   */
  protected getTextWidth(text: string, fontSize: number): number {
    // Simple estimation based on character count and font size
    // This is a rough approximation - can be improved later
    return text.length * fontSize * 0.6;
  }

  /**
   * Render a standardized cover page with background and centered title box
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
   */
  protected renderAgendaPage(title: string, backgroundPath: string, items: AgendaItem[]): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Title
    const titleFontSize = 32;
    const marginHorizontal = this.contentMargin;
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
    // Use compact font size; slightly tighter spacing to avoid overflow
    const itemFontSize = 16;
    const lineHeight = 34;

    // Reserve right area for the page indicator
    const pageIndicatorWidth = 120;
    const contentWidth = endX - startX - pageIndicatorWidth - 20; // 20px gap before indicator

    // Flatten items + subitems into uniform rows
    const rows: { text: string; page: number }[] = [];
    items.forEach((it) => {
      rows.push({ text: it.text, page: it.page });
      if (Array.isArray(it.subitems)) {
        it.subitems.forEach((s) => rows.push({ text: `- ${s.text}`, page: s.page }));
      }
    });

    // Render rows uniformly
    rows.forEach((row, idx) => {
      const y = startY + idx * lineHeight;
      this.doc
        .font(this.fontRegularName)
        .fontSize(itemFontSize)
        .fillColor("#1f2937")
        .text(row.text, startX, y, { align: "left", width: contentWidth });
      const indicator = `page ${row.page}`;
      this.doc
        .font(this.fontRegularName)
        .fontSize(itemFontSize)
        .fillColor("#1f2937")
        .text(indicator, endX - pageIndicatorWidth, y, { width: pageIndicatorWidth, align: "right" });
    });
  }

  /**
   * Render standardized conclusion page shared by all PDFs
   */
  protected renderConclusionPage(backgroundPath: string, paragraphs: string[]): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const marginHorizontal = this.contentMargin;
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
   */
  protected abstract generateContent(): Promise<void>;

  /**
   * Generate the complete PDF
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
        filename: `${(this.doc.info as unknown as { Title?: string }).Title || "report"}_${Date.now()}.pdf`,
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



