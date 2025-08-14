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
import { ZWDSCalculator } from "@/calculation/calculator";
import { PALACE_DESCRIPTIONS, PalaceKey, STAR_MEANINGS_BY_PALACE, STAR_META, StarKey, NEXT_STEPS_BY_PALACE } from "@/calculation/life-cycle-decoder/constants";
import { DECADE_CYCLE_MEANINGS } from "@/calculation/life-cycle-decoder/decade_cycle_meaning";
import { STRENGTH, OPPORTUNITY, INFLUENCE, SUPPORT, VOLATILITY } from "@/calculation/life-cycle-decoder/score";
import { OPPOSITE_PALACE_INFLUENCE } from "@/calculation/constants";

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
abstract class BasePdfGenerator {
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
      const url = `${options.frontendUrl}/chart-only?year=${options.year}&month=${options.month}&day=${options.day}&hour=${options.hour}&gender=${encodeURIComponent(options.gender)}&name=${encodeURIComponent(options.name)}${options.daming ? "&daming=true" : ""}`;
      
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
   * @param {string} backgroundPath - Path to the content background image
   * @param {string[]} paragraphs - Body paragraphs to draw
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
    await this.generateCurrentCyclePage();
    await this.generateStarsInCyclePages();
    await this.generateDaMingChartPage();
    await this.generateDecadeCyclePages();
    await this.generateNextStepsPage();
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
    
    // Build dynamic agenda based on content sections for Lifecycle report
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    const getStarKeysForPalace = (p?: typeof chart.palaces[number]): StarKey[] => {
      const list: StarKey[] = [];
      if (p?.mainStar) p.mainStar.forEach(s => { const n = s?.name; if (typeof n === "string" && (STAR_META as Record<string, unknown>)[n]) list.push(n as StarKey); });
      if (p?.minorStars) p.minorStars.forEach(s => { const n = s?.name; if (typeof n === "string" && (STAR_META as Record<string, unknown>)[n]) list.push(n as StarKey); });
      return list;
    };

