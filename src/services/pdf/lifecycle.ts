import fs from "fs";
import path from "path";
import { BasePdfGenerator, AgendaItem } from "./base";
import { logger } from "@/utils/logger";
import { ZWDSCalculator } from "@/calculation/calculator";
import { ChartData, Palace } from "@/calculation/types";
import { PALACE_DESCRIPTIONS, PalaceKey, STAR_MEANINGS_BY_PALACE, STAR_META, StarKey, NEXT_STEPS_BY_PALACE } from "@/calculation/life-cycle-decoder/constants";
import { DECADE_CYCLE_MEANINGS } from "@/calculation/life-cycle-decoder/decade_cycle_meaning";
import { STRENGTH, OPPORTUNITY, INFLUENCE, SUPPORT, VOLATILITY } from "@/calculation/life-cycle-decoder/score";
import { OPPOSITE_PALACE_INFLUENCE } from "@/calculation/constants";
import { LifecycleDecoderRequest } from "@/types";
import { extractBirthHour, formatHourRangeFromBirthTime } from "@/utils/time";

/**
 * Lifecycle Decoder PDF Generator
 */
export class LifecycleDecoderPdfGenerator extends BasePdfGenerator {
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
    // compiled path: dist/services/pdf/lifecycle.js → assets at ../../assets
    this.coverBackgroundPath = path.join(__dirname, "../../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../../assets/content-bg.png");
  }

  /**
   * Generate the lifecycle decoder content
   */
  protected async generateContent(): Promise<void> {
    // Access kept field to satisfy linter and preserve constructor API compatibility
    if (this.frontendUrl) {
      // No-op: lifecycle now renders charts internally instead of using the frontend URL
    }
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

  /** Generate cover page */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;
    this.renderCoverPage("LIFE CYCLE\nDECODER", this.coverBackgroundPath);
  }

  /** Generate agenda page */
  private async generateAgendaPage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    
    // Build dynamic agenda based on content sections for Lifecycle report
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

  /** Generate chart page */
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

    // Render chart using calculator (no screenshot)
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
      this.drawZwdsChart(chart, { x: chartX, y: chartY, size: chartSize, showDamingTags: false, birth, birthTime: this.data.birthTime, gender: this.data.gender, name: this.data.name });
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

  /** Generate Current Cycle page (Da Xian) using Major Limit from calculator */
  private async generateCurrentCyclePage(): Promise<void> {
    this.doc.addPage();
    this.currentPage++;
    this.addBackgroundImage(this.contentBackgroundPath, "center");

    // Compute current palace by today age in Major Limit ranges
    const birth = new Date(this.data.birthday);
    const today = new Date();
    const ageYears = Math.max(0, Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));

    const calculator = new ZWDSCalculator({
      year: birth.getFullYear(),
      month: birth.getMonth() + 1,
      day: birth.getDate(),
      hour: extractBirthHour(this.data.birthTime),
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
      "命宫": path.join(__dirname, "../../assets/palace/Life.png"),
      "兄弟": path.join(__dirname, "../../assets/palace/Siblings.png"),
      "夫妻": path.join(__dirname, "../../assets/palace/Spouse.png"),
      "子女": path.join(__dirname, "../../assets/palace/Children.png"),
      "财帛": path.join(__dirname, "../../assets/palace/Wealth.png"),
      "疾厄": path.join(__dirname, "../../assets/palace/Health.png"),
      "迁移": path.join(__dirname, "../../assets/palace/Travel.png"),
      "交友": path.join(__dirname, "../../assets/palace/Friends.png"),
      "官禄": path.join(__dirname, "../../assets/palace/Career.png"),
      "田宅": path.join(__dirname, "../../assets/palace/Property.png"),
      "福德": path.join(__dirname, "../../assets/palace/Wellbeing.png"),
      "父母": path.join(__dirname, "../../assets/palace/Parents.png"),
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
    } catch {}

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
    } catch {}

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
   * Page 5+: Stars aligning your cycle   render stars present in the current DaYun palace.
   * Two stars per page, with top-right icon and a faint watermark in the body.
   */
  private async generateStarsInCyclePages(): Promise<void> {
    // Compute chart and current palace
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
        const iconPath = path.join(__dirname, `../../assets/stars/${meta.name_en.replace(/\s+/g, "")}\.png`);

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

  /** Show the chart again with Da Ming highlight (frontend param daming=true) */
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

    // Render chart with Da Ming tags
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

      const maxWidth = Math.min(580, pageWidth - margin * 2 - 40);
      const chartSize = maxWidth;
      const chartX = (pageWidth - chartSize) / 2;
      const chartY = this.doc.y + 30;
      this.drawZwdsChart(chart, { x: chartX, y: chartY, size: chartSize, showDamingTags: true, birth, birthTime: this.data.birthTime, gender: this.data.gender, name: this.data.name });
    } catch (err) {
      logger.warn("DaMing chart render failed", { message: err instanceof Error ? err.message : String(err) });
      this.doc.font(this.fontRegularName).fontSize(14).fillColor("#e74c3c").text("Chart with Da Ming could not be generated", margin, Math.round(pageHeight * 0.45), { width: pageWidth - margin * 2, align: "center" });
    }

    this.drawPageNumber();
  }

  /** Next Steps page   three items based on the Da Yun palace */
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
      hour: extractBirthHour(this.data.birthTime),
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
      hour: extractBirthHour(this.data.birthTime),
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
          `../../assets/palace/${palaceEn.charAt(0).toUpperCase()}${palaceEn.slice(1)}.png`
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
        const iconFirst = path.join(__dirname, `../../assets/stars/${metaFirst.name_en.replace(/\s+/g, "")}\.png`);

        // Title   add more spacing from bars
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
          const iconPath = path.join(__dirname, `../../assets/stars/${meta.name_en.replace(/\s+/g, "")}\.png`);

          this.doc.font(this.fontBoldName).fontSize(48).fillColor(brandColor).text(title, margin, localY, { width: pageWidth - margin * 2 - 120 });
          // icon right
          try { if (fs.existsSync(iconPath)) { this.doc.image(iconPath, pageWidth - margin - 72, localY - 6, { width: 72, height: 72 }); } } catch {}
          this.doc.font(this.fontBoldName).fontSize(12).fillColor(brandColor).text(subtitle, margin, this.doc.y + 4);
          const bodyTop = this.doc.y + 12;
          this.doc.font(this.fontRegularName).fontSize(16).fillColor("#0b0f14").text(meaning, margin, bodyTop, { width: pageWidth - margin * 2, align: "left", lineGap: 5 });
          // spacing
          localY = this.doc.y + 32;
        });
        this.drawPageNumber();
      };

      chunked.forEach(renderStarPage);
    });
  }

  /** Generate conclusion page */
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

  /** Draw a minimalist 4x4 Zi Wei chart with center info and optional Da Yun tags. */
  private drawZwdsChart(chart: ChartData, opts: DrawChartOptions): void {
    const { x, y, size, showDamingTags, birth, birthTime, gender, name } = opts;
    const cell = size / 4;

    // Outer border
    this.doc.save().lineWidth(1).strokeColor("#0b0f14").rect(x, y, size, size).stroke().restore();

    // Grid lines (vertical and horizontal)
    this.doc.save().strokeColor("#0b0f14").lineWidth(0.8);
    for (let i = 1; i < 4; i++) {
      // vertical
      this.doc.moveTo(x + i * cell, y).lineTo(x + i * cell, y + size).stroke();
      // horizontal
      this.doc.moveTo(x, y + i * cell).lineTo(x + size, y + i * cell).stroke();
    }
    this.doc.restore();

    // Cover middle 2x2 block to create a clean center info area
    const centerX = x + cell;
    const centerY = y + cell;
    const centerSize = cell * 2;
    this.doc.save().rect(centerX, centerY, centerSize, centerSize).fillColor("#ffffff").fill().restore();
    this.doc.save().lineWidth(1).strokeColor("#0b0f14").rect(centerX, centerY, centerSize, centerSize).stroke().restore();

    // Center info: simple identity + solar/lunar
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

    // Da Yun labels for each palace
    const daYunLabels = showDamingTags ? computeDaYunLabels(chart, birth) : new Array(12).fill("");

    // Draw each palace cell content
    PALACE_GRID_POSITIONS.forEach((pos) => {
      const palace = chart.palaces[pos.n - 1];
      const px = x + (pos.col - 1) * cell;
      const py = y + (pos.row - 1) * cell;
      const pad = 6;
      const title = palace?.name ? (PALACE_EN_MAP[palace.name] || palace.name) : "";
      const stars = summarizeStars(palace);

      // Skip the two center columns/rows occupied by info
      const inCenter = pos.col >= 2 && pos.col <= 3 && pos.row >= 2 && pos.row <= 3;
      if (inCenter) return;

      // Star names rendered in compact columns
      if (palace && stars.length > 0) {
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
        
        const maxCols = Math.min(3, starNames.length); // max 3 columns to avoid overcrowding
        
        // Calculate compact layout starting from top-left
        const compactColWidth = 30; // Fixed narrow width per star column
        const colSpacing = 2; // Small gap between columns
        
        starNames.forEach((starName: string, index: number) => {
          const colIndex = index % maxCols;
          const rowIndex = Math.floor(index / maxCols);
          
          // Start from top-left of palace, align left
          const starX = px + pad + colIndex * (compactColWidth + colSpacing);
          const baseY = py + pad + 3 + rowIndex * 35; // 35px vertical spacing between rows
          
          // Split star name by spaces and render vertically within column
          const words = starName.split(" ");
          words.forEach((word: string, wordIndex: number) => {
            const wordY = baseY + wordIndex * 10; // 10px between words within same star
            if (wordY + 10 < py + cell - 28) {
              this.doc.font(this.fontRegularName).fontSize(7).fillColor("#0b0f14")
                .text(word, starX, wordY, { width: compactColWidth, align: "left" });
            }
          });
        });
      }

      // Da Yun tag - positioned above footer on right side
      if (showDamingTags) {
        const tag = daYunLabels[pos.n - 1] || "";
        const tagText = DAYUN_EN_MAP[tag] || tag;
        if (tagText) {
          const badgePad = 2;
          const textWidth = Math.min(cell - 12, tagText.length * 4.5 + 6);
          const barH = 22; // same as footer height
          const footerY = py + cell - barH;
          const tagHeight = 12;
          const spacing = 4; // spacing between tag and footer
          
          const bx = px + cell - textWidth - 4; // right side
          const by = footerY - tagHeight - spacing; // above footer with spacing
          
          this.doc.save().rect(bx, by, textWidth, tagHeight).fillColor("#D4A33A").fill().restore();
          this.doc.font(this.fontBoldName).fontSize(7).fillColor("#ffffff").text(tagText.toUpperCase(), bx + badgePad, by + 2, { width: textWidth - badgePad * 2, align: "center" });
        }
      }
      // Bottom 3-column row: [Stem+Branch] | [Palace Name + DaXian Range] | [Year + Age]
      const barH = 22; // slightly taller for two lines
      const rowY = py + cell - barH;
      const footerWidth = cell - 1; // full width minus border
      const colW = footerWidth / 3; // exactly equal widths
      const textY = rowY + 3;

      // Footer band border
      this.doc.save().lineWidth(0.8).strokeColor("#0b0f14").rect(px + 0.5, rowY, footerWidth, barH).stroke().restore();
      
      // Vertical separators at exact 1/3 and 2/3 positions
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

      // Column 1: stem + branch (EN)   center aligned consistently
      const stem = palace?.heavenlyStem ? (STEM_EN_MAP[palace.heavenlyStem] || palace.heavenlyStem) : "";
      const branch = palace?.earthlyBranch ? (BRANCH_EN_MAP[palace.earthlyBranch] || palace.earthlyBranch) : "";
      const col1X = px + 0.5;
      this.doc.font(this.fontRegularName).fontSize(6.5).fillColor("#0b0f14");
      this.doc.text(stem, col1X, textY, { width: colW, align: "center" });
      this.doc.text(branch, col1X, textY + 8, { width: colW, align: "center" });

      // Column 2: Palace EN + Major Limit (no extra spacing)
      const range = palace?.majorLimit ? `${palace.majorLimit.startAge}-${palace.majorLimit.endAge}` : "";
      const col2X = px + 0.5 + colW;
      this.doc.font(this.fontRegularName).fontSize(6.5).fillColor("#0b0f14");
      this.doc.text(title, col2X, textY, { width: colW, align: "center" });
      if (range) {
        this.doc.text(range, col2X, textY + 8, { width: colW, align: "center" });
      }

      // Column 3: Year + Age
      const year = palace?.annualFlow?.year ? String(palace.annualFlow.year) : "";
      const ageAt = palace?.annualFlow?.year ? String(Math.max(0, palace.annualFlow.year - birth.getFullYear() + 1)) : "";
      const col3X = px + 0.5 + colW * 2;
      this.doc.font(this.fontRegularName).fontSize(6.5).fillColor("#0b0f14");
      if (year) {
        this.doc.text(year, col3X, textY, { width: colW, align: "center" });
      }
      if (ageAt) {
        this.doc.text(ageAt, col3X, textY + 8, { width: colW, align: "center" });
      }
    });
  }
}

