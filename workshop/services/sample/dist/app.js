"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const common_1 = require("@city-services/common");
const cors_1 = __importDefault(require("cors"));
require("reflect-metadata"); // Required for TypeORM
const config_1 = __importDefault(require("./config/config"));
const resource_repository_1 = require("./repositories/resource-repository");
const resource_service_1 = require("./services/resource-service");
const resource_controller_1 = require("./controllers/resource-controller");
const health_controller_1 = require("./controllers/health-controller");
const swagger_middleware_1 = require("./middleware/swagger.middleware");
const logger = new common_1.Logger({ service: config_1.default.serviceName });
async function createApp() {
    // Create Express application
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    // Setup Swagger UI
    const apiSpecPath = path_1.default.join(__dirname, '../api/openapi.yaml');
    (0, swagger_middleware_1.setupSwaggerUI)(app, apiSpecPath);
    // Create repositories
    logger.info('Creating repositories...');
    const resourceRepository = new resource_repository_1.ResourceRepository();
    // Create services
    logger.info('Creating services...');
    const resourceService = new resource_service_1.ResourceService(resourceRepository);
    // Create controllers
    logger.info('Creating controllers...');
    const resourceController = new resource_controller_1.ResourceController(resourceService);
    const healthController = new health_controller_1.HealthController(config_1.default.version);
    // Register routes
    logger.info('Registering routes...');
    app.use('/resources', resourceController.getRouter());
    app.use('/health', healthController.getRouter());
    // Error handling middleware
    app.use((err, req, res, next) => {
        (0, common_1.errorHandler)(err, req, res, next);
    });
    // Seed data in development mode
    if (config_1.default.environment === 'development') {
        try {
            logger.info('Development mode: Seeding initial data...');
            await resourceService.seedData(20);
            logger.info('Initial data seeded successfully');
        }
        catch (err) {
            logger.error('Error seeding data', err instanceof Error ? err : new Error(String(err)));
        }
    }
    return app;
}
