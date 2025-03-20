"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const config_1 = __importDefault(require("../../config/config"));
const config_2 = require("../../config/config");
const nock_1 = __importDefault(require("nock"));
const service_registry_1 = require("@city-services/service-registry");
(0, vitest_1.describe)('Service Registry Integration Tests', () => {
    let serviceRegistry;
    (0, vitest_1.beforeAll)(async () => {
        // Initialize configuration
        await (0, config_2.initializeConfig)();
        serviceRegistry = new service_registry_1.ServiceRegistryClient({
            serviceName: config_1.default.serviceName,
            serviceUrl: `http://localhost:${config_1.default.port}`,
            registryUrl: config_1.default.serviceRegistry.url
        });
    });
    (0, vitest_1.beforeEach)(() => {
        // Clear all nock interceptors
        nock_1.default.cleanAll();
    });
    (0, vitest_1.afterAll)(() => {
        nock_1.default.restore();
    });
    (0, vitest_1.describe)('service registration', () => {
        (0, vitest_1.it)('should register service successfully', async () => {
            // Mock service registry endpoint
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .post('/register')
                .reply(201, {
                status: 'registered',
                timestamp: new Date().toISOString()
            });
            const result = await serviceRegistry.register();
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should handle registration failure', async () => {
            // Mock service registry endpoint with error
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .post('/register')
                .reply(500, { error: 'Internal Server Error' });
            const result = await serviceRegistry.register();
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('service discovery', () => {
        (0, vitest_1.it)('should discover other services', async () => {
            const mockService = {
                url: 'http://localhost:4001',
                healthCheckUrl: 'http://localhost:4001/health',
                metadata: {},
                lastHeartbeat: Date.now()
            };
            // Mock service registry discovery endpoint
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .get('/services/iam-service')
                .reply(200, mockService);
            const service = await serviceRegistry.discover('iam-service');
            (0, vitest_1.expect)(service).toBeDefined();
            (0, vitest_1.expect)(service?.url).toBe('http://localhost:4001');
        });
        (0, vitest_1.it)('should handle empty service discovery result', async () => {
            // Mock service registry discovery endpoint with 404
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .get('/services/non-existent')
                .reply(404, {
                error: 'not_found',
                message: 'Service not found'
            });
            const service = await serviceRegistry.discover('non-existent');
            (0, vitest_1.expect)(service).toBeNull();
        });
        (0, vitest_1.it)('should handle service discovery failure', async () => {
            // Mock service registry discovery endpoint with error
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .get('/services/iam-service')
                .reply(500, { error: 'Internal Server Error' });
            const service = await serviceRegistry.discover('iam-service');
            (0, vitest_1.expect)(service).toBeNull();
        });
    });
    (0, vitest_1.describe)('service listing', () => {
        (0, vitest_1.it)('should list all services', async () => {
            const mockServices = {
                'iam-service': {
                    url: 'http://localhost:4001',
                    healthCheckUrl: 'http://localhost:4001/health',
                    metadata: {},
                    lastHeartbeat: Date.now()
                }
            };
            // Mock service registry list endpoint
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .get('/services')
                .reply(200, mockServices);
            const services = await serviceRegistry.listAll();
            (0, vitest_1.expect)(services).toBeDefined();
            (0, vitest_1.expect)(services['iam-service']).toBeDefined();
            (0, vitest_1.expect)(services['iam-service'].url).toBe('http://localhost:4001');
        });
        (0, vitest_1.it)('should handle empty service list', async () => {
            // Mock service registry list endpoint with empty result
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .get('/services')
                .reply(200, {});
            const services = await serviceRegistry.listAll();
            (0, vitest_1.expect)(Object.keys(services)).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('service deregistration', () => {
        (0, vitest_1.it)('should unregister service successfully', async () => {
            // Mock service registry unregister endpoint
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .delete(`/services/${config_1.default.serviceName}`)
                .reply(200, {
                status: 'deleted',
                timestamp: new Date().toISOString()
            });
            const result = await serviceRegistry.unregister();
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should handle unregistration failure', async () => {
            // Register the service first
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .post('/register')
                .reply(201, {
                status: 'registered',
                timestamp: new Date().toISOString()
            });
            await serviceRegistry.register();
            // Mock service registry unregister endpoint with error
            (0, nock_1.default)(config_1.default.serviceRegistry.url)
                .delete(`/services/${config_1.default.serviceName}`)
                .reply(500, { error: 'Internal Server Error' });
            const result = await serviceRegistry.unregister();
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
