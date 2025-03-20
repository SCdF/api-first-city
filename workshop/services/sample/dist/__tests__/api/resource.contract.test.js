"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const types_gen_1 = require("../../generated/types.gen");
const resource_repository_1 = require("../../repositories/resource-repository");
const database_1 = require("../helpers/database");
const app_1 = require("../../app");
(0, vitest_1.describe)('Resource API Contract Tests', () => {
    let app;
    let resourceRepository;
    (0, vitest_1.beforeAll)(async () => {
        // Initialize test database before running tests
        const testDataSource = await (0, database_1.setupTestDatabase)();
        app = await (0, app_1.createApp)();
        resourceRepository = new resource_repository_1.ResourceRepository(testDataSource);
    });
    (0, vitest_1.beforeEach)(async () => {
        // Clear the database before each test
        await (0, database_1.clearTestData)();
    });
    (0, vitest_1.afterAll)(async () => {
        // Close database connection after all tests
        await (0, database_1.teardownTestDatabase)();
    });
    (0, vitest_1.describe)('GET /resources', () => {
        (0, vitest_1.it)('should return an empty list when no resources exist', async () => {
            const response = await (0, supertest_1.default)(app).get('/resources');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toEqual({
                items: [],
                page: 1,
                page_size: 20,
                total: 0
            });
        });
        (0, vitest_1.it)('should return a list of resources when they exist', async () => {
            // Create test resources
            await resourceRepository.create({
                name: 'Test Resource 1',
                description: 'Test Description 1',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            await resourceRepository.create({
                name: 'Test Resource 2',
                description: 'Test Description 2',
                status: types_gen_1.ResourceStatus.PENDING
            });
            const response = await (0, supertest_1.default)(app).get('/resources');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                items: vitest_1.expect.arrayContaining([
                    vitest_1.expect.objectContaining({
                        name: 'Test Resource 1',
                        description: 'Test Description 1',
                        status: types_gen_1.ResourceStatus.ACTIVE
                    }),
                    vitest_1.expect.objectContaining({
                        name: 'Test Resource 2',
                        description: 'Test Description 2',
                        status: types_gen_1.ResourceStatus.PENDING
                    })
                ]),
                page: 1,
                page_size: 20,
                total: 2
            });
        });
        (0, vitest_1.it)('should filter resources by name', async () => {
            // Create test resources
            await resourceRepository.create({
                name: 'Test Resource 1',
                description: 'Test Description 1',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            await resourceRepository.create({
                name: 'Different Resource',
                description: 'Test Description 2',
                status: types_gen_1.ResourceStatus.PENDING
            });
            const response = await (0, supertest_1.default)(app).get('/resources?name=Test');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                items: [
                    vitest_1.expect.objectContaining({
                        name: 'Test Resource 1',
                        description: 'Test Description 1',
                        status: types_gen_1.ResourceStatus.ACTIVE
                    })
                ],
                page: 1,
                page_size: 20,
                total: 1
            });
        });
        (0, vitest_1.it)('should handle pagination correctly', async () => {
            // Create test resources
            for (let i = 0; i < 25; i++) {
                await resourceRepository.create({
                    name: `Test Resource ${i + 1}`,
                    description: `Test Description ${i + 1}`,
                    status: types_gen_1.ResourceStatus.ACTIVE
                });
            }
            const response = await (0, supertest_1.default)(app).get('/resources?page=2&page_size=10');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                items: vitest_1.expect.arrayContaining(Array.from({ length: 10 }, (_, i) => vitest_1.expect.objectContaining({
                    name: `Test Resource ${i + 11}`,
                    description: `Test Description ${i + 11}`,
                    status: types_gen_1.ResourceStatus.ACTIVE
                }))),
                page: 2,
                page_size: 10,
                total: 25
            });
        });
    });
    (0, vitest_1.describe)('GET /resources/:id', () => {
        (0, vitest_1.it)('should return 404 for non-existent resource', async () => {
            const response = await (0, supertest_1.default)(app).get('/resources/00000000-0000-0000-0000-000000000000');
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('should return resource by id', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const response = await (0, supertest_1.default)(app).get(`/resources/${resource.id}`);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                id: resource.id,
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
        });
    });
    (0, vitest_1.describe)('POST /resources', () => {
        (0, vitest_1.it)('should create resource with required fields only', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/resources')
                .send({
                name: 'Test Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body).toMatchObject({
                name: 'Test Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
        });
        (0, vitest_1.it)('should create resource with all fields', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/resources')
                .send({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['test', 'example']
            });
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body).toMatchObject({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['test', 'example']
            });
        });
        (0, vitest_1.it)('should return 400 for invalid resource data', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/resources')
                .send({
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            (0, vitest_1.expect)(response.status).toBe(400);
        });
    });
    (0, vitest_1.describe)('PUT /resources/:id', () => {
        (0, vitest_1.it)('should return 404 when updating non-existent resource', async () => {
            const response = await (0, supertest_1.default)(app)
                .put('/resources/00000000-0000-0000-0000-000000000000')
                .send({
                name: 'Updated Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('should update resource fields', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const response = await (0, supertest_1.default)(app)
                .put(`/resources/${resource.id}`)
                .send({
                name: 'Updated Resource',
                description: 'Updated Description',
                status: types_gen_1.ResourceStatus.INACTIVE
            });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body).toMatchObject({
                id: resource.id,
                name: 'Updated Resource',
                description: 'Updated Description',
                status: types_gen_1.ResourceStatus.INACTIVE
            });
        });
    });
    (0, vitest_1.describe)('DELETE /resources/:id', () => {
        (0, vitest_1.it)('should return 404 when deleting non-existent resource', async () => {
            const response = await (0, supertest_1.default)(app).delete('/resources/00000000-0000-0000-0000-000000000000');
            (0, vitest_1.expect)(response.status).toBe(404);
        });
        (0, vitest_1.it)('should delete existing resource', async () => {
            const resource = await resourceRepository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const response = await (0, supertest_1.default)(app).delete(`/resources/${resource.id}`);
            (0, vitest_1.expect)(response.status).toBe(204);
            const deletedResource = await resourceRepository.findById(resource.id);
            (0, vitest_1.expect)(deletedResource).toBeNull();
        });
    });
});
