import path from "path";
import { BasePdfGenerator, AgendaItem } from "./base";
import { logger } from "@/utils/logger";
import { LifecycleDecoderRequest } from "@/types";
import { extractBirthHour, formatHourRangeFromBirthTime } from "@/utils/time";
import { ZWDSCalculator } from "@/calculation/calculator";
import { ChartData } from "@/calculation/types";
import { STAR_META } from "@/calculation/life-cycle-decoder/constants";
import { OPPOSITE_PALACE_INFLUENCE } from "@/calculation/constants";
import { OVERVIEW_DESCRIPTION_CONSTANTS } from "@/calculation/wealth-code-decoder/overview_description";
import { DATASET_1 } from "@/calculation/wealth-code-decoder/analysis_constants";
import { 
  STAR_LIFE_MEANINGS, 
  STAR_WEALTH_MEANINGS, 
  STAR_CAREER_MEANINGS,
  EXECUTION_STYLE_DESCRIPTION,
  EXECUTION_STYLE_LEADERSHIP,
  EXECUTION_STYLE_TEAM_MEMBER,
  EXECUTION_STYLE_LEVERAGE,
} from "@/calculation/wealth-code-decoder/constants";

import { computeWealthBars } from "@/calculation/wealth-code-decoder/career-bars";
import { computeCareerBars } from "@/calculation/wealth-code-decoder/wealth-bars";
import { classifyExecution, type StarKey } from "@/calculation/wealth-code-decoder/execution-style";
import {
  WEALTH_CODE_DESCRIPTION,
  WEALTH_CODE_LEADERSHIP,
  WEALTH_CODE_TEAM_MEMBER,
  WEALTH_CODE_PILLARS,
  classifyWealthCodesByStars,
  WealthCodeKey,
} from "@/calculation/wealth-code-decoder/wealth-code";

/**
 * Wealth Decoder PDF Generator
 */
export class WealthDecoderPdfGenerator extends BasePdfGenerator {
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
    this.coverBackgroundPath = path.join(__dirname, "../../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../../assets/content-bg.png");
  }

  /** Generate the wealth decoder content */
  protected async generateContent(): Promise<void> {
    // Access kept field to satisfy linter and preserve constructor API compatibility
    if (this.frontendUrl) {
      // No-op: wealth chart renders inline instead of using the frontend URL
    }
    // First 3 pages skeleton: Cover → Agenda → Chart
    await this.generateCoverPage();
    await this.generateAgendaPage();
    await this.generateChartPage();
    await this.generateOverviewPage();
    await this.generateLifePalacePages();
    await this.generateWealthPalacePages();
    await this.generateWealthCodePages();
    await this.generateCareerPalacePages();
    await this.generateExecutionStylePages();
    await this.generateConclusionPage();
  }

  /** Generate cover page */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;
    this.renderCoverPageWealth("WEALTH CODE\nDECODER", this.coverBackgroundPath);
  }

  /** Wealth-specific cover renderer with generous width to avoid word wrapping */
  private renderCoverPageWealth(title: string, backgroundPath: string): void {
    // Background
    this.addBackgroundImage(backgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Title settings (slightly smaller to ensure fit)
    const fontSize = 40;
    const lineSpacing = 10;
    const padding = 28;

    const lines = title.split("\n");
    const estimateWidth = (text: string): number => text.length * fontSize * 0.68; // add width safety factor
    const lineWidths = lines.map((line) => estimateWidth(line));
    const maxLineWidth = Math.max(...lineWidths);

    const textBlockHeight = lines.length * fontSize + (lines.length - 1) * lineSpacing;
    const borderWidth = maxLineWidth + padding * 2 + 20; // extra 20px safety
    const borderHeight = textBlockHeight + padding * 2;

    // Position centered
    const borderX = (pageWidth - borderWidth) / 2;
    const borderY = (pageHeight - borderHeight) / 2;

    // Border
    this.doc
      .lineWidth(3)
      .strokeColor("#1f2937")
      .rect(borderX, borderY, borderWidth, borderHeight)
      .stroke();

    // Title
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

  /** Generate agenda page */
  private async generateAgendaPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Wealth decoder agenda (skeleton): only include the chart page for now
    const items: AgendaItem[] = [
      { text: "Your Zi Wei Chart", page: 3 },
    ];
    
    this.renderAgendaPage(
      "What is in this report",
      this.contentBackgroundPath,
      items
    );
    this.drawPageNumber();
  }

  // Removed getAgendaItems; agenda is rendered via shared renderer

  /** Generate chart page mirroring lifecycle layout (header, personal info, chart) */
  private async generateChartPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Background
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    
    // Header title with underline
    const margin = this.contentMargin;
    const headerTop = Math.round(pageHeight * 0.08);
    const headerText = "WEALTH CODE DECODER";
    const headerFontSize = 30;
    this.doc
      .font(this.fontBoldName)
      .fontSize(headerFontSize)
      .fillColor("#0b0f14")
      .text(headerText, margin, headerTop, { width: pageWidth - margin * 2, align: "center" });
    const lineYBelow = headerTop + headerFontSize + 6;
    const lineInset = margin + 10;
    this.doc
      .moveTo(lineInset, lineYBelow)
      .lineTo(pageWidth - lineInset, lineYBelow)
      .stroke();
    
    // Personal details
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
    const formatBirthTimeRange = (hhmm: string): string => formatHourRangeFromBirthTime(hhmm);
    
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
    
    // Divider
    const dividerY = detailsTop + (labels.length - 1) * rowGap + 26;
    this.doc
      .moveTo(lineInset, dividerY)
      .lineTo(pageWidth - lineInset, dividerY)
      .strokeColor("#0b0f14")
      .lineWidth(1)
      .stroke();
    
    // Section title
    const chartTitle = "PERSONALIZED ZI WEI CHART";
    const chartTitleY = dividerY + 10;
    this.doc
      .font(this.fontBoldName)
      .fontSize(14)
      .fillColor("#0b0f14")
      .text(chartTitle, margin, chartTitleY, { width: pageWidth - margin * 2, align: "center" });
    
    // Render chart inline (no screenshot)
    try {
      const birth = new Date(this.data.birthday);
      const calculator = new ZWDSCalculator({
        year: birth.getFullYear(),
        month: birth.getMonth() + 1,
        day: birth.getDate(),
        hour: extractBirthHour(this.data.birthTime),
        gender: this.data.gender === "female" ? "female" : "male",
        name: this.data.name,
      });
      const chart = calculator.calculate();
      const maxWidth = pageWidth - margin * 2 - 40;
      const chartSize = Math.min(560, maxWidth);
      const chartX = (pageWidth - chartSize) / 2;
      const chartY = chartTitleY + 26;
      this.drawZwdsChart(chart, { x: chartX, y: chartY, size: chartSize, birth, birthTime: this.data.birthTime, gender: this.data.gender, name: this.data.name });
    } catch (error) {
      logger.error("Failed to render chart", error);
      this.doc
        .font(this.fontRegularName)
        .fontSize(16)
        .fillColor("#e74c3c")
        .text("Chart could not be generated", margin, Math.round(pageHeight * 0.45), { width: pageWidth - margin * 2, align: "center" });
    }
    
    this.drawPageNumber();
  }

  /** Draw a minimalist 4x4 Zi Wei chart with center info (shared with lifecycle style). */
  private drawZwdsChart(chart: ChartData, opts: DrawChartOptions): void {
    const { x, y, size, birth, birthTime, gender, name } = opts;
    const cell = size / 4;
    // Outer border
    this.doc.save().lineWidth(1).strokeColor("#0b0f14").rect(x, y, size, size).stroke().restore();
    // Grid lines
    this.doc.save().strokeColor("#0b0f14").lineWidth(0.8);
    for (let i = 1; i < 4; i++) {
      this.doc.moveTo(x + i * cell, y).lineTo(x + i * cell, y + size).stroke();
      this.doc.moveTo(x, y + i * cell).lineTo(x + size, y + i * cell).stroke();
    }
    this.doc.restore();
    // Center box
    const centerX = x + cell;
    const centerY = y + cell;
    const centerSize = cell * 2;
    this.doc.save().rect(centerX, centerY, centerSize, centerSize).fillColor("#ffffff").fill().restore();
    this.doc.save().lineWidth(1).strokeColor("#0b0f14").rect(centerX, centerY, centerSize, centerSize).stroke().restore();
    // Center info
    const lunar = chart.lunarDate;
    const infoPad = 10;
    const infoX = centerX + infoPad;
    const infoY = centerY + infoPad;
    const infoW = centerSize - infoPad * 2;
    const label = (t: string, v: string): void => {
      this.doc.font(this.fontBoldName).fontSize(9).fillColor("#0b0f14").text(t, infoX, this.doc.y, { continued: true });
      this.doc.font(this.fontRegularName).fontSize(9).fillColor("#0b0f14").text(` ${v}`);
    };
    this.doc.font(this.fontBoldName).fontSize(12).fillColor("#0b0f14").text(name, infoX, infoY, { width: infoW, align: "center" });
    this.doc.moveDown(0.4);
    const solar = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, "0")}-${String(birth.getDate()).padStart(2, "0")}`;
    const timeRange = formatHourRangeFromBirthTime(birthTime);
    label("Solar:", solar + " " + timeRange);
    label("Lunar:", `${lunar.year} Year ${lunar.month} Month ${lunar.day} Day${lunar.isLeap ? " (Leap)" : ""}`);
    label("Gender:", gender);
    // No Da Yun labels for wealth chart skeleton
    // Draw palaces
    PALACE_GRID_POSITIONS.forEach((pos) => {
      const palace = chart.palaces[pos.n - 1];
      const px = x + (pos.col - 1) * cell;
      const py = y + (pos.row - 1) * cell;
      const pad = 6;
      const title = palace?.name ? (PALACE_EN_MAP[palace.name] || palace.name) : "";
      // Skip center
      const inCenter = pos.col >= 2 && pos.col <= 3 && pos.row >= 2 && pos.row <= 3;
      if (inCenter) return;
      // Star names (compact)
      if (palace) {
        const sanitize = (raw: string): string => raw.replace(/<[^>]*>/g, "").trim();
        const STAR_EN_FALLBACK: Record<string, string> = {
          "紫微": "Zi Wei",
          "天机": "Tian Ji",
          "太阳": "Tai Yang",
          "武曲": "Wu Qu",
          "天同": "Tian Tong",
          "廉贞": "Lian Zhen",
          "天府": "Tian Fu",
          "太阴": "Tai Yin",
          "贪狼": "Tan Lang",
          "巨门": "Ju Men",
          "天相": "Tian Xiang",
          "天梁": "Tian Liang",
          "七杀": "Qi Sha",
          "破军": "Po Jun",
          "左輔": "Zuo Fu",
          "右弼": "You Bi",
          "文昌": "Wen Chang",
          "文曲": "Wen Qu",
        };
        const toEnglish = (raw: string): string => {
          const clean = sanitize(raw);
          const meta = (STAR_META as Record<string, { name_en: string } | undefined>)[clean];
          if (meta?.name_en) return meta.name_en;
          if (STAR_EN_FALLBACK[clean]) return STAR_EN_FALLBACK[clean];
          return clean;
        };
        const starNames: string[] = [];
        if (Array.isArray(palace.mainStar)) starNames.push(...palace.mainStar.map((s) => toEnglish(s.name)));
        if (Array.isArray(palace.minorStars)) starNames.push(...palace.minorStars.map((s) => toEnglish(s.name)));
        const maxCols = Math.min(3, starNames.length);
        const compactColWidth = 30;
        const colSpacing = 2;
        starNames.forEach((starName: string, index: number) => {
          const colIndex = index % maxCols;
          const rowIndex = Math.floor(index / maxCols);
          const starX = px + pad + colIndex * (compactColWidth + colSpacing);
          const baseY = py + pad + 3 + rowIndex * 35;
          const words = starName.split(" ");
          words.forEach((word: string, wordIndex: number) => {
            const wordY = baseY + wordIndex * 10;
            if (wordY + 10 < py + cell - 28) {
              this.doc.font(this.fontRegularName).fontSize(7).fillColor("#0b0f14")
                .text(word, starX, wordY, { width: compactColWidth, align: "left" });
            }
          });
        });
      }
      // Footer 3-column band
      const barH = 22;
      const rowY = py + cell - barH;
      const footerWidth = cell - 1;
      const colW = footerWidth / 3;
      const textY = rowY + 3;
      this.doc.save().lineWidth(0.8).strokeColor("#0b0f14").rect(px + 0.5, rowY, footerWidth, barH).stroke().restore();
      const sep1X = px + 0.5 + colW;
      const sep2X = px + 0.5 + colW * 2;
      this.doc.save().lineWidth(0.8).strokeColor("#0b0f14")
        .moveTo(sep1X, rowY)
        .lineTo(sep1X, rowY + barH)
        .stroke()
        .moveTo(sep2X, rowY)
        .lineTo(sep2X, rowY + barH)
        .stroke()
        .restore();
      const col1X = px + 0.5;
      this.doc.font(this.fontRegularName).fontSize(6.5).fillColor("#0b0f14");
      const stem = palace?.heavenlyStem ? (STEM_EN_MAP[palace.heavenlyStem] || palace.heavenlyStem) : "";
      const branch = palace?.earthlyBranch ? (BRANCH_EN_MAP[palace.earthlyBranch] || palace.earthlyBranch) : "";
      this.doc.text(stem, col1X, textY, { width: colW, align: "center" });
      this.doc.text(branch, col1X, textY + 8, { width: colW, align: "center" });
      const col2X = px + 0.5 + colW;
      this.doc.text(title, col2X, textY, { width: colW, align: "center" });
      const range = palace?.majorLimit ? `${palace.majorLimit.startAge}-${palace.majorLimit.endAge}` : "";
      if (range) {
        this.doc.text(range, col2X, textY + 8, { width: colW, align: "center" });
      }
      const col3X = px + 0.5 + colW * 2;
      const year = palace?.annualFlow?.year ? String(palace.annualFlow.year) : "";
      const ageAt = palace?.annualFlow?.year ? String(Math.max(0, palace.annualFlow.year - birth.getFullYear() + 1)) : "";
      if (year) this.doc.text(year, col3X, textY, { width: colW, align: "center" });
      if (ageAt) this.doc.text(ageAt, col3X, textY + 8, { width: colW, align: "center" });
    });
  }

  // (helpers moved to module scope below)

  /** Overview page: description, strengths, challenges with watermark */
  private async generateOverviewPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    // Header
    const headerY = Math.round(pageHeight * 0.12);
    this.doc
      .font(this.fontBoldName)
      .fontSize(22)
      .fillColor("#0b0f14")
      .text("OVERVIEW", margin, headerY);

    // Compute chart and life palace
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();
    const lifePalaceIndex = chart.lifePalace - 1;
    const lifePalace = chart.palaces[lifePalaceIndex];

    // Overview description by the first main star in life palace
    const mainStarNameZh = (lifePalace?.mainStar && lifePalace.mainStar[0]?.name) || "";
    const overviewDesc = (OVERVIEW_DESCRIPTION_CONSTANTS as Record<string, { description: string } | undefined>)[mainStarNameZh]?.description || "";

    // Watermark (bottom-right)
    try {
      const wmPath = path.join(__dirname, "../../assets/palace/Life.png");
      if (wmPath) {
        const wmSize = 260;
        const wmX = pageWidth - margin - wmSize;
        const wmY = pageHeight - margin - wmSize - 10;
        this.doc.save().opacity(0.1).image(wmPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
      }
    } catch {}

    // Description body box
    const columnWidth = pageWidth - margin * 2;
    const bodyY = headerY + 36;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(overviewDesc, margin, bodyY, { width: columnWidth, align: "left", lineGap: 5 });

    // Strengths section
    const sectionGap = 32;
    let y = this.doc.y + sectionGap;
    this.doc
      .font(this.fontBoldName)
      .fontSize(14)
      .fillColor("#0b0f14")
      .text("STRENGTHS", margin, y);
    y = this.doc.y + 12;

    const strengths = this.collectLifePalaceTraits(lifePalace, "strengths");
    this.renderTagChips(strengths, margin, y, pageWidth - margin * 2, "green");
    y = this.doc.y + sectionGap;

    // Potential Challenges section
    this.doc
      .font(this.fontBoldName)
      .fontSize(14)
      .fillColor("#0b0f14")
      .text("POTENTIAL CHALLENGES", margin, y);
    y = this.doc.y + 12;
    const cautions = this.collectLifePalaceTraits(lifePalace, "cautions");
    this.renderTagChips(cautions, margin, y, pageWidth - margin * 2, "red");

    this.drawPageNumber();
  }

  /** Life Palace: bar breakdown + first star meaning, then additional star meaning pages (2 per page) */
  private async generateLifePalacePages(): Promise<void> {
    // Compute chart and life palace
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();
    const lifePalaceIndex = chart.lifePalace - 1;
    const lifePalace = chart.palaces[lifePalaceIndex];
    const mainStarsZh: string[] = Array.isArray(lifePalace?.mainStar)
      ? lifePalace!.mainStar.map((s) => s.name)
      : [];

    // Page 1: Bars + first star meaning
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    // Header block
    const headerTop = Math.round(pageHeight * 0.08);
    this.doc
      .font(this.fontBoldName)
      .fontSize(18)
      .fillColor("#0b0f14")
      .text("DIVING INTO", margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text("LIFE PALACE", margin, this.doc.y + 4);
    // Icon top-right
    try {
      const iconPath = path.join(__dirname, "../../assets/palace/Life.png");
      const size = 80;
      const x = pageWidth - margin - size;
      const y = headerTop - 6;
      this.doc.image(iconPath, x, y, { width: size, height: size });
    } catch {}

    // Bars area
    const barsTop = this.doc.y + 18;
    const barH = 12;
    const rowGap = 18;

    const normalizeName = (n: string): import("@/calculation/wealth-code-decoder/life-bars").StarKey | null => {
      // Map traditional to simplified variants used in life-bars StarKey
      const map: Record<string, string> = { "左輔": "左辅" };
      const key = (map[n] || n) as import("@/calculation/wealth-code-decoder/life-bars").StarKey;
      const allowed: ReadonlyArray<string> = [
        "紫微","破军","天府","廉贞","太阴","贪狼","巨门","天同","天相","武曲","天梁","太阳","七杀","天机","左辅","右弼","文昌","文曲",
      ];
      return allowed.includes(key) ? key : null;
    };
    const majors: import("@/calculation/wealth-code-decoder/life-bars").StarKey[] = [];
    mainStarsZh.forEach((n) => { const k = normalizeName(n); if (k) majors.push(k); });
    const { computeLifeBars } = await import("@/calculation/wealth-code-decoder/life-bars");
    const lifeBars = computeLifeBars(majors, []);

    const bars: ReadonlyArray<{ label: string; value: number }> = [
      { label: "IDENTITY & CONFIDENCE", value: lifeBars.identityConfidence },
      { label: "DRIVE & INITIATIVE", value: lifeBars.driveInitiative },
      { label: "ADAPTABILITY", value: lifeBars.adaptability },
      { label: "EMOTIONAL POISE", value: lifeBars.emotionalPoise },
      { label: "CLARITY & JUDGMENT", value: lifeBars.clarityJudgment },
    ];

    let yy = barsTop;
    bars.forEach(({ label, value }) => {
      // label on top with enough width to prevent wrapping
      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(label, margin, yy, { width: pageWidth - margin * 2 - 100, align: "left" });

      // value right-aligned on same line as label
      this.doc
        .font(this.fontBoldName)
      .fontSize(16)
        .fillColor("#0b0f14")
        .text(String(value), pageWidth - margin - 80, yy, { width: 60, align: "right" });

      // bar below label
      const bx = margin;
      const by = yy + 24;
      this.drawBar(bx, by, pageWidth - margin * 2, barH, value);

      yy += 24 + barH + rowGap;
    });

    // Star watermark faint behind bottom section
    try {
      const firstStarZh = mainStarsZh[0] || "";
      const starIconPath = this.getStarIconPath(firstStarZh);
      if (starIconPath) {
        const wmSize = 340;
        const wmX = margin + 60;
        const wmY = pageHeight - wmSize - margin - 30;
        this.doc.save().opacity(0.06).image(starIconPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
      }
    } catch {}

    // Star meaning section (first star only)
    const firstStarZh = mainStarsZh[0] || "";
    const starBlockTop = yy + 8;
    this.renderLifeStarMeaningBlock(firstStarZh, starBlockTop);

    this.drawPageNumber();

    // Additional stars: 2 per page, without bars
    const remaining = mainStarsZh.slice(1);
    if (remaining.length > 0) {
      let index = 0;
      while (index < remaining.length) {
        this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");
        const top = Math.round(pageHeight * 0.12);
        // Watermark for first star on this page
        try {
          const s1 = remaining[index] || "";
          const p1 = this.getStarIconPath(s1);
          if (p1) {
            const wmSize = 300;
            const wmX = margin + 60;
            const wmY = top + 40;
            this.doc.save().opacity(0.06).image(p1, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
          }
        } catch {}
        this.renderLifeStarMeaningBlock(remaining[index] || "", top);
        if (remaining[index + 1]) {
          // Watermark for second star on this page
          try {
            const s2 = remaining[index + 1] || "";
            const p2 = this.getStarIconPath(s2);
            if (p2) {
              const wmSize2 = 300;
              const wmX2 = margin + 60;
              const wmY2 = top + 260 + 40;
              this.doc.save().opacity(0.06).image(p2, wmX2, wmY2, { width: wmSize2, height: wmSize2 }).opacity(1).restore();
            }
          } catch {}
          this.renderLifeStarMeaningBlock(remaining[index + 1] || "", top + 260);
        }
        this.drawPageNumber();
        index += 2;
      }
    }
  }

  /** Draw a single life star meaning block (title + copy + small icon) */
  private renderLifeStarMeaningBlock(starZh: string, topY: number): void {
    const pageWidth = this.doc.page.width;
    const margin = this.contentMargin;
    const meta = (STAR_META as Record<string, { name_en: string } | undefined>)[starZh];
    const starEn = (meta?.name_en || starZh).toUpperCase();

    // small round icon right
    try {
      const iconPath = path.join(__dirname, "../../assets/icons/Seal.png");
      const size = 54;
      const x = pageWidth - margin - size;
      const y = topY + 4;
      if (iconPath) this.doc.image(iconPath, x, y, { width: size, height: size });
    } catch {}

    // Get star metadata
    const starMeta = this.getStarMeta(starZh);
    const starTitle = starMeta?.title || "";

    // Calculate positions for star name and star image
    const starNameWidth = pageWidth - margin * 2 - 100; // Reserve space for star image
    const starImageSize = 64;
    const starImageX = pageWidth - margin - starImageSize;

    // Heading
    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text("STARS WITHIN", margin, topY);

    // Store Y position after "STARS WITHIN" for star name positioning
    const starNameY = this.doc.y + 2;

    // Star name
    this.doc
      .font(this.fontBoldName)
      .fontSize(48)
      .fillColor("#B9625C")
      .text(starEn, margin, starNameY, { width: starNameWidth, align: "left" });

    // Star title (bold, 16px)
    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#B9625C")
      .text(starTitle, margin, this.doc.y + 2);

    // Calculate star image Y position to center it with star name + title
    const titleEndY = this.doc.y;
    const totalTextHeight = titleEndY - starNameY;
    const starImageY = starNameY + (totalTextHeight / 2) - (starImageSize / 2);

    // Star image on the right, centered with star name + title
    try {
      const starIconPath = this.getStarIconPath(starZh);
      if (starIconPath) {
        this.doc.image(starIconPath, starImageX, starImageY, { width: starImageSize, height: starImageSize });
      }
    } catch {}

    // Description
    const norm = ((): string => {
      const map: Record<string, string> = { "左輔": "左辅" };
      return map[starZh] || starZh;
    })();
    const meaning = (STAR_LIFE_MEANINGS as Record<string, string | undefined>)[norm] || "";
    const bodyWidth = pageWidth - margin * 2;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(meaning, margin, this.doc.y + 6, { width: bodyWidth, align: "left", lineGap: 4 });
  }

  /** Render a single horizontal progress bar (0..100) */
  private drawBar(x: number, y: number, width: number, height: number, value: number): void {
    const pct = Math.max(0, Math.min(100, value));
    const fillW = Math.round((pct / 100) * width);
    // background
    this.doc.save().fillColor("#f3f4f6").rect(x, y, width, height).fill().restore();
    // fill
    this.doc.save().fillColor("#d4af37").rect(x, y, fillW, height).fill().restore();
    // border
    this.doc.save().lineWidth(0.6).strokeColor("#d1d5db").rect(x, y, width, height).stroke().restore();
  }

  /** Collect strengths or cautions for all stars in life palace using DATASET_1 命宫 */
  private collectLifePalaceTraits(
    lifePalace: ChartData["palaces"][number] | undefined,
    traitKey: "strengths" | "cautions"
  ): string[] {
    const results: string[] = [];
    if (!lifePalace) return results;
    const allStars: string[] = [];
    if (Array.isArray(lifePalace.mainStar)) allStars.push(...lifePalace.mainStar.map(s => s.name));
    if (Array.isArray(lifePalace.minorStars)) allStars.push(...lifePalace.minorStars.map(s => s.name));
    if (lifePalace.bodyStar) allStars.push(lifePalace.bodyStar.name);
    if (lifePalace.lifeStar) allStars.push(lifePalace.lifeStar.name);

    const dataset: Record<string, any> = DATASET_1 as unknown as Record<string, any>;
    allStars.forEach((starZh) => {
      const node = dataset[starZh]?.["命宫"]; // use 命宫 section
      if (!node) return;
      const val = node[traitKey];
      if (typeof val === "string" && val.length > 0) {
        // comma or Chinese comma separated; also allow ideographic comma
        const parts = val.split(/[，,]/).map(s => s.trim()).filter(Boolean);
        results.push(...parts);
      }
    });
    // De-dup and cap size to avoid overflow
    const seen = new Set<string>();
    const unique = results.filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 24);
  }

  /** Render simple pill chips horizontally wrapping within width */
  private renderTagChips(items: string[], x: number, y: number, maxWidth: number, color: "green" | "red" = "green"): void {
    const padX = 10;
    const padY = 6;
    const gap = 8;
    let cursorX = x;
    let cursorY = y;
    this.doc.font(this.fontRegularName).fontSize(10);
    
    // Color scheme based on type
    const colors = {
      green: { bg: "#dcfce7", text: "#166534" },
      red: { bg: "#fee2e2", text: "#dc2626" }
    };
    const scheme = colors[color];
    
    items.forEach((label) => {
      const textWidth = this.getTextWidth(label, 10);
      const chipW = textWidth + padX * 2;
      const chipH = 20;
      if (cursorX + chipW > x + maxWidth) {
        cursorX = x;
        cursorY += chipH + gap;
      }
      // chip background
      this.doc.save().fillColor(scheme.bg).roundedRect(cursorX, cursorY, chipW, chipH, 6).fill().restore();
      // text
      this.doc.fillColor(scheme.text).text(label, cursorX + padX, cursorY + padY - 2, { width: chipW - padX * 2, align: "center" });
      cursorX += chipW + gap;
    });
    // move internal cursor for subsequent content
    this.doc.moveTo(x, cursorY + 24);
  }

  // Conclusion page not included in the initial wealth decoder skeleton

  /** Map Chinese star name to icon file path */
  private getStarIconPath(starZh: string): string | null {
    const starNameMap: Record<string, string> = {
      "紫微": "ZiWei.png",
      "破军": "PoJun.png", 
      "天府": "TianFu.png",
      "廉贞": "LianZhen.png",
      "太阴": "TaiYin.png",
      "贪狼": "TanLang.png",
      "巨门": "JuMen.png",
      "天同": "TianTong.png",
      "天相": "TianXiang.png",
      "武曲": "WuQu.png",
      "天梁": "TianLiang.png",
      "太阳": "TaiYang.png",
      "七杀": "QiSha.png",
      "天机": "TianJi.png",
      "左輔": "ZuoFu.png",
      "右弼": "YouBi.png",
      "文昌": "WenChang.png",
      "文曲": "WenQu.png",
    };
    
    const fileName = starNameMap[starZh];
    if (!fileName) return null;
    
    return path.join(__dirname, "../../assets/stars", fileName);
  }

  /** Get star metadata from STAR_META */
  private getStarMeta(starZh: string): { name_en: string; title: string; type: string; description: string } | null {
    // Import from life-cycle-decoder constants since it has the STAR_META
    const { STAR_META } = require("../../calculation/life-cycle-decoder/constants");
    const norm = ((): string => {
      const map: Record<string, string> = { "左輔": "左辅" };
      return map[starZh] || starZh;
    })();
    return STAR_META[norm] || null;
  }

  /** Estimate text height for layout calculations */
  private getTextHeight(text: string, width: number, fontSize: number, lineGap: number = 0): number {
    // Rough estimate: characters per line based on font size and width
    const charsPerLine = Math.floor(width / (fontSize * 0.5));
    const lines = Math.ceil(text.length / charsPerLine);
    return lines * fontSize + (lines - 1) * lineGap;
  }

  /** Wealth Palace: bar breakdown + first star meaning, then additional star meaning pages (2 per page) */
  private async generateWealthPalacePages(): Promise<void> {
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
        name: this.data.name,
      });
    const chart = calculator.calculate();

    // Wealth palace is the 5th palace from Life: index 4 if lifePalace is index 0
    const wealthPalaceIndex = (chart.lifePalace - 1 + 4) % 12;
    let wealthPalace = chart.palaces[wealthPalaceIndex];
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    let mainStarsZh: string[] = Array.isArray(wealthPalace?.mainStar)
      ? wealthPalace!.mainStar.map((s) => s.name)
      : [];
    // Fallback to opposite palace if no stars
    if (mainStarsZh.length === 0) {
      const oppositeZh = OPPOSITE_PALACE_INFLUENCE[(wealthPalace?.name as keyof typeof OPPOSITE_PALACE_INFLUENCE) || "财帛"];
      const opposite = chart.palaces.find(p => p.name === oppositeZh);
      if (opposite?.mainStar && opposite.mainStar.length > 0) {
        wealthPalace = opposite;
        mainStarsZh = opposite.mainStar.map(s => s.name);
      }
    }

    // Compute wealth bars
    const normalizeName = (n: string): import("@/calculation/wealth-code-decoder/career-bars").StarKey | null => {
      const replace: Record<string, string> = { "左輔": "左辅" };
      const m = replace[n] || n;
      const allowed = [
        "紫微","破军","天府","廉贞","太阴","贪狼","巨门","天同","天相","武曲","天梁","太阳","七杀","天机","左辅","右弼","文昌","文曲",
      ];
      return allowed.includes(m) ? (m as any) : null;
    };
    const majors = mainStarsZh.map(normalizeName).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const wealthBars = computeWealthBars(majors, []);

    // Page 1: Bars + first star meaning
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");
    
    // Header
    const headerTop = Math.round(pageHeight * 0.12);
      this.doc
      .font(this.fontBoldName)
      .fontSize(18)
      .fillColor("#0b0f14")
      .text("UNDERSTANDING YOUR", margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text("WEALTH PALACE", margin, this.doc.y + 4);
    // Icon
    try {
      const iconPath = path.join(__dirname, "../../assets/palace/Wealth.png");
      const size = 80;
      const x = pageWidth - margin - size;
      const y = headerTop - 6;
      this.doc.image(iconPath, x, y, { width: size, height: size });
    } catch {}

    // Bars
    const barsTop = this.doc.y + 18;
    const barH = 12;
    const rowGap = 18;
    const bars = [
      { label: "EARNING DRIVE", value: wealthBars.earningDrive },
      { label: "ASSET STRATEGY", value: wealthBars.assetStrategy },
      { label: "RISK LEVERAGE", value: wealthBars.riskLeverage },
      { label: "MONEY DISCIPLINE", value: wealthBars.moneyDiscipline },
      { label: "DEAL FLOW & NETWORK", value: wealthBars.dealFlowNetwork },
    ];
    let yy = barsTop;
    bars.forEach(({ label, value }) => {
      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(label, margin, yy, { width: pageWidth - margin * 2 - 100, align: "left" });

      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(String(value), pageWidth - margin - 80, yy, { width: 60, align: "right" });

      const bx = margin;
      const by = yy + 24;
      this.drawBar(bx, by, pageWidth - margin * 2, barH, value);
      yy += 24 + barH + rowGap;
    });

    // Star watermark (first star icon)
    try {
      const firstStarZh = mainStarsZh[0] || "";
      const starIconPath = this.getStarIconPath(firstStarZh);
      if (starIconPath) {
        const wmSize = 340;
        const wmX = margin + 60;
        const wmY = pageHeight - wmSize - margin - 30;
        this.doc.save().opacity(0.06).image(starIconPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
      }
    } catch {}

    // First star meaning block
    const firstStarZh = mainStarsZh[0] || "";
    const starBlockTop = yy + 8;
    this.renderWealthStarMeaningBlock(firstStarZh, starBlockTop);

    this.drawPageNumber();

    // Additional stars (2 per page)
    const remaining = mainStarsZh.slice(1);
    if (remaining.length > 0) {
      let index = 0;
      while (index < remaining.length) {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");
        const top = Math.round(pageHeight * 0.12);
        // Watermark for first star on this page
        try {
          const s1 = remaining[index] || "";
          const p1 = this.getStarIconPath(s1);
          if (p1) {
            const wmSize = 300;
            const wmX = margin + 60;
            const wmY = top + 40;
            this.doc.save().opacity(0.06).image(p1, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
          }
        } catch {}
        this.renderWealthStarMeaningBlock(remaining[index] || "", top);
        if (remaining[index + 1]) {
          // Watermark for second star on this page
          try {
            const s2 = remaining[index + 1] || "";
            const p2 = this.getStarIconPath(s2);
            if (p2) {
              const wmSize2 = 300;
              const wmX2 = margin + 60;
              const wmY2 = top + 260 + 40;
              this.doc.save().opacity(0.06).image(p2, wmX2, wmY2, { width: wmSize2, height: wmSize2 }).opacity(1).restore();
            }
          } catch {}
          this.renderWealthStarMeaningBlock(remaining[index + 1] || "", top + 260);
        }
        this.drawPageNumber();
        index += 2;
      }
    }
  }

  /** Render Wealth star meaning block using STAR_WEALTH_MEANINGS */
  private renderWealthStarMeaningBlock(starZh: string, topY: number): void {
    const pageWidth = this.doc.page.width;
    const margin = this.contentMargin;
    const meta = (STAR_META as Record<string, { name_en: string } | undefined>)[starZh];
    const starEn = (meta?.name_en || starZh).toUpperCase();

    // Heading + star image alignment (same style as life star block)
    const starMeta = this.getStarMeta(starZh);
    const starTitle = starMeta?.title || "";
    const starNameWidth = pageWidth - margin * 2 - 100;
    const starImageSize = 64;
    const starImageX = pageWidth - margin - starImageSize;
    
    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text("STARS WITHIN", margin, topY);

    const starNameY = this.doc.y + 2;
    this.doc
      .font(this.fontBoldName)
      .fontSize(48)
      .fillColor("#B9625C")
      .text(starEn, margin, starNameY, { width: starNameWidth, align: "left" });
    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#B9625C")
      .text(starTitle, margin, this.doc.y + 2);

    const titleEndY = this.doc.y;
    const totalTextHeight = titleEndY - starNameY;
    const starImageY = starNameY + (totalTextHeight / 2) - (starImageSize / 2);
    try {
      const starIconPath = this.getStarIconPath(starZh);
      if (starIconPath) {
        this.doc.image(starIconPath, starImageX, starImageY, { width: starImageSize, height: starImageSize });
      }
    } catch {}

    // Description from STAR_WEALTH_MEANINGS
    const norm = ((): string => {
      const map: Record<string, string> = { "左輔": "左辅" };
      return map[starZh] || starZh;
    })();
    const meaning = (STAR_WEALTH_MEANINGS as Record<string, string | undefined>)[norm] || "";
    const bodyWidth = pageWidth - margin * 2;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(meaning, margin, this.doc.y + 6, { width: bodyWidth, align: "left", lineGap: 4 });
  }

  /** Career Palace: bar breakdown + first star meaning, then additional star meaning pages (2 per page) */
  private async generateCareerPalacePages(): Promise<void> {
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
        name: this.data.name,
      });
    const chart = calculator.calculate();

    // Career palace is the 7th palace from Life: index 6 if lifePalace is index 0
    const careerPalaceIndex = (chart.lifePalace - 1 + 6) % 12;
    let careerPalace = chart.palaces[careerPalaceIndex];
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;
    const margin = this.contentMargin;

    let mainStarsZh: string[] = Array.isArray(careerPalace?.mainStar)
      ? careerPalace!.mainStar.map((s) => s.name)
      : [];
    // Fallback to opposite palace if no stars
    if (mainStarsZh.length === 0) {
      const oppositeZh = OPPOSITE_PALACE_INFLUENCE[(careerPalace?.name as keyof typeof OPPOSITE_PALACE_INFLUENCE) || "官禄"];
      const opposite = chart.palaces.find(p => p.name === oppositeZh);
      if (opposite?.mainStar && opposite.mainStar.length > 0) {
        careerPalace = opposite;
        mainStarsZh = opposite.mainStar.map(s => s.name);
      }
    }

    // Compute career bars
    const normalizeName = (n: string): import("@/calculation/wealth-code-decoder/wealth-bars").StarKey | null => {
      const replace: Record<string, string> = { "左輔": "左辅" };
      const m = replace[n] || n;
      const allowed = [
        "紫微","破军","天府","廉贞","太阴","贪狼","巨门","天同","天相","武曲","天梁","太阳","七杀","天机","左辅","右弼","文昌","文曲",
      ];
      return allowed.includes(m) ? (m as any) : null;
    };
    const majors = mainStarsZh.map(normalizeName).filter((s): s is NonNullable<typeof s> => Boolean(s));
    const careerBars = computeCareerBars(majors, []);

    // Page 1: Bars + first star meaning
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    // Header
    const headerTop = Math.round(pageHeight * 0.12);
      this.doc
      .font(this.fontBoldName)
      .fontSize(18)
      .fillColor("#0b0f14")
      .text("UNDERSTANDING YOUR", margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text("CAREER PALACE", margin, this.doc.y + 4);
    // Icon
    try {
      const iconPath = path.join(__dirname, "../../assets/palace/Career.png");
      const size = 80;
      const x = pageWidth - margin - size;
      const y = headerTop - 6;
      this.doc.image(iconPath, x, y, { width: size, height: size });
    } catch {}

    // Bars
    const barsTop = this.doc.y + 18;
    const barH = 12;
    const rowGap = 18;
    const bars = [
      { label: "DECISION SPEED", value: careerBars.decisionSpeed },
      { label: "STRUCTURE PREFERENCE", value: careerBars.structurePref },
      { label: "RISK TOLERANCE", value: careerBars.riskTolerance },
      { label: "COLLABORATION", value: careerBars.collaboration },
      { label: "CLARITY & FOCUS", value: careerBars.clarityFocus },
    ];
    let yy = barsTop;
    bars.forEach(({ label, value }) => {
      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(label, margin, yy, { width: pageWidth - margin * 2 - 100, align: "left" });

      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(String(value), pageWidth - margin - 80, yy, { width: 60, align: "right" });

      const bx = margin;
      const by = yy + 24;
      this.drawBar(bx, by, pageWidth - margin * 2, barH, value);
      yy += 24 + barH + rowGap;
    });

    // Star watermark (first star icon)
    try {
      const firstStarZh = mainStarsZh[0] || "";
      const starIconPath = this.getStarIconPath(firstStarZh);
      if (starIconPath) {
        const wmSize = 340;
        const wmX = margin + 60;
        const wmY = pageHeight - wmSize - margin - 30;
        this.doc.save().opacity(0.06).image(starIconPath, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
      }
    } catch {}

    // First star meaning block
    const firstStarZh = mainStarsZh[0] || "";
    const starBlockTop = yy + 8;
    this.renderCareerStarMeaningBlock(firstStarZh, starBlockTop);

    this.drawPageNumber();

    // Additional stars (2 per page)
    const remaining = mainStarsZh.slice(1);
    if (remaining.length > 0) {
      let index = 0;
      while (index < remaining.length) {
        this.doc.addPage();
        this.currentPage++;
        this.addBackgroundImage(this.contentBackgroundPath, "center");
        const top = Math.round(pageHeight * 0.12);
        // Watermark for first star on this page
        try {
          const s1 = remaining[index] || "";
          const p1 = this.getStarIconPath(s1);
          if (p1) {
            const wmSize = 300;
            const wmX = margin + 60;
            const wmY = top + 40;
            this.doc.save().opacity(0.06).image(p1, wmX, wmY, { width: wmSize, height: wmSize }).opacity(1).restore();
          }
        } catch {}
        this.renderCareerStarMeaningBlock(remaining[index] || "", top);
        if (remaining[index + 1]) {
          // Watermark for second star on this page
          try {
            const s2 = remaining[index + 1] || "";
            const p2 = this.getStarIconPath(s2);
            if (p2) {
              const wmSize2 = 300;
              const wmX2 = margin + 60;
              const wmY2 = top + 260 + 40;
              this.doc.save().opacity(0.06).image(p2, wmX2, wmY2, { width: wmSize2, height: wmSize2 }).opacity(1).restore();
            }
          } catch {}
          this.renderCareerStarMeaningBlock(remaining[index + 1] || "", top + 260);
        }
        this.drawPageNumber();
        index += 2;
      }
    }
  }

  /** Execution Style pages: classify execution style and render two pages per matched type */
  private async generateExecutionStylePages(): Promise<void> {
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    // Use Career palace stars for execution style classification
    const careerPalaceIndex = (chart.lifePalace - 1 + 6) % 12;
    let careerPalace = chart.palaces[careerPalaceIndex];
    let starsZh: string[] = [];
    
    if (careerPalace?.mainStar) {
      starsZh = careerPalace.mainStar.map(s => s.name);
    }

    // Fallback to opposite palace if no stars in career palace
    if (starsZh.length === 0) {
      const oppositeZh = OPPOSITE_PALACE_INFLUENCE[(careerPalace?.name as keyof typeof OPPOSITE_PALACE_INFLUENCE) || "官禄"];
      const opposite = chart.palaces.find(p => p.name === oppositeZh);
      if (opposite?.mainStar) {
        starsZh = opposite.mainStar.map(s => s.name);
      }
    }

    if (starsZh.length === 0) return;

    // Classify execution style
    const result = classifyExecution(starsZh as StarKey[]);
    const executionType = result.type.split(" ")[1] as keyof typeof EXECUTION_STYLE_DESCRIPTION; // Extract English name only

    // Page 1: Description + Boss/Employee sections
    this.renderExecutionStyleDescriptionPage(executionType);
    
    // Page 2: How to Leverage (3 points)
    this.renderExecutionStyleLeveragePage(executionType);
  }

  /** Render Execution Style description page (Page 1) */
  private renderExecutionStyleDescriptionPage(executionType: keyof typeof EXECUTION_STYLE_DESCRIPTION): void {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const margin = this.contentMargin;
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Header
    const headerTop = Math.round(pageHeight * 0.12);
    const preTitle = "YOUR EXECUTION STYLE";
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text(preTitle, margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text(String(executionType).toUpperCase(), margin, this.doc.y + 4);

    const bodyTop = this.doc.y + 16;
    const colGap = 24;
    const colWidth = (pageWidth - margin * 2 - colGap) / 2;

    // Left column: description
    const desc = EXECUTION_STYLE_DESCRIPTION[executionType] as string || "";
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(desc, margin, bodyTop, { width: colWidth, align: "left", lineGap: 3 });

    // Right column: larger image with border radius
    try {
      const imageMap: Record<string, string> = {
        "Commander": "commander.png",
        "Architect": "architect.png", 
        "Catalyst": "catalyst.png",
        "Integrator": "integrator.png",
      };
      const fileName = imageMap[executionType];
      const imgPath = path.join(__dirname, "../../assets/execution-style", fileName || "");
      const imgW = colWidth * 0.8; // Make image smaller
      const imgH = imgW * 1.4; // Adjust aspect ratio
      const imgX = margin + colWidth + colGap + (colWidth - imgW) / 2; // Center the image
      // No border radius - clean rectangle
      this.doc.image(imgPath, imgX, bodyTop, { width: imgW, height: imgH, fit: [imgW, imgH] });
    } catch {}

    // Calculate where description text ends to position bottom sections properly
    const descHeight = this.getTextHeight(desc, colWidth, 12, 3);
    const blockTop = Math.max(bodyTop + descHeight + 60, bodyTop + 350); // Move sections further down
    const leftTitle = "AS A TEAM LEADER";
    const rightTitle = "AS A TEAM MEMBER";
    const leftCopy = EXECUTION_STYLE_LEADERSHIP[executionType] as string || "";
    const rightCopy = EXECUTION_STYLE_TEAM_MEMBER[executionType] as string || "";

    // Left block
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(leftTitle, margin, blockTop);
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(leftCopy, margin, this.doc.y + 4, { width: colWidth, align: "left", lineGap: 3 });

    // Right block - positioned at same Y as left block
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(rightTitle, margin + colWidth + colGap, blockTop);
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(rightCopy, margin + colWidth + colGap, blockTop + 16, { width: colWidth, align: "left", lineGap: 3 });

    this.drawPageNumber();
  }

  /** Render Execution Style leverage page (Page 2) */
  private renderExecutionStyleLeveragePage(executionType: keyof typeof EXECUTION_STYLE_LEVERAGE): void {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const margin = this.contentMargin;
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Header with updated font sizes
    const headerTop = Math.round(pageHeight * 0.08); // Start higher on page
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text(`AS A ${String(executionType).toUpperCase()}`, margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text("HOW TO LEVERAGE", margin, this.doc.y + 4);
    this.doc
      .font(this.fontBoldName)
      .fontSize(20)
      .fillColor("#0b0f14")
      .text("TO MAXIMIZE", margin, this.doc.y + 8);

    // Get leverage points from EXECUTION_STYLE_LEVERAGE
    const leveragePoints = EXECUTION_STYLE_LEVERAGE[executionType] as Array<{title: string, description: string}> || [];
    
    const sectionGap = 60;
    const contentTop = this.doc.y + 40;
    
    // Calculate spacing to distribute content evenly
    const availableHeight = pageHeight - contentTop - margin - 60; // Reserve space for page number
    const spacingBetween = Math.min(sectionGap, (availableHeight - leveragePoints.length * 120) / (leveragePoints.length - 1));
    
    leveragePoints.forEach((point, index) => {
      const yPos = contentTop + index * (120 + spacingBetween);
      
      // Large number
      this.doc
        .font(this.fontBoldName)
        .fontSize(96) // Increased from original size
        .fillColor("#d4af37")
        .text(`${index + 1}`, margin, yPos);
      
      // Title and description
      const textX = margin + 80;
      const textWidth = pageWidth - textX - margin;
      
      this.doc
        .font(this.fontBoldName)
        .fontSize(16)
        .fillColor("#0b0f14")
        .text(point.title.toUpperCase(), textX, yPos + 8, { width: textWidth, align: "left" });

    this.doc
      .font(this.fontRegularName)
        .fontSize(12)
        .fillColor("#0b0f14")
        .text(point.description, textX, this.doc.y + 6, { width: textWidth, align: "left", lineGap: 3 });
    });

    this.drawPageNumber();
  }

  /** Generate conclusion page (new design) */
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

    // Footer note + disclaimer
    y = this.doc.y + 28;
    this.doc
      .font(this.fontBoldName)
      .fontSize(10)
      .fillColor("#1f2937")
      .text("A REPORT MADE FROM ZI WEI DOU SHU READING", margin, y);
    y = this.doc.y + 6;
    this.doc
      .font(this.fontRegularName)
      .fontSize(8)
      .fillColor("#6b7280")
      .text(
        "Disclaimer: This Zi Wei Dou Shu report is interpretive and for personal insight only. It isn’t medical, legal, or financial advice. Your choices and actions remain your own.",
        margin,
        y,
        { width: bodyWidth, align: "left", lineGap: 2 }
      );

    this.drawPageNumber();
  }

  /** Render Career star meaning block using STAR_CAREER_MEANINGS */
  private renderCareerStarMeaningBlock(starZh: string, topY: number): void {
    const pageWidth = this.doc.page.width;
    const margin = this.contentMargin;
    const meta = (STAR_META as Record<string, { name_en: string } | undefined>)[starZh];
    const starEn = (meta?.name_en || starZh).toUpperCase();

    // Heading + star image alignment (same style as other star blocks)
    const starMeta = this.getStarMeta(starZh);
    const starTitle = starMeta?.title || "";
    const starNameWidth = pageWidth - margin * 2 - 100;
    const starImageSize = 64;
    const starImageX = pageWidth - margin - starImageSize;

    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text("STARS WITHIN", margin, topY);

    const starNameY = this.doc.y + 2;
    this.doc
      .font(this.fontBoldName)
      .fontSize(48)
      .fillColor("#B9625C")
      .text(starEn, margin, starNameY, { width: starNameWidth, align: "left" });
    this.doc
      .font(this.fontBoldName)
      .fontSize(16)
      .fillColor("#B9625C")
      .text(starTitle, margin, this.doc.y + 2);

    const titleEndY = this.doc.y;
    const totalTextHeight = titleEndY - starNameY;
    const starImageY = starNameY + (totalTextHeight / 2) - (starImageSize / 2);
    try {
      const starIconPath = this.getStarIconPath(starZh);
      if (starIconPath) {
        this.doc.image(starIconPath, starImageX, starImageY, { width: starImageSize, height: starImageSize });
      }
    } catch {}

    // Description from STAR_CAREER_MEANINGS
    const norm = ((): string => {
      const map: Record<string, string> = { "左輔": "左辅" };
      return map[starZh] || starZh;
    })();
    const meaning = (STAR_CAREER_MEANINGS as Record<string, string | undefined>)[norm] || "";
    const bodyWidth = pageWidth - margin * 2;
    this.doc
      .font(this.fontRegularName)
      .fontSize(16)
      .fillColor("#0b0f14")
      .text(meaning, margin, this.doc.y + 6, { width: bodyWidth, align: "left", lineGap: 4 });
  }

  /** Wealth Code pages: for each matched code, render two pages */
  private async generateWealthCodePages(): Promise<void> {
    const birth = new Date(this.data.birthday);
    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
      gender: this.data.gender === "female" ? "female" : "male",
      name: this.data.name,
    });
    const chart = calculator.calculate();

    // Use Wealth palace stars as input for classification (fallback to opposite if none)
    const wealthIdx = (chart.lifePalace - 1 + 4) % 12;
    const wealthPalace = chart.palaces[wealthIdx];
    let starsZh: string[] = [];
    if (wealthPalace?.mainStar) starsZh = wealthPalace.mainStar.map(s => s.name);
    if (starsZh.length === 0) {
      const oppositeZh = OPPOSITE_PALACE_INFLUENCE[(wealthPalace?.name as keyof typeof OPPOSITE_PALACE_INFLUENCE) || "财帛"];
      const opposite = chart.palaces.find(p => p.name === oppositeZh);
      if (opposite?.mainStar) starsZh = opposite.mainStar.map(s => s.name);
    }

    const codes: WealthCodeKey[] = classifyWealthCodesByStars(starsZh, { limit: 4 });
    if (codes.length === 0) return;

    codes.forEach((code, index) => {
      // Page A: Alternative Path with image and two columns (boss/employee)
      this.renderWealthCodeAltPathPage(code, index === 0);
      // Page B: What to focus on (3 pillars)
      this.renderWealthCodePillarsPage(code);
    });
  }

  private renderWealthCodeAltPathPage(code: WealthCodeKey, isFirst: boolean): void {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const margin = this.contentMargin;
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Header
    const headerTop = Math.round(pageHeight * 0.12);
    const preTitle = isFirst ? "YOUR WEALTH CODE" : "ALTERNATIVE PATH";
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text(preTitle, margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text(code.toUpperCase(), margin, this.doc.y + 4);

    const bodyTop = this.doc.y + 16;
    const colGap = 24;
    const colWidth = (pageWidth - margin * 2 - colGap) / 2;

    // Left column: description
    const desc = WEALTH_CODE_DESCRIPTION[code] || "";
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(desc, margin, bodyTop, { width: colWidth, align: "left", lineGap: 3 });

    // Right column: larger image with border radius
    try {
      const imageMap: Record<WealthCodeKey, string> = {
        "Strategy Planner": "strategy-planner.png",
        "Investment Brain": "investment-brain.png",
        "Branding Magnet": "branding-magnet.png",
        "Collaborator": "collaborator.png",
      };
      const fileName = imageMap[code];
      const imgPath = path.join(__dirname, "../../assets/wealth-code", fileName);
      const imgW = colWidth * 0.8; // Make image smaller
      const imgH = imgW * 1.4; // Adjust aspect ratio
      const imgX = margin + colWidth + colGap + (colWidth - imgW) / 2; // Center the image
      // No border radius - clean rectangle
      this.doc.image(imgPath, imgX, bodyTop, { width: imgW, height: imgH, fit: [imgW, imgH] });
    } catch {}

    // Calculate where description text ends to position bottom sections properly
    const descHeight = this.getTextHeight(desc, colWidth, 12, 3);
    const blockTop = Math.max(bodyTop + descHeight + 60, bodyTop + 350); // Move "AS A BOSS/EMPLOYEE" sections further down
    const leftTitle = "AS A BOSS";
    const rightTitle = "AS AN EMPLOYEE";
    const leftCopy = WEALTH_CODE_LEADERSHIP[code] || "";
    const rightCopy = WEALTH_CODE_TEAM_MEMBER[code] || "";

    // Left block
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(leftTitle, margin, blockTop);
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(leftCopy, margin, this.doc.y + 4, { width: colWidth, align: "left", lineGap: 3 });

    // Right block - positioned at same Y as left block
    this.doc
      .font(this.fontBoldName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(rightTitle, margin + colWidth + colGap, blockTop);
    this.doc
      .font(this.fontRegularName)
      .fontSize(12)
      .fillColor("#0b0f14")
      .text(rightCopy, margin + colWidth + colGap, blockTop + 16, { width: colWidth, align: "left", lineGap: 3 });

    this.drawPageNumber();
  }

  private renderWealthCodePillarsPage(code: WealthCodeKey): void {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    const margin = this.contentMargin;
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Header with updated font sizes
    const headerTop = Math.round(pageHeight * 0.08); // Start higher on page
    this.doc
      .font(this.fontBoldName)
      .fontSize(24)
      .fillColor("#0b0f14")
      .text(`AS A ${code.toUpperCase()}`, margin, headerTop);
    this.doc
      .font(this.fontBoldName)
      .fontSize(36)
      .fillColor("#d4af37")
      .text("WHAT TO FOCUS ON", margin, this.doc.y + 6);
    this.doc
      .font(this.fontBoldName)
      .fontSize(20)
      .fillColor("#0b0f14")
      .text("YOUR 3 PILLARS", margin, this.doc.y + 8);

    const pillars = WEALTH_CODE_PILLARS[code] || [];
    const startY = this.doc.y + 24;
    const width = pageWidth - margin * 2;
    const numberColor = "#d4af37";
    const availableHeight = pageHeight - startY - 80; // Available space for content
    const pillarHeight = availableHeight / 3; // Distribute evenly

    pillars.slice(0, 3).forEach((p, idx) => {
      // Position each pillar evenly in available space
      const pillarY = startY + (idx * pillarHeight);
      
      // Number
      this.doc
        .font(this.fontBoldName)
        .fontSize(96) // Much larger number
        .fillColor(numberColor)
        .text(String(idx + 1), margin, pillarY);
      const textX = margin + 72; // More space for larger number
      const textWidth = width - 72;
      
      // Title
      this.doc
        .font(this.fontBoldName)
        .fontSize(14)
        .fillColor("#0b0f14")
        .text(p.title.toUpperCase(), textX, pillarY + 8, { width: textWidth });
      
      // Description
      this.doc
        .font(this.fontRegularName)
        .fontSize(13)
        .fillColor("#0b0f14")
        .text(p.description, textX, this.doc.y + 6, { 
          width: textWidth, 
          lineGap: 4,
          height: pillarHeight - 60 // Constrain height to prevent overlap
        });
    });

    this.drawPageNumber();
  }
}

// Types and helpers for chart drawing (module scope)
interface DrawChartOptions {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly birth: Date;
  readonly birthTime: string;
  readonly gender: string;
  readonly name: string;
}

const PALACE_GRID_POSITIONS: ReadonlyArray<{ n: number; col: number; row: number }> = [
  { n: 1, col: 1, row: 1 }, { n: 2, col: 2, row: 1 }, { n: 3, col: 3, row: 1 }, { n: 4, col: 4, row: 1 },
  { n: 12, col: 1, row: 2 }, { n: 5, col: 4, row: 2 },
  { n: 11, col: 1, row: 3 }, { n: 6, col: 4, row: 3 },
  { n: 10, col: 1, row: 4 }, { n: 9, col: 2, row: 4 }, { n: 8, col: 3, row: 4 }, { n: 7, col: 4, row: 4 },
];

const PALACE_EN_MAP: Record<string, string> = {
  "命宫": "Life",
  "兄弟": "Siblings",
  "夫妻": "Spouse",
  "子女": "Children",
  "财帛": "Wealth",
  "疾厄": "Health",
  "迁移": "Travel",
  "交友": "Friends",
  "官禄": "Career",
  "田宅": "Property",
  "福德": "Wellbeing",
  "父母": "Parents",
};

const STEM_EN_MAP: Record<string, string> = {
  "甲": "Jia",
  "乙": "Yi",
  "丙": "Bing",
  "丁": "Ding",
  "戊": "Wu",
  "己": "Ji",
  "庚": "Geng",
  "辛": "Xin",
  "壬": "Ren",
  "癸": "Gui",
};

const BRANCH_EN_MAP: Record<string, string> = {
  "子": "Zi",
  "丑": "Chou",
  "寅": "Yin",
  "卯": "Mao",
  "辰": "Chen",
  "巳": "Si",
  "午": "Wu",
  "未": "Wei",
  "申": "Shen",
  "酉": "You",
  "戌": "Xu",
  "亥": "Hai",
};
