"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_service_1 = require("../../services/resource-service");
const resource_repository_1 = require("../../repositories/resource-repository");
const common_1 = require("@city-services/common");
const types_gen_1 = require("../../generated/types.gen");
// Mock the ResourceRepository
vitest_1.vi.mock('../../repositories/resource-repository', () => {
    return {
        ResourceRepository: vitest_1.vi.fn().mockImplementation(() => ({
            findAll: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            delete: vitest_1.vi.fn()
        }))
    };
});
(0, vitest_1.describe)('ResourceService', () => {
    let service;
    let repository;
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
        // Create a fresh mock for each test
        repository = new resource_repository_1.ResourceRepository();
        service = new resource_service_1.ResourceService(repository);
    });
    (0, vitest_1.describe)('getResources', () => {
        (0, vitest_1.it)('should retrieve resources with default options', async () => {
            // Setup the mock
            vitest_1.vi.mocked(repository.findAll).mockResolvedValue(mockResourceList);
            // Call the method
            const result = await service.getResources();
            // Assertions
            (0, vitest_1.expect)(repository.findAll).toHaveBeenCalledWith(undefined);
            (0, vitest_1.expect)(result).toEqual(mockResourceList);
        });
        (0, vitest_1.it)('should retrieve resources with provided options', async () => {
            // Options to pass
            const options = { name: 'Test', page: 2, page_size: 10 };
            // Setup the mock
            vitest_1.vi.mocked(repository.findAll).mockResolvedValue({
                ...mockResourceList,
                page: 2,
                page_size: 10
            });
            // Call the method
            const result = await service.getResources(options);
            // Assertions
            (0, vitest_1.expect)(repository.findAll).toHaveBeenCalledWith(options);
            (0, vitest_1.expect)(result.page).toBe(2);
            (0, vitest_1.expect)(result.page_size).toBe(10);
        });
    });
    (0, vitest_1.describe)('getResourceById', () => {
        (0, vitest_1.it)('should return a resource when it exists', async () => {
            // Setup the mock
            vitest_1.vi.mocked(repository.findById).mockResolvedValue(mockResource);
            // Call the method
            const result = await service.getResourceById(mockResource.id);
            // Assertions
            (0, vitest_1.expect)(repository.findById).toHaveBeenCalledWith(mockResource.id);
            (0, vitest_1.expect)(result).toEqual(mockResource);
        });
        (0, vitest_1.it)('should throw NotFoundError when resource does not exist', async () => {
            // Setup the mock to return null (not found)
            vitest_1.vi.mocked(repository.findById).mockResolvedValue(null);
            // Call the method and expect error
            await (0, vitest_1.expect)(service.getResourceById('non-existent-id'))
                .rejects.toThrow(common_1.NotFoundError);
            (0, vitest_1.expect)(repository.findById).toHaveBeenCalledWith('non-existent-id');
        });
    });
    (0, vitest_1.describe)('createResource', () => {
        (0, vitest_1.it)('should create a new resource', async () => {
            // Resource data to create
            const createData = {
                name: 'New Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            };
            // Setup the mock
            const newResource = {
                ...mockResource,
                name: 'New Resource'
            };
            vitest_1.vi.mocked(repository.create).mockResolvedValue(newResource);
            // Call the method
            const result = await service.createResource(createData);
            // Assertions
            (0, vitest_1.expect)(repository.create).toHaveBeenCalledWith(createData);
            (0, vitest_1.expect)(result.name).toBe('New Resource');
        });
    });
    (0, vitest_1.describe)('updateResource', () => {
        (0, vitest_1.it)('should update an existing resource', async () => {
            // Update data
            const updateData = {
                name: 'Updated Resource',
                description: 'Updated Description'
            };
            // Setup the mock
            const updatedResource = {
                ...mockResource,
                name: 'Updated Resource',
                description: 'Updated Description'
            };
            vitest_1.vi.mocked(repository.update).mockResolvedValue(updatedResource);
            // Call the method
            const result = await service.updateResource(mockResource.id, updateData);
            // Assertions
            (0, vitest_1.expect)(repository.update).toHaveBeenCalledWith(mockResource.id, updateData);
            (0, vitest_1.expect)(result.name).toBe('Updated Resource');
            (0, vitest_1.expect)(result.description).toBe('Updated Description');
        });
        (0, vitest_1.it)('should throw NotFoundError when updating non-existent resource', async () => {
            // Setup the mock to return null (not found)
            vitest_1.vi.mocked(repository.update).mockResolvedValue(null);
            // Call the method and expect error
            await (0, vitest_1.expect)(service.updateResource('non-existent-id', { name: 'Test' }))
                .rejects.toThrow(common_1.NotFoundError);
            (0, vitest_1.expect)(repository.update).toHaveBeenCalledWith('non-existent-id', { name: 'Test' });
        });
    });
    (0, vitest_1.describe)('deleteResource', () => {
        (0, vitest_1.it)('should delete an existing resource', async () => {
            // Setup the mock to return true (successful deletion)
            vitest_1.vi.mocked(repository.delete).mockResolvedValue(true);
            // Call the method
            await service.deleteResource(mockResource.id);
            // Assertions
            (0, vitest_1.expect)(repository.delete).toHaveBeenCalledWith(mockResource.id);
        });
        (0, vitest_1.it)('should throw NotFoundError when deleting non-existent resource', async () => {
            // Setup the mock to return false (not found)
            vitest_1.vi.mocked(repository.delete).mockResolvedValue(false);
            // Call the method and expect error
            await (0, vitest_1.expect)(service.deleteResource('non-existent-id'))
                .rejects.toThrow(common_1.NotFoundError);
            (0, vitest_1.expect)(repository.delete).toHaveBeenCalledWith('non-existent-id');
        });
    });
});
