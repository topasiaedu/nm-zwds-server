import path from "path";
import { BasePdfGenerator, AgendaItem } from "./base";
import { logger } from "@/utils/logger";
import { LifecycleDecoderRequest } from "@/types";
import { extractBirthHour } from "@/utils/time";

/**
 * Career Timing Window PDF Generator
 */
export class CareerTimingWindowPdfGenerator extends BasePdfGenerator {
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
    this.coverBackgroundPath = path.join(__dirname, "../../assets/cover-bg.png");
    this.contentBackgroundPath = path.join(__dirname, "../../assets/content-bg.png");
  }

  /** Generate the career timing window content */
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

  /** Generate cover page */
  private async generateCoverPage(): Promise<void> {
    this.currentPage++;
    this.renderCoverPage("CAREER TIMING\nWINDOW", this.coverBackgroundPath);
  }

  /** Generate agenda page */
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

  /** Get agenda items for career timing window */
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

  /** Generate chart page */
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
      
      // Parse birth time (accepts HH:MM or HH:MM ~ HH:MM; uses starting hour)
      const hour = extractBirthHour(this.data.birthTime);
      
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



