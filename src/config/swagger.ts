import { Application, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { config } from "@/config/environment";

const apiBasePath = `/api/${config.API_VERSION}`;

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "nm-zwds-server API",
    version: config.API_VERSION,
    description:
      "API for generating ZWDS PDF reports (Lifecycle Decoder, Wealth Decoder, Career Timing Window) and health checks.",
  },
  servers: [
    { url: apiBasePath, description: "API base path" },
  ],
  tags: [
    { name: "Health", description: "Server health and status" },
    { name: "PDF", description: "PDF generation endpoints" },
  ],
  components: {
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {},
          timestamp: { type: "string", format: "date-time" },
        },
        required: ["success", "message", "timestamp"],
        additionalProperties: false,
      },
      LifecycleDecoderRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          birthday: { type: "string", example: "1990-05-15", description: "YYYY-MM-DD" },
          birthTime: { type: "string", example: "17", description: "Hour of birth as string" },
          gender: { type: "string", enum: ["male", "female", "other"] },
        },
        required: ["name", "email", "birthday", "birthTime", "gender"],
        additionalProperties: false,
      },
      HealthCheckResponse: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "unhealthy"] },
          uptime: { type: "integer", example: 12345 },
          timestamp: { type: "string", format: "date-time" },
          version: { type: "string" },
        },
        required: ["status", "uptime", "timestamp", "version"],
        additionalProperties: false,
      },
      DetailedHealth: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy"] },
          uptime: { type: "integer" },
          timestamp: { type: "string", format: "date-time" },
          version: { type: "string" },
          environment: { type: "string" },
          nodeVersion: { type: "string" },
          platform: { type: "string" },
          architecture: { type: "string" },
          memory: {
            type: "object",
            properties: {
              used: { type: "integer", description: "MB" },
              total: { type: "integer", description: "MB" },
              external: { type: "integer", description: "MB" },
            },
          },
          pid: { type: "integer" },
        },
      },
      UrlResponseData: {
        type: "object",
        properties: {
          url: { type: "string", format: "uri" },
        },
      },
      ApiInfoData: {
        type: "object",
        properties: {
          message: { type: "string" },
          version: { type: "string" },
          environment: { type: "string" },
          availableEndpoints: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "API info",
        responses: {
          200: {
            description: "API info",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/ApiInfoData" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Basic health check",
        responses: {
          200: {
            description: "Health status",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/HealthCheckResponse" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Health"],
        summary: "Health check (POST)",
        responses: {
          200: {
            description: "Health status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ApiResponse",
                },
              },
            },
          },
        },
      },
    },
    "/health/detailed": {
      get: {
        tags: ["Health"],
        summary: "Detailed health check",
        responses: {
          200: {
            description: "Detailed health information",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/DetailedHealth" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/lifecycle-decoder": {
      post: {
        tags: ["PDF"],
        summary: "Generate Lifecycle Decoder PDF",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LifecycleDecoderRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "PDF generated and uploaded",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/UrlResponseData" },
                  },
                },
              },
            },
          },
          500: { description: "Unexpected error" },
        },
      },
    },
    "/wealth-decoder": {
      post: {
        tags: ["PDF"],
        summary: "Generate Wealth Decoder PDF",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LifecycleDecoderRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "PDF generated and uploaded",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/UrlResponseData" },
                  },
                },
              },
            },
          },
          500: { description: "Unexpected error" },
        },
      },
    },
    "/career-timing-window": {
      post: {
        tags: ["PDF"],
        summary: "Generate Career Timing Window PDF",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LifecycleDecoderRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "PDF generated and uploaded",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/UrlResponseData" },
                  },
                },
              },
            },
          },
          500: { description: "Unexpected error" },
        },
      },
    },
    "/test": {
      post: {
        tags: ["PDF"],
        summary: "Generate test PDF",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  pdfType: {
                    type: "string",
                    enum: ["lifecycle-decoder", "wealth-decoder", "career-timing-window"],
                    default: "lifecycle-decoder",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "PDF generated and uploaded",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                  ],
                  properties: {
                    data: { $ref: "#/components/schemas/UrlResponseData" },
                  },
                },
              },
            },
          },
          500: { description: "Unexpected error" },
        },
      },
    },
  },
} as const;

const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: [] });

export function setupSwagger(app: Application): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };


