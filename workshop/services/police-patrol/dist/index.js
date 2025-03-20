"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const common_1 = require("@city-services/common");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
require("reflect-metadata"); // Required for TypeORM
const config_1 = __importStar(require("./config/config"));
const database_1 = require("./config/database");
const swagger_middleware_1 = require("./middleware/swagger.middleware");
const app_1 = require("./app");
// Create Express application
const app = (0, express_1.default)();
const logger = new common_1.Logger({ service: config_1.default.serviceName });
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Middleware
app.use(express_1.default.json());
app.use((req, res, next) => {
    (0, common_1.requestLogger)(config_1.default.serviceName)(req, res, next);
});
// Set up OpenAPI spec path
const apiSpecPath = path_1.default.join(__dirname, '../api/openapi.yaml');
// Set up Swagger UI for API documentation
(0, swagger_middleware_1.setupSwaggerUI)(app, apiSpecPath);
// Set up OpenAPI validation
app.use(OpenApiValidator.middleware({
    apiSpec: apiSpecPath,
    validateRequests: true,
    validateResponses: false, // Set to true in development to validate responses
}));
// Function to check if a service is available
async function checkServiceAvailability(url, serviceName) {
    try {
        logger.info(`Checking ${serviceName} availability at ${url}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${url}/health`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            logger.info(`${serviceName} is available`);
            return true;
        }
        else {
            logger.warn(`${serviceName} returned status ${response.status}`);
            return false;
        }
    }
    catch (error) {
        logger.warn(`${serviceName} not available: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
async function startServer() {
    try {
        logger.info('Starting sample service...');
        logger.info(`Environment: ${config_1.default.environment}`);
        logger.info(`Service Name: ${config_1.default.serviceName}`);
        logger.info(`Service Registry URL: ${config_1.default.serviceRegistry.url}`);
        logger.info(`IAM Service URL: ${config_1.default.iam.url}`);
        // Check service registry availability
        const isServiceRegistryAvailable = await checkServiceAvailability(config_1.default.serviceRegistry.url, 'Service Registry');
        if (!isServiceRegistryAvailable) {
            logger.warn(`Service Registry not available. You may need to start it with:`);
            logger.warn(`cd workshop/infrastructure/service-registry && docker-compose up`);
        }
        // Check IAM service availability
        const isIamServiceAvailable = await checkServiceAvailability(config_1.default.iam.url, 'IAM Service');
        if (!isIamServiceAvailable) {
            logger.warn(`IAM Service not available. This may affect authentication.`);
        }
        // Initialize remote configuration
        logger.info('Initializing remote configuration...');
        await (0, config_1.initializeConfig)();
        logger.info('Remote configuration initialized successfully');
        // Initialize database connection
        logger.info('Initializing database connection...');
        await (0, database_1.initializeDatabase)();
        logger.info('Database initialized successfully');
        // Get the configured app
        const app = await (0, app_1.createApp)();
        // Start the server
        const server = app.listen(config_1.default.port, () => {
            logger.info(`✅ Sample service running on port ${config_1.default.port}`);
            logger.info(`API documentation available at http://localhost:${config_1.default.port}/api-docs`);
            logger.info('Service dependencies status:');
            logger.info(`- PostgreSQL database: Connected`);
            logger.info(`- Service Registry: ${isServiceRegistryAvailable ? 'Available' : 'Not available'}`);
            logger.info(`- IAM Service: ${isIamServiceAvailable ? 'Available' : 'Not available'}`);
            logger.info('\nUseful commands:');
            logger.info('- Run everything: docker-compose up');
            logger.info('- Run database only: docker-compose up sample-service-db');
            logger.info('- Run service registry: cd workshop/infrastructure/service-registry && docker-compose up');
        });
        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });
        });
    }
    catch (error) {
        logger.error('Failed to start server', error instanceof Error ? error : new Error(String(error)));
        logger.error('\nPlease check:');
        logger.error('1. Database is running and accessible (DB_HOST=' + config_1.default.db.host + ')');
        logger.error('2. Service Registry is running and accessible (SERVICE_REGISTRY_URL=' +
            config_1.default.serviceRegistry.url +
            ')');
        logger.error('3. IAM Service is running and accessible (IAM_URL=' + config_1.default.iam.url + ')');
        logger.error('4. Environment variables are correctly set in .env file');
        logger.error('\nQuick fix:');
        logger.error('- Run database only: docker-compose up sample-service-db');
        logger.error('- Run service registry: cd workshop/infrastructure/service-registry && docker-compose up');
        process.exit(1);
    }
}
// Start the server
startServer();
