/**
 * Email service for sending emails via Gmail API with service account
 * 
 * Provides a reusable email service that can be used across different endpoints
 * for sending various types of PDFs and attachments using Google Workspace.
 */

import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { EmailSendResult } from "@/types";
import fs from "fs";
import path from "path";

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  readonly filename: string;
  readonly content: Buffer;
  readonly contentType: string;
}

/**
 * Email sending options
 */
export interface EmailOptions {
  readonly to: string;
  readonly subject: string;
  readonly htmlContent: string;
  readonly textContent?: string;
  readonly attachments?: EmailAttachment[];
}

/**
 * Email service class for handling all email operations via Gmail API
 */
class EmailService {
  private gmail: any = null;
  private jwtClient: JWT | null = null;

  /**
   * Initialize the Gmail API client with service account authentication
   * @returns {Promise<void>}
   */
  private async initializeGmailClient(): Promise<void> {
    try {
      // Load service account credentials
      const serviceAccountPath = path.resolve(process.cwd(), config.EMAIL.serviceAccountPath);
      
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found at: ${serviceAccountPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

      // Create JWT client for service account with proper domain delegation
      this.jwtClient = new JWT({
        email: serviceAccount.client_email,
        key: serviceAccount.private_key,
        scopes: [
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/gmail.compose",
        ],
        subject: config.EMAIL.delegateEmail, // Impersonate this email address
      });

      // Authorize the client and get access token
      const tokens = await this.jwtClient.authorize();
      
      // Verify we have a valid access token
      if (!tokens.access_token) {
        throw new Error("Failed to obtain access token");
      }

      // Initialize Gmail API with the authorized client
      this.gmail = google.gmail({ version: "v1", auth: this.jwtClient });

      logger.info("Gmail API service initialized successfully", {
        serviceAccountEmail: serviceAccount.client_email,
        delegateEmail: config.EMAIL.delegateEmail,
      });
    } catch (error) {
      logger.error("Failed to initialize Gmail API service", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Gmail API service initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create email message in RFC2822 format
   * @param {EmailOptions} options - Email options
   * @returns {string} RFC2822 formatted email message
   */
  private createEmailMessage(options: EmailOptions): string {
    const boundary = "boundary_" + Math.random().toString(36).substring(2);
    
    let message = [
      `From: ${config.EMAIL.fromName} <${config.EMAIL.from}>`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      "MIME-Version: 1.0",
    ];

    if (options.attachments && options.attachments.length > 0) {
      message.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      message.push("");
      
      // Add text/html part
      message.push(`--${boundary}`);
      message.push("Content-Type: multipart/alternative; boundary=\"alt_" + boundary + "\"");
      message.push("");
      
      if (options.textContent) {
        message.push(`--alt_${boundary}`);
        message.push("Content-Type: text/plain; charset=utf-8");
        message.push("");
        message.push(options.textContent);
        message.push("");
      }
      
      if (options.htmlContent) {
        message.push(`--alt_${boundary}`);
        message.push("Content-Type: text/html; charset=utf-8");
        message.push("");
        message.push(options.htmlContent);
        message.push("");
      }
      
      message.push(`--alt_${boundary}--`);
      
      // Add attachments
      options.attachments.forEach((attachment) => {
        message.push(`--${boundary}`);
        message.push(`Content-Type: ${attachment.contentType}`);
        message.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        message.push("Content-Transfer-Encoding: base64");
        message.push("");
        message.push(attachment.content.toString("base64"));
        message.push("");
      });
      
      message.push(`--${boundary}--`);
    } else {
      // Simple email without attachments
      if (options.htmlContent) {
        message.push("Content-Type: text/html; charset=utf-8");
        message.push("");
        message.push(options.htmlContent);
      } else {
        message.push("Content-Type: text/plain; charset=utf-8");
        message.push("");
        message.push(options.textContent || "");
      }
    }
    
    return message.join("\r\n");
  }

  /**
   * Send an email with optional attachments using Gmail API
   * @param {EmailOptions} options - Email sending options
   * @returns {Promise<EmailSendResult>} Result of the email sending operation
   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      // Initialize Gmail client if not already done
      if (!this.gmail) {
        await this.initializeGmailClient();
      }

      if (!this.gmail) {
        throw new Error("Gmail API client is not initialized");
      }

      // Create the email message
      const emailMessage = this.createEmailMessage(options);
      
      // Encode the message in base64url format
      const encodedMessage = Buffer.from(emailMessage)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Refresh access token to ensure it's valid
      await this.jwtClient!.getAccessToken();
      
      // Send the email using "me" as userId since we're impersonating
      const result = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      logger.info("Email sent successfully via Gmail API", {
        to: options.to,
        subject: options.subject,
        messageId: result.data.id,
        attachmentCount: options.attachments?.length || 0,
      });

      return {
        success: true,
        messageId: result.data.id,
      };
    } catch (error) {
      logger.error("Failed to send email via Gmail API", {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorCode: (error as any)?.code,
        errorStatus: (error as any)?.status,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Send a lifecycle decoder PDF via email
   * @param {string} recipientEmail - Email address to send to
   * @param {string} recipientName - Name of the recipient
   * @param {Buffer} pdfBuffer - PDF file buffer
   * @param {string} filename - PDF filename
   * @returns {Promise<EmailSendResult>} Result of the email sending operation
   */
  async sendLifecycleDecoderPdf(
    recipientEmail: string,
    recipientName: string,
    pdfBuffer: Buffer,
    filename: string
  ): Promise<EmailSendResult> {
    const subject = "Your Lifecycle Decoder Report";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Your Lifecycle Decoder Report</h2>
        
        <p>Dear ${recipientName},</p>
        
        <p>Thank you for using our Lifecycle Decoder service. Your personalized report has been generated and is attached to this email.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #007bff;">What's in your report:</h3>
          <ul>
            <li>Personalized lifecycle analysis</li>
            <li>Key insights based on your birth information</li>
            <li>Detailed interpretations and guidance</li>
          </ul>
        </div>
        
        <p>If you have any questions about your report, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        <strong>The CAE Team</strong><br>
        Top Asia Education</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #6c757d;">
          This email was sent from CAE Lifecycle Decoder service. 
          If you did not request this report, please ignore this email.
        </p>
      </div>
    `;

    const textContent = `
Your Lifecycle Decoder Report

Dear ${recipientName},

Thank you for using our Lifecycle Decoder service. Your personalized report has been generated and is attached to this email.

What's in your report:
- Personalized lifecycle analysis
- Key insights based on your birth information
- Detailed interpretations and guidance

If you have any questions about your report, please don't hesitate to contact us.

Best regards,
The CAE Team
Top Asia Education

This email was sent from CAE Lifecycle Decoder service. If you did not request this report, please ignore this email.
    `;

    return await this.sendEmail({
      to: recipientEmail,
      subject,
      htmlContent,
      textContent,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  }

  /**
   * Close the Gmail API client connection
   * @returns {void}
   */
  close(): void {
    if (this.jwtClient) {
      // JWT client doesn't need explicit closing, just clear references
      this.jwtClient = null;
      this.gmail = null;
      logger.info("Gmail API service connection closed");
    }
  }
}

/**
 * Singleton instance of the email service
 */
export const emailService = new EmailService();