// ---------- Helpers for Lifecycle chart rendering (no screenshots) ----------

interface DrawChartOptions {
  readonly x: number;
  readonly y: number;
  readonly size: number; // square size
  readonly showDamingTags: boolean;
  readonly birth: Date;
  readonly birthTime: string;
  readonly gender: string;
  readonly name: string;
}

/** Map palace.number (1..12) to grid coordinates (col,row) in a 4x4 grid */
const PALACE_GRID_POSITIONS: ReadonlyArray<{ n: number; col: number; row: number }> = [
  { n: 1, col: 1, row: 1 }, { n: 2, col: 2, row: 1 }, { n: 3, col: 3, row: 1 }, { n: 4, col: 4, row: 1 },
  { n: 12, col: 1, row: 2 }, { n: 5, col: 4, row: 2 },
  { n: 11, col: 1, row: 3 }, { n: 6, col: 4, row: 3 },
  { n: 10, col: 1, row: 4 }, { n: 9, col: 2, row: 4 }, { n: 8, col: 3, row: 4 }, { n: 7, col: 4, row: 4 },
];

/** Order of Da Yun cycle labels starting from current Da Yun as 大命 and moving counter-clockwise */
const DAYUN_CYCLE_ORDER: readonly string[] = ["大命","大兄","大夫","大子","大财","大疾","大迁","大友","大官","大田","大福","大父"] as const;

