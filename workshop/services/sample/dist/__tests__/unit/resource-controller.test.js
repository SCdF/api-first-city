"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_controller_1 = require("../../controllers/resource-controller");
const resource_service_1 = require("../../services/resource-service");
const common_1 = require("@city-services/common");
const types_gen_1 = require("../../generated/types.gen");
// Mock the ResourceService
vitest_1.vi.mock('../../services/resource-service', () => {
    return {
        ResourceService: vitest_1.vi.fn().mockImplementation(() => ({
            getResources: vitest_1.vi.fn(),
            getResourceById: vitest_1.vi.fn(),
            createResource: vitest_1.vi.fn(),
            updateResource: vitest_1.vi.fn(),
            deleteResource: vitest_1.vi.fn()
        }))
    };
});
// Mock express middleware
vitest_1.vi.mock('../../middleware/openapi-validator.middleware', () => ({
    validateOpenAPI: vitest_1.vi.fn().mockReturnValue((req, res, next) => next())
}));
(0, vitest_1.describe)('ResourceController', () => {
    let controller;
    let service;
    let req;
    let res;
    let next;
    // Sample resource data for testing
    const mockResource = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Resource',
        description: 'Test Description',
        status: types_gen_1.ResourceStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const mockResourceList = {
        items: [mockResource],
        total: 1,
        page: 1,
        page_size: 20
    };
    (0, vitest_1.beforeEach)(() => {
        // Create fresh mocks for each test
        service = new resource_service_1.ResourceService({});
        controller = new resource_controller_1.ResourceController(service);
        // Mock Express request, response, and next function
        req = {
            params: {},
            query: {},
            body: {}
        };
        res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
            end: vitest_1.vi.fn()
        };
        next = vitest_1.vi.fn();
    });
    (0, vitest_1.describe)('getResources', () => {
        (0, vitest_1.it)('should return resources with default options', async () => {
            // Setup mocks
            vitest_1.vi.mocked(service.getResources).mockResolvedValue(mockResourceList);
            // Call controller method
            await controller.getResources(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.getResources).toHaveBeenCalledWith({
                name: undefined,
                page: NaN,
                page_size: NaN
            });
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(mockResourceList);
        });
        (0, vitest_1.it)('should return resources with query parameters', async () => {
            // Setup request with query params
            req.query = {
                name: 'Test',
                page: '2',
                page_size: '10'
            };
            // Setup service mock
            vitest_1.vi.mocked(service.getResources).mockResolvedValue({
                ...mockResourceList,
                page: 2,
                page_size: 10
            });
            // Call controller method
            await controller.getResources(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.getResources).toHaveBeenCalledWith({
                name: 'Test',
                page: 2,
                page_size: 10
            });
            (0, vitest_1.expect)(res.json).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle errors', async () => {
            // Setup service to throw error
            const error = new Error('Test error');
            vitest_1.vi.mocked(service.getResources).mockRejectedValue(error);
            // Call controller method
            await controller.getResources(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(error);
        });
    });
    (0, vitest_1.describe)('getResourceById', () => {
        (0, vitest_1.it)('should return a resource when it exists', async () => {
            // Setup request params
            req.params = { id: mockResource.id };
            // Setup service mock
            vitest_1.vi.mocked(service.getResourceById).mockResolvedValue(mockResource);
            // Call controller method
            await controller.getResourceById(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.getResourceById).toHaveBeenCalledWith(mockResource.id);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(mockResource);
        });
        (0, vitest_1.it)('should forward NotFoundError to next middleware', async () => {
            // Setup request params
            req.params = { id: 'non-existent-id' };
            // Setup service to throw NotFoundError
            const error = new common_1.NotFoundError('Resource', 'non-existent-id');
            vitest_1.vi.mocked(service.getResourceById).mockRejectedValue(error);
            // Call controller method
            await controller.getResourceById(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(error);
        });
        (0, vitest_1.it)('should throw ValidationError when id is missing', async () => {
            // Setup empty params (missing id)
            req.params = {};
            // Call controller method
            await controller.getResourceById(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(common_1.ValidationError));
            (0, vitest_1.expect)(service.getResourceById).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('createResource', () => {
        (0, vitest_1.it)('should create a new resource', async () => {
            // Setup request body
            req.body = {
                name: 'New Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            };
            // Setup service mock
            vitest_1.vi.mocked(service.createResource).mockResolvedValue(mockResource);
            // Call controller method
            await controller.createResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.createResource).toHaveBeenCalledWith(req.body);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(201);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(mockResource);
        });
        (0, vitest_1.it)('should handle errors', async () => {
            // Setup service to throw error
            const error = new Error('Creation error');
            vitest_1.vi.mocked(service.createResource).mockRejectedValue(error);
            // Call controller method
            await controller.createResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(error);
        });
    });
    (0, vitest_1.describe)('updateResource', () => {
        (0, vitest_1.it)('should update an existing resource', async () => {
            // Setup request params and body
            req.params = { id: mockResource.id };
            req.body = {
                name: 'Updated Resource',
                description: 'Updated Description'
            };
            // Setup service mock
            const updatedResource = {
                ...mockResource,
                name: 'Updated Resource',
                description: 'Updated Description'
            };
            vitest_1.vi.mocked(service.updateResource).mockResolvedValue(updatedResource);
            // Call controller method
            await controller.updateResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.updateResource).toHaveBeenCalledWith(mockResource.id, req.body);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(updatedResource);
        });
        (0, vitest_1.it)('should throw ValidationError when id is missing', async () => {
            // Setup empty params (missing id)
            req.params = {};
            // Call controller method
            await controller.updateResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(common_1.ValidationError));
            (0, vitest_1.expect)(service.updateResource).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should forward NotFoundError to next middleware', async () => {
            // Setup request params
            req.params = { id: 'non-existent-id' };
            // Setup service to throw NotFoundError
            const error = new common_1.NotFoundError('Resource', 'non-existent-id');
            vitest_1.vi.mocked(service.updateResource).mockRejectedValue(error);
            // Call controller method
            await controller.updateResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(error);
        });
    });
    (0, vitest_1.describe)('deleteResource', () => {
        (0, vitest_1.it)('should delete an existing resource', async () => {
            // Setup request params
            req.params = { id: mockResource.id };
            // Setup service mock
            vitest_1.vi.mocked(service.deleteResource).mockResolvedValue(undefined);
            // Call controller method
            await controller.deleteResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(service.deleteResource).toHaveBeenCalledWith(mockResource.id);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(204);
            (0, vitest_1.expect)(res.end).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should throw ValidationError when id is missing', async () => {
            // Setup empty params (missing id)
            req.params = {};
            // Call controller method
            await controller.deleteResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(vitest_1.expect.any(common_1.ValidationError));
            (0, vitest_1.expect)(service.deleteResource).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should forward NotFoundError to next middleware', async () => {
            // Setup request params
            req.params = { id: 'non-existent-id' };
            // Setup service to throw NotFoundError
            const error = new common_1.NotFoundError('Resource', 'non-existent-id');
            vitest_1.vi.mocked(service.deleteResource).mockRejectedValue(error);
            // Call controller method
            await controller.deleteResource(req, res, next);
            // Assertions
            (0, vitest_1.expect)(next).toHaveBeenCalledWith(error);
        });
    });
});
