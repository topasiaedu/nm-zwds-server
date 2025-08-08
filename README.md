# nm-zwds-server

A simple Node.js TypeScript server built with Express, following strict TypeScript guidelines and best practices.

## Features

- 🚀 **Express.js** - Fast, unopinionated web framework
- 📘 **TypeScript** - Strict type checking with comprehensive configuration
- 🛡️ **Security** - Helmet for security headers, CORS configuration
- 📊 **Health Checks** - Built-in health monitoring endpoints
- 🔧 **Error Handling** - Comprehensive error handling with proper logging
- 📝 **Logging** - Structured logging with timestamps and levels
- ⚙️ **Environment Config** - Type-safe environment variable handling
- 🔄 **Hot Reload** - Development server with automatic restart

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.18+
- **Security**: Helmet, CORS
- **Development**: ts-node-dev for hot reload

## Project Structure

```
nm-zwds-server/
├── src/
│   ├── config/           # Configuration files
│   │   └── environment.ts
│   ├── middleware/       # Express middleware
│   │   └── errorHandler.ts
│   ├── routes/          # Route handlers
│   │   └── health.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── logger.ts
│   └── index.ts         # Main application entry point
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 18.0.0 or higher)
- npm or yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   # Create .env file with the following content:
   PORT=3000
   NODE_ENV=development
   API_VERSION=v1
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Start production server**:
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove build artifacts
- `npm run type-check` - Run TypeScript type checking without emitting files

## API Endpoints

### Root Endpoints

- `GET /` - Server status and basic information
- `GET /api/v1` - API information and available endpoints

### Health Check Endpoints

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed system information

### Example Response

```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "v1"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `API_VERSION` | API version string | `v1` | No |

## TypeScript Configuration

This project uses strict TypeScript configuration with the following enforced rules:

- ✅ **No `any` types** - All types must be explicitly defined
- ✅ **No non-null assertions (`!`)** - Proper null checking required
- ✅ **No `unknown` casting** - Type safety maintained throughout
- ✅ **Strict null checks** - Null and undefined handling enforced
- ✅ **Unused variable detection** - Clean code practices
- ✅ **Exact optional properties** - Precise type definitions

## Error Handling

The server includes comprehensive error handling:

- **Global Error Handler** - Catches and formats all application errors
- **Custom App Errors** - Structured error responses with proper HTTP status codes
- **Async Error Wrapper** - Automatic error catching for async route handlers
- **404 Handler** - Proper handling of undefined routes
- **Validation Errors** - Type-safe request validation

## Logging

Structured logging with multiple levels:

- `logger.info()` - General information
- `logger.warn()` - Warning messages
- `logger.error()` - Error messages with stack traces
- `logger.debug()` - Debug information

## Security Features

- **Helmet** - Security headers configuration
- **CORS** - Cross-origin resource sharing setup
- **Request Size Limits** - Protection against large payloads
- **Input Sanitization** - Express built-in protections

## Development Guidelines

1. **Follow strict TypeScript rules** - No exceptions to type safety
2. **Use double quotes** for all strings
3. **Include JSDoc comments** for all public functions
4. **Implement proper error handling** for all operations
5. **Use template strings** instead of concatenation
6. **Validate all inputs** before processing

## Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```bash
   export NODE_ENV=production
   export PORT=8080
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

## Contributing

1. Follow the existing code style and TypeScript configuration
2. Add proper error handling and logging
3. Include comprehensive JSDoc comments
4. Ensure all types are explicitly defined
5. Test all endpoints before submitting

## License

ISC