/** English tags for Da Yun labels (rough mapping for small corner badges) */
const DAYUN_EN_MAP: Record<string, string> = {
  "大命": "Da Ming",
  "大兄": "Da Xiong",
  "大夫": "Da Fu",
  "大子": "Da Zi",
  "大财": "Da Cai",
  "大疾": "Da Ji",
  "大迁": "Da Qian",
  "大友": "Da You",
  "大官": "Da Guan",
  "大田": "Da Tian",
  "大福": "Da Fu",
  "大父": "Da Fu",
};

// English mappings for palace names, heavenly stems, and earthly branches
const PALACE_EN_MAP: Record<string, string> = {
  "命宫": "Life",
  "兄弟": "Siblings",
  "夫妻": "Spouse",
  "子女": "Children",
  "财帛": "Wealth",
  "疾厄": "Wellbeing",
  "迁移": "Travel",
  "交友": "Friends",
  "官禄": "Career",
  "田宅": "Property",
  "福德": "Health",
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

// Use Earthly Branch romanization (not zodiac animal) to match approved frontend
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

/**
 * Compute Da Yun labels for each palace index (0..11) based on current age and Major Limits.
 */
function computeDaYunLabels(chart: ChartData, birth: Date): string[] {
  const ageYears = Math.max(0, Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
  const startIdx = chart.palaces.findIndex((p) => p.majorLimit && ageYears >= p.majorLimit.startAge && ageYears <= p.majorLimit.endAge);
  const start = startIdx >= 0 ? startIdx : 0;
  const labels: string[] = new Array(12).fill("");
  for (let i = 0; i < 12; i++) {
    const palaceIdx = (start - i + 12) % 12; // counter-clockwise
    labels[palaceIdx] = DAYUN_CYCLE_ORDER[i] || "大命";
  }
  return labels;
}

/** Return star names inside a palace as a short string   translated to English where possible */
function summarizeStars(palace: Palace | undefined): string {
  if (!palace) return "";
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
  const names: string[] = [];
  if (Array.isArray(palace.mainStar)) names.push(...palace.mainStar.map((s) => toEnglish(s.name)));
  if (Array.isArray(palace.minorStars)) names.push(...palace.minorStars.map((s) => toEnglish(s.name)));
  // Trim overly long text to avoid overflow
  const joined = names.join("  ");
  return joined.length > 80 ? `${joined.slice(0, 77)}...` : joined;
}