    const ageYears = Math.max(0, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const daYunIndex = chart.palaces.findIndex(p => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
    const currentPalace = chart.palaces[daYunIndex >= 0 ? daYunIndex : 0];
    const oppositeNameZh = OPPOSITE_PALACE_INFLUENCE[(currentPalace?.name as PalaceKey) || "命宫"];

    // Stars aligning your cycle
    let starKeys = getStarKeysForPalace(currentPalace);
    if (starKeys.length === 0) {
      const opp = chart.palaces.find(p => p.name === oppositeNameZh);
      starKeys = getStarKeysForPalace(opp);
    }
    const pagesStarsAligning = Math.max(1, Math.ceil(starKeys.length / 2));

    // Decade cycle pages (bars + stars)
    let decadePages = 0;
    for (let i = 0; i < 12; i++) {
      const idx = ((daYunIndex >= 0 ? daYunIndex : 0) - i + 12) % 12; // counter-clockwise
      const p = chart.palaces[idx];
      let sks = getStarKeysForPalace(p);
      if (sks.length === 0) {
        const oppZh = p ? OPPOSITE_PALACE_INFLUENCE[p.name as keyof typeof OPPOSITE_PALACE_INFLUENCE] : undefined;
        const opp = chart.palaces.find(x => x.name === oppZh);
        sks = getStarKeysForPalace(opp);
      }
      const remaining = Math.max(0, sks.length - 1);
      decadePages += 1 + Math.ceil(remaining / 2);
    }

    const pageChart = 3; // 1 cover, 2 agenda, 3 chart
    const pageCurrent = pageChart + 1;
    const pageStars = pageCurrent + 1;
    const pageDaMing = pageStars + pagesStarsAligning;
    const pageDecades = pageDaMing + 1;
    const pageNext = pageDecades + decadePages;
    const pageConclusion = pageNext + 1;

    // Build 12 cycle labels in Da Yun order for sub-section rendering
    const cyclesZh: readonly string[] = ["大命","大兄","大夫","大子","大财","大疾","大迁","大友","大官","大田","大福","大父"] as const;
    const cycleEnMap: Record<string, string> = {
      "大命": "DA MING",
      "大兄": "DA XIONG",
      "大夫": "DA FU",
      "大子": "DA ZI",
      "大财": "DA CAI",
      "大疾": "DA JI",
      "大迁": "DA QIAN",
      "大友": "DA YOU",
      "大官": "DA GUAN",
      "大田": "DA TIAN",
      "大福": "DA FU",
      "大父": "DA FU",
    };
    const palaceEnMapForCycle: Record<string, string> = {
      "命宫": "LIFE",
      "兄弟": "SIBLINGS",
      "夫妻": "SPOUSE",
      "子女": "CHILDREN",
      "财帛": "WEALTH",
      "疾厄": "WELLBEING",
      "迁移": "TRAVEL",
      "交友": "FRIENDS",
      "官禄": "CAREER",
      "田宅": "PROPERTY",
      "福德": "HEALTH",
      "父母": "PARENTS",
    };
    // Determine order by mapping each palace index to a cycle label starting from Da Yun index (counter-clockwise)
    const palaceCycleLabels: string[] = new Array(12).fill("");
    for (let i = 0; i < 12; i++) {
      const palaceIdx = ( (daYunIndex >= 0 ? daYunIndex : 0) - i + 12 ) % 12; // same as generateDecadeCyclePages
      const labelZh = cyclesZh[i] ?? "大命";
      palaceCycleLabels[palaceIdx] = labelZh;
    }
    const orderedCycles: { text: string; page: number }[] = chart.palaces.map((p, idx) => {
      const cycZh = palaceCycleLabels[idx] || "大命";
      const cycEn = cycleEnMap[cycZh] || "DA MING";
      const palaceEn = palaceEnMapForCycle[p.name as PalaceKey] || "LIFE";
      // Sub-pages start from the decade section's first page
      const subPage = pageDecades + idx; // simple incremental mapping
      return { text: `${cycEn} - ${palaceEn}`, page: subPage };
    });

    const items: AgendaItem[] = [
      { text: "Your Zi Wei Chart", page: pageChart },
      { text: "Your Current Cycle", page: pageCurrent },
      { text: "Stars Aligning Your Cycle", page: pageStars },
      { text: "Your Zi Wei Chart with Da Ming", page: pageDaMing },
      { text: "10 Year Cycle (12 sections)", page: pageDecades, subitems: orderedCycles },
      { text: "Next Steps", page: pageNext },
      { text: "Conclusion", page: pageConclusion },
    ];

    this.renderAgendaPage(
      "What is in this report",
      this.contentBackgroundPath,
      items
    );
    this.drawPageNumber();
  }

  /**
   * Generate chart page
   * @returns {Promise<void>}
   */
  private async generateChartPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Background wash
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Header title with single underline
    const margin = this.contentMargin;
    const headerTop = Math.round(pageHeight * 0.08);
    const headerText = "LIFE CYCLE DECODER";
    const headerFontSize = 30;
    this.doc
      .font(this.fontBoldName)
      .fontSize(headerFontSize)
      .fillColor("#0b0f14")
      .text(headerText, margin, headerTop, { width: pageWidth - margin * 2, align: "center" });

    // Underline only (remove top line)
    const lineYBelow = headerTop + headerFontSize + 6;
    const lineInset = margin + 10;
    this.doc
      .moveTo(lineInset, lineYBelow)
      .lineTo(pageWidth - lineInset, lineYBelow)
      .stroke();

    // Personal details layout
    const detailsTop = lineYBelow + 18;
    const leftLabelX = margin;
    const rowGap = 20;
    const labelFontSize = 12;
    const valueFontSize = 12;

    /** Formats date as 14TH DECEMBER 2024 */
    const formatBirthday = (iso: string): string => {
      const d = new Date(iso);
      const day = d.getDate();
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthNames: readonly string[] = [
        "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
        "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER",
      ];
      const getOrdinal = (n: number): string => {
        const v = n % 100;
        if (v >= 11 && v <= 13) return `${n}TH`;
        switch (n % 10) {
          case 1: return `${n}ST`;
          case 2: return `${n}ND`;
          case 3: return `${n}RD`;
          default: return `${n}TH`;
        }
      };
      return `${getOrdinal(day)} ${monthNames[m]} ${y}`;
    };

    /** Formats time range as HH:00 - HH:59 based on provided hour */
    const formatBirthTimeRange = (hhmm: string): string => {
      const [hStr] = hhmm.split(":");
      const h = Number.parseInt(hStr || "0", 10);
      const endH = (h + 1) % 24;
      const pad = (n: number): string => n.toString().padStart(2, "0");
      return `${pad(h)}:00 - ${pad(endH)}:59`;
    };

    // Left column labels
    const labels: readonly string[] = ["NAME", "BIRTHDAY", "BIRTHTIME", "GENDER"];
    labels.forEach((label, idx) => {
      const y = detailsTop + idx * rowGap;
      this.doc
        .font(this.fontBoldName)
        .fontSize(labelFontSize)
        .fillColor("#0b0f14")
        .text(label, leftLabelX, y, { align: "left" });
    });

    // Right column values
    const values: readonly string[] = [
      this.data.name.toUpperCase(),
      formatBirthday(this.data.birthday),
      formatBirthTimeRange(this.data.birthTime),
      this.data.gender.toUpperCase(),
    ];
    values.forEach((val, idx) => {
      const y = detailsTop + idx * rowGap;
      this.doc
        .font(this.fontBoldName)
        .fontSize(valueFontSize)
        .fillColor("#0b0f14")
        .text(val, margin, y, { width: pageWidth - margin * 2, align: "right" });
    });

    // Divider line before chart section
    const dividerY = detailsTop + (labels.length - 1) * rowGap + 26;
    this.doc
      .moveTo(lineInset, dividerY)
      .lineTo(pageWidth - lineInset, dividerY)
      .strokeColor("#0b0f14")
      .lineWidth(1)
      .stroke();

    // Section title above the chart
    const chartTitle = "PERSONALIZED ZI WEI CHART";
    const chartTitleY = dividerY + 10;
    this.doc
      .font(this.fontBoldName)
      .fontSize(14)
      .fillColor("#0b0f14")
      .text(chartTitle, margin, chartTitleY, { width: pageWidth - margin * 2, align: "center" });

    // Chart screenshot
    try {
      const birthDate = new Date(this.data.birthday);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const [hourStr] = this.data.birthTime.split(":");
      const hour = Number.parseInt(hourStr || "0", 10);
      
      const screenshot = await this.takeChartScreenshot({
        frontendUrl: this.frontendUrl,
        year,
        month,
        day,
        hour,
        gender: this.data.gender,
        name: this.data.name,
      });
      
      const maxWidth = pageWidth - margin * 2 - 40; // inner padding to page
      const imageWidth = Math.min(560, maxWidth);
      const imageHeight = imageWidth; // square
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = chartTitleY + 26;
      this.doc.image(screenshot, imageX, imageY, { width: imageWidth, height: imageHeight });
    } catch (error) {
      logger.error("Failed to add chart screenshot", error);
      this.doc
        .font(this.fontRegularName)
        .fontSize(16)
        .fillColor("#e74c3c")
        .text("Chart could not be generated", margin, Math.round(pageHeight * 0.45), { width: pageWidth - margin * 2, align: "center" });
    }
    this.drawPageNumber();
  }

