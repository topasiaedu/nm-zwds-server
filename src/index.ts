/**
 * Main entry point for the nm-zwds-server application
 * 
 * Sets up Express server with middleware, routes, and error handling.
 * Following strict TypeScript guidelines with comprehensive error checking.
 */

import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { globalErrorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { createHealthRouter } from "@/routes/health";
import lifecycleDecoderRouter from "@/routes/lifecycleDecoder";
import calculationRouter from "@/routes/calculation";
import { ApiResponse, HTTP_STATUS } from "@/types";

/**
 * Server class to encapsulate application setup and lifecycle
 */
class Server {
  private readonly app: Application;
  private readonly port: number;

  /**
   * Initialize the server with configuration
   */
  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.NODE_ENV === "production" 
        ? [] // Add your production domains here
        : ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    this.app.use((req: Request, _res: Response, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });
      next();
    });

    logger.info("Middleware setup completed");
  }

  /**
   * Configure application routes
   */
  private setupRoutes(): void {
    // API version prefix
    const apiPrefix = `/api/${config.API_VERSION}`;

    // Root endpoint
    this.app.get("/", (_req: Request, res: Response): void => {
      const response: ApiResponse<{ server: string; version: string }> = {
        success: true,
        message: "nm-zwds-server is running",
        data: {
          server: "nm-zwds-server",
          version: config.API_VERSION,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.OK).json(response);
    });

    // Health check routes
    this.app.use(`${apiPrefix}/health`, createHealthRouter());

    // Lifecycle decoder routes
    this.app.use(`${apiPrefix}`, lifecycleDecoderRouter);

    // Calculation routes
    this.app.use(`${apiPrefix}/calculation`, calculationRouter);

    // API info endpoint
    this.app.get(apiPrefix, (_req: Request, res: Response): void => {
      const response: ApiResponse<{ 
        message: string; 
        version: string; 
        environment: string; 
        availableEndpoints: string[]; 
      }> = {
        success: true,
        message: "API is running",
        data: {
          message: "Welcome to nm-zwds-server API",
          version: config.API_VERSION,
          environment: config.NODE_ENV,
          availableEndpoints: [
            "GET /",
            `GET ${apiPrefix}`,
            `GET ${apiPrefix}/health`,
            `GET ${apiPrefix}/health/detailed`,
            `POST ${apiPrefix}/lifecycle-decoder`,
            `POST ${apiPrefix}/lifecycle-decoder/test`,
            `GET ${apiPrefix}/lifecycle-decoder/info`,
            `GET ${apiPrefix}/calculation`,
            `POST ${apiPrefix}/calculation/calculate`,
            `POST ${apiPrefix}/calculation/lifecycle-decoder`,
            `POST ${apiPrefix}/calculation/wealth-path-decoder`,
            `POST ${apiPrefix}/calculation/monthly-report`,
            `POST ${apiPrefix}/calculation/info`,
          ],
        },
        timestamp: new Date().toISOString(),
      };

      res.status(HTTP_STATUS.OK).json(response);
    });

    logger.info("Routes setup completed", { apiPrefix });
  }

  /**
   * Configure error handling
   */
  private setupErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(globalErrorHandler);

    logger.info("Error handling setup completed");
  }

  /**
   * Start the server
   * @returns {Promise<void>} Promise that resolves when server starts
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(this.port, () => {
          logger.info(`Server started successfully`, {
            port: this.port,
            environment: config.NODE_ENV,
            version: config.API_VERSION,
            pid: process.pid,
          });
          resolve();
        });

        // Handle server startup errors
        server.on("error", (error: Error) => {
          logger.error("Server startup error", error);
          reject(error);
        });

        // Graceful shutdown handling
        process.on("SIGTERM", () => {
          logger.info("SIGTERM received, shutting down gracefully");
          server.close(() => {
            logger.info("Server closed");
            process.exit(0);
          });
        });

        process.on("SIGINT", () => {
          logger.info("SIGINT received, shutting down gracefully");
          server.close(() => {
            logger.info("Server closed");
            process.exit(0);
          });
        });

      } catch (error) {
        logger.error("Failed to start server", error);
        reject(error);
      }
    });
  }

  /**
   * Get the Express application instance
   * @returns {Application} Express application
   */
  public getApp(): Application {
    return this.app;
  }
}

/**
 * Handle uncaught exceptions and unhandled rejections
 */
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  logger.error("Unhandled Rejection", reason);
  process.exit(1);
});

/**
 * Start the application
 */
async function startApplication(): Promise<void> {
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    logger.error("Failed to start application", error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startApplication();
}

export { Server };