  /**
   * Generate Current Cycle page (Da Xian) using Major Limit from calculator
   */
  private async generateCurrentCyclePage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    // Background
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    // Compute current palace by today age in Major Limit ranges
    const birth = new Date(this.data.birthday);
    const today = new Date();
    const ageYears = Math.max(0, Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));

    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    // Find palace whose Major Limit contains current age
    const palace = chart.palaces.find(p => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
    const palaceName: PalaceKey = (palace?.name as PalaceKey) || "命宫";
    const rangeText = palace?.majorLimit ? `${palace.majorLimit.startAge}-${palace.majorLimit.endAge}` : "";
    const description = PALACE_DESCRIPTIONS[palaceName];

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    // Header: CURRENT 10 YEAR CYCLE + palace EN + icon from assets/palace
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text("CURRENT 10 YEAR CYCLE", margin, Math.round(pageHeight * 0.08));

    // Palace icon (top-right) + watermark background icon
    const palaceIconMap: Record<PalaceKey, string> = {
      "命宫": path.join(__dirname, "../assets/palace/Life.png"),
      "兄弟": path.join(__dirname, "../assets/palace/Siblings.png"),
      "夫妻": path.join(__dirname, "../assets/palace/Spouse.png"),
      "子女": path.join(__dirname, "../assets/palace/Children.png"),
      "财帛": path.join(__dirname, "../assets/palace/Wealth.png"),
      "疾厄": path.join(__dirname, "../assets/palace/Health.png"),
      "迁移": path.join(__dirname, "../assets/palace/Travel.png"),
      "交友": path.join(__dirname, "../assets/palace/Friends.png"),
      "官禄": path.join(__dirname, "../assets/palace/Career.png"),
      "田宅": path.join(__dirname, "../assets/palace/Property.png"),
      "福德": path.join(__dirname, "../assets/palace/Wellbeing.png"),
      "父母": path.join(__dirname, "../assets/palace/Parents.png"),
    };
    const iconPath = palaceIconMap[palaceName];
    try {
      const iconSize = 120;
      const iconX = pageWidth - margin - iconSize;
      const iconY = Math.round(pageHeight * 0.06);
      if (fs.existsSync(iconPath)) {
        // Draw clean icon (no darkening)
        this.doc.image(iconPath, iconX, iconY, { width: iconSize, height: iconSize });
      }
    } catch { /* ignore icon failures */ }

    // Palace English heading and range
    const palaceEnMap: Record<PalaceKey, string> = {
      "命宫": "LIFE",
      "兄弟": "SIBLINGS",
      "夫妻": "SPOUSE",
      "子女": "CHILDREN",
      "财帛": "WEALTH",
      "疾厄": "HEALTH",
      "迁移": "TRAVEL",
      "交友": "FRIENDS",
      "官禄": "CAREER",
      "田宅": "PROPERTY",
      "福德": "WELLBEING",
      "父母": "PARENTS",
    };
    this.doc
      .font(this.fontBoldName)
      .fontSize(48)
      .fillColor("#d4af37")
      .text(palaceEnMap[palaceName], margin, this.doc.y + 6, { continued: false });

    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(rangeText, margin, this.doc.y + 4);

    // Thin divider
    const dividerY = this.doc.y + 16;
    this.doc
      .moveTo(margin + 10, dividerY)
      .lineTo(pageWidth - margin - 10, dividerY)
      .lineWidth(2)
      .strokeColor("#0b0f14")
      .stroke();

    // Watermark: faint palace icon at bottom-right of the description area
    try {
      if (fs.existsSync(iconPath)) {
        const wmSize = 260;
        const wmX = pageWidth - margin - wmSize;
        const wmY = pageHeight - margin - wmSize - 40; // keep above footer
        this.doc.save().opacity(0.1).image(iconPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
      }
    } catch { /* ignore watermark errors */ }

    // Body description
    const bodyTop = dividerY + 16;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(description, margin, bodyTop, { width: pageWidth - margin * 2, align: "left", lineGap: 6 });
    this.drawPageNumber();
  }

  /**
   * Page 5+: Stars aligning your cycle — render stars present in the current DaYun palace.
   * Two stars per page, with top-right icon and a faint watermark in the body.
   */
  private async generateStarsInCyclePages(): Promise<void> {
    // Compute chart and current palace
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    // Determine current age and current DaYun palace
    const ageYears = Math.max(0, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const currentPalace = chart.palaces.find(p => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
    const palaceKey: PalaceKey = (currentPalace?.name as PalaceKey) || "命宫";

    // Collect main + notable minor stars in the palace; fallback to opposite palace if none
    const collectStars = (p?: typeof chart.palaces[number]): string[] => {
      const arr: string[] = [];
      if (p?.mainStar) arr.push(...p.mainStar.map(s => s.name));
      if (p?.minorStars) arr.push(...p.minorStars.map(s => s.name));
      return arr;
    };
    let starNames: string[] = collectStars(currentPalace);
    if (starNames.length === 0) {
      // Fallback to opposite palace using constant map (Chinese palaces)
      const oppositeNameZh = OPPOSITE_PALACE_INFLUENCE[palaceKey as keyof typeof OPPOSITE_PALACE_INFLUENCE];
      const oppositePalace = chart.palaces.find(p => p.name === oppositeNameZh);
      starNames = collectStars(oppositePalace);
    }

    // Filter to available meanings/icons; map to StarKey where applicable
    const availableStarKeys: StarKey[] = starNames.filter((n): n is StarKey => (STAR_META as Record<string, unknown>)[n] !== undefined) as StarKey[];

    if (availableStarKeys.length === 0) {
      // Still create one page with a note
      this.doc.addPage();
      this.currentPage++;
      this.addBackgroundImage(this.contentBackgroundPath, "center");
      const pageWidth = this.doc.page.width; const pageHeight = this.doc.page.height; const margin = this.contentMargin;
      this.doc.font(this.fontBoldName).fontSize(24).fillColor("#0b0f14").text("STARS ALIGNING YOUR CYCLE", margin, Math.round(pageHeight * 0.1));
      this.doc.font(this.fontRegularName).fontSize(14).fillColor("#0b0f14").text("No notable stars detected for the current cycle.", margin, Math.round(pageHeight * 0.2), { width: pageWidth - margin * 2 });
      this.drawPageNumber();
      return;
    }

    // Chunk by 2 stars per page
    const chunks: StarKey[][] = [];
    for (let i = 0; i < availableStarKeys.length; i += 2) chunks.push(availableStarKeys.slice(i, i + 2));

    chunks.forEach((chunk) => {
      this.doc.addPage();
      this.currentPage++;
      this.addBackgroundImage(this.contentBackgroundPath, "center");

      const pageWidth = this.doc.page.width; const pageHeight = this.doc.page.height; const margin = this.contentMargin;
      // Title
      this.doc.font(this.fontBoldName).fontSize(24).fillColor("#0b0f14").text("STARS ALIGNING YOUR CYCLE", margin, Math.round(pageHeight * 0.08));

      const sectionTopY = Math.round(pageHeight * 0.14);

      const brandColor = "#BD6D68";

      const drawStarSection = (starKey: StarKey, topY: number): number => {
        const meta = STAR_META[starKey];
        const title = meta.name_en.toUpperCase();
        const subtitle = meta.title.toUpperCase();
        const meaning = (STAR_MEANINGS_BY_PALACE[palaceKey] && STAR_MEANINGS_BY_PALACE[palaceKey][starKey]) || meta.description;
        const iconPath = path.join(__dirname, `../assets/stars/${meta.name_en.replace(/\s+/g, "")}.png`);

        // Heading + icon
        const titleY = topY + 6;
        this.doc.font(this.fontBoldName).fontSize(48).fillColor(brandColor).text(title, margin, titleY, { width: pageWidth - margin * 2 - 120 });

        // Icon on right
        try {
          if (fs.existsSync(iconPath)) {
            const iconSize = 80;
            const iconX = pageWidth - margin - iconSize;
            const iconY = titleY - 10;
            this.doc.image(iconPath, iconX, iconY, { width: iconSize, height: iconSize });
          }
        } catch {}

        // Subtitle
        const subtitleY = titleY + 48 + 6;
        this.doc.font(this.fontBoldName).fontSize(12).fillColor(brandColor).text(subtitle, margin, subtitleY);

        // Watermark behind section body (to the right)
        try {
          if (fs.existsSync(iconPath)) {
            const wmSize = 320;
            const wmX = pageWidth - margin - wmSize - 10;
            const wmY = subtitleY + 30;
            this.doc.save().opacity(0.06).image(iconPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
          }
        } catch {}

        // Body text (fixed 16pt as requested) and dynamic divider
        const bodyTop = subtitleY + 18;
        this.doc.font(this.fontRegularName).fontSize(16).fillColor("#0b0f14").text(meaning, margin, bodyTop, { width: pageWidth - margin * 2, align: "left", lineGap: 5 });

        const dividerY = this.doc.y + 14;
        this.doc.moveTo(margin + 20, dividerY).lineTo(pageWidth - margin - 20, dividerY).lineWidth(1.5).strokeColor("#0b0f14").stroke();
        return dividerY + 24; // next section top
      };

      let nextTop = sectionTopY;
      chunk.forEach((sk) => { nextTop = drawStarSection(sk, nextTop); });

      this.drawPageNumber();
    });
  }

  /**
   * Show the chart again with Da Ming highlight (frontend param daming=true)
   */
  private async generateDaMingChartPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    // Title block
    const title = "LET'S DIVE A BIT DEEPER";
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text(title, margin, Math.round(pageHeight * 0.12), { width: pageWidth - margin * 2, align: "center" });

    // Subtitle
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text("YOUR ZI WEI CHART WITH DA MING", margin, this.doc.y + 14, { width: pageWidth - margin * 2, align: "center" });

    // Fetch screenshot with daming=true
    try {
      const birthDate = new Date(this.data.birthday);
      const screenshot = await this.takeChartScreenshot({
        frontendUrl: this.frontendUrl,
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
        hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
        gender: this.data.gender,
        name: this.data.name,
        daming: true,
      });

      const maxWidth = Math.min(580, pageWidth - margin * 2 - 40);
      const imageWidth = maxWidth;
      const imageHeight = imageWidth;
      const imageX = (pageWidth - imageWidth) / 2;
      const imageY = this.doc.y + 30;
      this.doc.image(screenshot, imageX, imageY, { width: imageWidth, height: imageHeight });
    } catch (err) {
      logger.warn("DaMing chart screenshot failed", { message: err instanceof Error ? err.message : String(err) });
      this.doc.font(this.fontRegularName).fontSize(14).fillColor("#e74c3c").text("Chart with Da Ming could not be generated", margin, Math.round(pageHeight * 0.45), { width: pageWidth - margin * 2, align: "center" });
    }

    this.drawPageNumber();
  }

  /**
   * Next Steps page — three items based on the Da Yun palace
   */
  private async generateNextStepsPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    // Determine Da Yun palace
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();
    const ageYears = Math.max(0, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const currentPalace = chart.palaces.find(p => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
    const palaceKey: PalaceKey = (currentPalace?.name as PalaceKey) || "命宫";

    const steps = NEXT_STEPS_BY_PALACE[palaceKey] || [];

    // Title
    const titleY = Math.round(pageHeight * 0.12);
    this.doc
      .font(this.fontBoldName)
      .fontSize(32)
      .fillColor("#0b0f14")
      .text("Next steps", margin, titleY);

    // Render up to three steps
    const startY = titleY + 60;
    let y = startY;
    const numberColor = "#d4af37";
    const numFontSize = 120;

    const drawStep = (index: number, title: string, description: string) => {
      // Large number on left
      const numText = String(index + 1);
      this.doc
        .font(this.fontBoldName)
        .fontSize(numFontSize)
        .fillColor(numberColor)
        .text(numText, margin, y - 20, { width: 90, align: "left" });

      const textX = margin + 120;
      // Step title
      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(title, textX, y + 10);

      // Body
      const bodyTop = this.doc.y + 10;
      this.doc
        .font(this.fontRegularName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(description, textX, bodyTop, { width: pageWidth - textX - margin, align: "left", lineGap: 6 });

      // Separator line (subtle)
      const sepY = this.doc.y + 24;
      if (sepY < pageHeight - margin - 80 && index < 2) {
        this.doc
          .moveTo(textX, sepY)
          .lineTo(pageWidth - margin, sepY)
          .lineWidth(1)
          .strokeColor("#0b0f14")
          .stroke();
      }
      y = sepY + 48;
    };

    for (let i = 0; i < Math.min(3, steps.length); i++) {
      const s = steps[i];
      if (s) {
        drawStep(i, s.title || "", s.description || "");
      }
    }

    this.drawPageNumber();
  }

  /**
   * Generate 12 Decade Cycle pages in order starting from the Da Yun palace as DA MING, then DA XIONG, etc.
   * For each cycle:
   * - First page: header + one set of bars aggregated across stars (ceil average)
   * - Then star meaning pages, two stars per page, using DECADE_CYCLE_MEANINGS text
   */
  private async generateDecadeCyclePages(): Promise<void> {
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: Number.parseInt(this.data.birthTime.split(":")[0] || "0", 10),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    const cycles: string[] = ["大命","大兄","大夫","大子","大财","大疾","大迁","大友","大官","大田","大福","大父"];

    const ageYears = Math.max(0, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const daYunIndex = chart.palaces.findIndex(p => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
    const startIdx = daYunIndex >= 0 ? daYunIndex : 0;

    // Map palaces (12) into cycle labels, going clockwise from Da Yun index
    const palaceCycleLabels: string[] = [];
    for (let i = 0; i < 12; i++) {
      // Assign going counter-clockwise (decrementing indices)
      const palaceIdx = (startIdx - i + 12) % 12;
      palaceCycleLabels[palaceIdx] = cycles[i] || "大命";
    }

    // Utility mappers
    const cycleEnMap: Record<string, string> = {
      "大命": "DA MING",
      "大兄": "DA XIONG",
      "大夫": "DA FU",
      "大子": "DA ZI",
      "大财": "DA CAI",
      "大疾": "DA JI",
      "大迁": "DA QIAN",
      "大友": "DA YOU",
      "大官": "DA GUAN",
      "大田": "DA TIAN",
      "大福": "DA FU",
      "大父": "DA FU",
    };
    const cyclePalaceEnMap: Record<string, string> = {
      "大命": "life",
      "大兄": "siblings",
      "大夫": "spouse",
      "大子": "children",
      "大财": "wealth",
      "大疾": "wellbeing",
      "大迁": "travel",
      "大友": "friends",
      "大官": "career",
      "大田": "property",
      "大福": "health",
      "大父": "parents",
    };

    // For each palace by index 0..11
    chart.palaces.forEach((palace, idx) => {
      const cycle = (palaceCycleLabels[idx] || "大命") as string;
      const cycleEn = cycleEnMap[cycle] || "DA MING";
      const palaceEn = cyclePalaceEnMap[cycle] || "life";

      // Gather stars in this palace (main + minor); fallback to opposite palace if none
      const collectStarKeys = (p?: typeof chart.palaces[number]): StarKey[] => {
        const list: StarKey[] = [];
        if (p?.mainStar) p.mainStar.forEach(s => { const n = s?.name; if (typeof n === "string" && (STAR_META as Record<string, unknown>)[n]) list.push(n as StarKey); });
        if (p?.minorStars) p.minorStars.forEach(s => { const n = s?.name; if (typeof n === "string" && (STAR_META as Record<string, unknown>)[n]) list.push(n as StarKey); });
        return list;
      };
      let stars: StarKey[] = collectStarKeys(palace);
      if (stars.length === 0) {
        const oppositeNameZh = OPPOSITE_PALACE_INFLUENCE[palace.name as keyof typeof OPPOSITE_PALACE_INFLUENCE];
        const opposite = chart.palaces.find(p => p.name === oppositeNameZh);
        stars = collectStarKeys(opposite);
      }

      // Aggregate scores: ceil(average across stars); missing values ignored
      const safeAvg = (table: Record<string, Record<string, number>>): number => {
        const row = table[cycle] || {};
        const arr = stars.map(sk => row[String(sk)]).filter((n): n is number => typeof n === "number");
        if (arr.length === 0) return 0;
        return Math.ceil(arr.reduce((a, b) => a + b, 0) / arr.length);
      };
      const sStrength = safeAvg(STRENGTH as unknown as Record<string, Record<string, number>>);
      const sOpportunity = safeAvg(OPPORTUNITY as unknown as Record<string, Record<string, number>>);
      const sInfluence = safeAvg(INFLUENCE as unknown as Record<string, Record<string, number>>);
      const sSupport = safeAvg(SUPPORT as unknown as Record<string, Record<string, number>>);
      const sVolatility = safeAvg(VOLATILITY as unknown as Record<string, Record<string, number>>);

      // Render header + bars page
      this.doc.addPage();
      this.currentPage++;
      this.addBackgroundImage(this.contentBackgroundPath, "center");

      const pageWidth = this.doc.page.width; const pageHeight = this.doc.page.height; const margin = this.contentMargin;

      // Header
      const headerTop = Math.round(pageHeight * 0.08);
      this.doc.font(this.fontBoldName).fontSize(18).fillColor("#0b0f14").text("10 YEAR CYCLE", margin, headerTop);
      // tighter spacing between lines
      this.doc.font(this.fontBoldName).fontSize(42).fillColor("#d4af37").text(cycleEn, margin, this.doc.y + 2);
      // Underlying palace label on left
      this.doc.font(this.fontBoldName).fontSize(12).fillColor("#0b0f14").text(palaceEn.toUpperCase(), margin, this.doc.y + 4);

      // Palace icon (top-right)
      try {
        const palaceIconPath = path.join(
          __dirname,
          `../assets/palace/${palaceEn.charAt(0).toUpperCase()}${palaceEn.slice(1)}.png`
        );
        if (fs.existsSync(palaceIconPath)) {
          const iconSize = 96;
          const iconX = pageWidth - margin - iconSize;
          const iconY = headerTop - 10;
          this.doc.image(palaceIconPath, iconX, iconY, { width: iconSize, height: iconSize });
        }
      } catch {}

      // Simple horizontal bars
      const barWidth = pageWidth - margin * 2 - 60;
      const barStartX = margin;
      let y = this.doc.y + 10;
      const drawBar = (label: string, value: number) => {
        const max = 100; const filled = Math.max(0, Math.min(max, value));
        this.doc.font(this.fontBoldName).fontSize(16).fillColor("#0b0f14").text(label.toUpperCase(), barStartX, y);
        y += 18;
        // track
        this.doc.save().rect(barStartX, y, barWidth, 10).strokeColor("#e5e7eb").lineWidth(1).stroke().restore();
        // fill
        this.doc.save().rect(barStartX, y, Math.round((filled / max) * barWidth), 10).fillColor("#d4af37").fill().restore();
        // value on right
        this.doc.font(this.fontBoldName).fontSize(16).fillColor("#0b0f14").text(String(filled), barStartX + barWidth + 6, y - 3);
        y += 24;
      };
      drawBar("Strength", sStrength);
      drawBar("Opportunity", sOpportunity);
      drawBar("Influence", sInfluence);
      drawBar("Support", sSupport);
      drawBar("Volatility", sVolatility);

      // Spacing below bar section (no divider per request)
      const barDividerY = y + 6;

      // First star section on the same page under bars
      const brandColor = "#BD6D68";
      if (stars.length > 0) {
        // Section label before star(s)
        this.doc
          .font(this.fontBoldName)
          .fontSize(14)
          .fillColor("#0b0f14")
          .text("STARS WITHIN", margin, barDividerY + 8);
        
        const firstStar = stars[0];
        const metaFirst = STAR_META[firstStar as unknown as StarKey];
        const titleFirst = metaFirst.name_en.toUpperCase();
        const subtitleFirst = (metaFirst.title || "").toUpperCase();
        const meaningFirst = (DECADE_CYCLE_MEANINGS as Record<string, Partial<Record<string, string>>>)[cycle]?.[firstStar as unknown as string] || metaFirst.description;
        const iconFirst = path.join(__dirname, `../assets/stars/${metaFirst.name_en.replace(/\s+/g, "")}.png`);

        // Title — add more spacing from bars
        const firstTitleY = barDividerY + 36; // more spacing from bars and label
        this.doc.font(this.fontBoldName).fontSize(48).fillColor(brandColor).text(titleFirst, margin, firstTitleY, { width: pageWidth - margin * 2 - 120 });
        // Star icon right
        try { if (fs.existsSync(iconFirst)) { this.doc.image(iconFirst, pageWidth - margin - 72, firstTitleY - 6, { width: 72, height: 72 }); } } catch {}
        // Subtitle
        this.doc.font(this.fontBoldName).fontSize(12).fillColor(brandColor).text(subtitleFirst, margin, this.doc.y + 4);

        // Watermark star on right behind text
        try { if (fs.existsSync(iconFirst)) { this.doc.save().opacity(0.06).image(iconFirst, pageWidth - margin - 320, this.doc.y + 10, { width: 320, height: 320 }).opacity(1).restore(); } } catch {}

        const bodyTopFirst = this.doc.y + 12;
        this.doc.font(this.fontRegularName).fontSize(16).fillColor("#0b0f14").text(meaningFirst, margin, bodyTopFirst, { width: pageWidth - margin * 2, align: "left", lineGap: 5 });
        // no divider after first star
      }

      this.drawPageNumber();

      // Star meaning pages for this cycle (2 per page)
      const chunked: StarKey[][] = [];
      const remainingStars = stars.slice(1);
      for (let i2 = 0; i2 < remainingStars.length; i2 += 2) chunked.push(remainingStars.slice(i2, i2 + 2));

      const renderStarPage = (twoStars: StarKey[]) => {
        this.doc.addPage();
        this.currentPage++;
        this.addBackgroundImage(this.contentBackgroundPath, "center");
        const startY = Math.round(pageHeight * 0.15);
        let localY = startY;
        twoStars.forEach((sk) => {
          const meta = STAR_META[sk];
          const title = meta.name_en.toUpperCase();
          const subtitle = (meta.title || "").toUpperCase();
          const cycleBlock = (DECADE_CYCLE_MEANINGS as Record<string, Partial<Record<string, string>>>)[cycle] || {};
          const meaning = (cycleBlock as Record<string, string>)[sk as unknown as string] || meta.description;
          const iconPath = path.join(__dirname, `../assets/stars/${meta.name_en.replace(/\s+/g, "")}.png`);

          this.doc.font(this.fontBoldName).fontSize(48).fillColor(brandColor).text(title, margin, localY, { width: pageWidth - margin * 2 - 120 });
          // icon right
          try { if (fs.existsSync(iconPath)) { this.doc.image(iconPath, pageWidth - margin - 72, localY - 6, { width: 72, height: 72 }); } } catch {}
          this.doc.font(this.fontBoldName).fontSize(12).fillColor(brandColor).text(subtitle, margin, this.doc.y + 4);
          const bodyTop = this.doc.y + 12;
          this.doc.font(this.fontRegularName).fontSize(16).fillColor("#0b0f14").text(meaning, margin, bodyTop, { width: pageWidth - margin * 2, align: "left", lineGap: 5 });
          // divider
          // no divider between star sections; add spacing only
          localY = this.doc.y + 32;
        });
        this.drawPageNumber();
      };

      chunked.forEach(renderStarPage);
    });
  }

  /**
   * Generate conclusion page
   */
  private async generateConclusionPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;
    const topY = Math.round(pageHeight * 0.1);

    // Title
    this.doc
      .font(this.fontBoldName)
      .fontSize(32)
      .fillColor("#1f2937")
      .text("Conclusion", margin, topY, { align: "left" });

    // Body paragraphs (two)
    const bodyWidth = pageWidth - margin * 2;
    let y = topY + 40;
    const para1 = "While Zi Wei Dou Shu provides a powerful framework for understanding your unique destiny, it is important to remember that astrology serves as a map rather than a rigid set of instructions. The stars and palaces highlight your innate strengths, natural tendencies, and potential timing for opportunities and challenges, but they do not dictate your every move. The true value of this report lies in the self-awareness and clarity it offers, empowering you to make thoughtful, intentional choices as you move through each phase of life.";
    const para2 = "Let this report serve as both a compass and a source of encouragement, illuminating possibilities without limiting your sense of agency or hope. Use the insights here as inspiration for proactive steps, confident that your actions and mindset are the true keys to shaping a meaningful and fulfilling journey. Ultimately, your destiny is not only what is written in the stars, but also what you choose to create with courage, wisdom, and heart.";

    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#1f2937")
      .text(para1, margin, y, { width: bodyWidth, align: "left", lineGap: 4 });
    y = this.doc.y + 20;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#1f2937")
      .text(para2, margin, y, { width: bodyWidth, align: "left", lineGap: 4 });

    // Bottom note
    const noteTitle = "A REPORT MADE FROM ZI WEI DOU SHU READING";
    const disclaimer = "Disclaimer: This Zi Wei Dou Shu report is interpretive and for personal insight only. It isn’t medical, legal, or financial advice. Your choices and actions remain your own.";
    const noteY = Math.min(this.doc.y + 32, pageHeight - margin - 80);
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(noteTitle, margin, noteY);
    this.doc
      .font(this.fontRegularName)
      .fontSize(9)
      .fillColor("#6b7280")
      .text(disclaimer, margin, this.doc.y + 4, { width: bodyWidth, align: "left", lineGap: 2 });

    this.drawPageNumber();
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
    const lineHeight = 42;
    
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
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;
    const topY = Math.round(pageHeight * 0.1);

    // Title
    this.doc
      .font(this.fontBoldName)
      .fontSize(32)
      .fillColor("#1f2937")
      .text("Conclusion", margin, topY, { align: "left" });

    // Body paragraphs (two)
    const bodyWidth = pageWidth - margin * 2;
    let y = topY + 40;
    const para1 = "While Zi Wei Dou Shu provides a powerful framework for understanding your unique destiny, it is important to remember that astrology serves as a map rather than a rigid set of instructions. The stars and palaces highlight your innate strengths, natural tendencies, and potential timing for opportunities and challenges, but they do not dictate your every move. The true value of this report lies in the self-awareness and clarity it offers, empowering you to make thoughtful, intentional choices as you move through each phase of life.";
    const para2 = "Let this report serve as both a compass and a source of encouragement, illuminating possibilities without limiting your sense of agency or hope. Use the insights here as inspiration for proactive steps, confident that your actions and mindset are the true keys to shaping a meaningful and fulfilling journey. Ultimately, your destiny is not only what is written in the stars, but also what you choose to create with courage, wisdom, and heart.";

    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#1f2937")
      .text(para1, margin, y, { width: bodyWidth, align: "left", lineGap: 4 });
    y = this.doc.y + 20;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#1f2937")
      .text(para2, margin, y, { width: bodyWidth, align: "left", lineGap: 4 });

    // Bottom note
    const noteTitle = "A REPORT MADE FROM ZI WEI DOU SHU READING";
    const disclaimer = "Disclaimer: This Zi Wei Dou Shu report is interpretive and for personal insight only. It isn’t medical, legal, or financial advice. Your choices and actions remain your own.";
    const noteY = Math.min(this.doc.y + 32, pageHeight - margin - 80);
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(noteTitle, margin, noteY);
    this.doc
      .font(this.fontRegularName)
      .fontSize(9)
      .fillColor("#6b7280")
      .text(disclaimer, margin, this.doc.y + 4, { width: bodyWidth, align: "left", lineGap: 2 });
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
    const lineHeight = 42;
    
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