"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_repository_1 = require("../../repositories/resource-repository");
const types_gen_1 = require("../../generated/types.gen");
const database_1 = require("../helpers/database");
(0, vitest_1.describe)('ResourceRepository Integration Tests', () => {
    let repository;
    const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';
    (0, vitest_1.beforeAll)(async () => {
        const dataSource = await (0, database_1.setupTestDatabase)();
        repository = new resource_repository_1.ResourceRepository(dataSource);
    });
    (0, vitest_1.beforeEach)(async () => {
        await (0, database_1.clearTestData)();
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, database_1.teardownTestDatabase)();
    });
    (0, vitest_1.describe)('findAll', () => {
        (0, vitest_1.it)('should return empty list when no resources exist', async () => {
            const result = await repository.findAll();
            (0, vitest_1.expect)(result.items).toHaveLength(0);
            (0, vitest_1.expect)(result.total).toBe(0);
        });
        (0, vitest_1.it)('should return all resources with default pagination', async () => {
            // Create test resources
            await repository.create({
                name: 'Test Resource 1',
                description: 'Description 1',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            await repository.create({
                name: 'Test Resource 2',
                description: 'Description 2',
                status: types_gen_1.ResourceStatus.INACTIVE
            });
            const result = await repository.findAll();
            (0, vitest_1.expect)(result.items).toHaveLength(2);
            (0, vitest_1.expect)(result.total).toBe(2);
            (0, vitest_1.expect)(result.page).toBe(1);
            (0, vitest_1.expect)(result.page_size).toBe(20);
        });
        (0, vitest_1.it)('should filter resources by name', async () => {
            await repository.create({
                name: 'Test Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            await repository.create({
                name: 'Different Name',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const result = await repository.findAll({ name: 'Test' });
            (0, vitest_1.expect)(result.items).toHaveLength(1);
            (0, vitest_1.expect)(result.items[0].name).toBe('Test Resource');
        });
        (0, vitest_1.it)('should handle pagination correctly', async () => {
            // Create 25 resources
            for (let i = 0; i < 25; i++) {
                await repository.create({
                    name: `Resource ${i + 1}`,
                    status: types_gen_1.ResourceStatus.ACTIVE
                });
            }
            const page2 = await repository.findAll({ page: 2, page_size: 10 });
            (0, vitest_1.expect)(page2.items).toHaveLength(10);
            (0, vitest_1.expect)(page2.total).toBe(25);
            (0, vitest_1.expect)(page2.page).toBe(2);
            (0, vitest_1.expect)(page2.page_size).toBe(10);
        });
    });
    (0, vitest_1.describe)('findById', () => {
        (0, vitest_1.it)('should return null for non-existent resource', async () => {
            const result = await repository.findById(NON_EXISTENT_UUID);
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should return resource by id', async () => {
            const created = await repository.create({
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const result = await repository.findById(created.id);
            (0, vitest_1.expect)(result).toMatchObject({
                id: created.id,
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
        });
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create resource with required fields only', async () => {
            const result = await repository.create({
                name: 'Minimal Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            (0, vitest_1.expect)(result).toMatchObject({
                name: 'Minimal Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            (0, vitest_1.expect)(result.id).toBeDefined();
            (0, vitest_1.expect)(result.createdAt).toBeInstanceOf(Date);
            (0, vitest_1.expect)(result.updatedAt).toBeInstanceOf(Date);
        });
        (0, vitest_1.it)('should create resource with all fields', async () => {
            const result = await repository.create({
                name: 'Full Resource',
                description: 'Full Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['tag1', 'tag2']
            });
            (0, vitest_1.expect)(result).toMatchObject({
                name: 'Full Resource',
                description: 'Full Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['tag1', 'tag2']
            });
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should return null when updating non-existent resource', async () => {
            const result = await repository.update(NON_EXISTENT_UUID, {
                name: 'Updated Name'
            });
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should update resource fields', async () => {
            const created = await repository.create({
                name: 'Original Name',
                description: 'Original Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['original']
            });
            const result = await repository.update(created.id, {
                name: 'Updated Name',
                description: 'Updated Description',
                status: types_gen_1.ResourceStatus.INACTIVE,
                tags: ['updated']
            });
            (0, vitest_1.expect)(result).toMatchObject({
                id: created.id,
                name: 'Updated Name',
                description: 'Updated Description',
                status: types_gen_1.ResourceStatus.INACTIVE,
                tags: ['updated']
            });
            (0, vitest_1.expect)(new Date(result.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
        });
        (0, vitest_1.it)('should only update provided fields', async () => {
            const created = await repository.create({
                name: 'Original Name',
                description: 'Original Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const result = await repository.update(created.id, {
                name: 'Updated Name'
            });
            (0, vitest_1.expect)(result).toMatchObject({
                id: created.id,
                name: 'Updated Name',
                description: 'Original Description',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
        });
    });
    (0, vitest_1.describe)('delete', () => {
        (0, vitest_1.it)('should return false when deleting non-existent resource', async () => {
            const result = await repository.delete(NON_EXISTENT_UUID);
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should delete existing resource', async () => {
            const created = await repository.create({
                name: 'To Delete',
                status: types_gen_1.ResourceStatus.ACTIVE
            });
            const deleteResult = await repository.delete(created.id);
            (0, vitest_1.expect)(deleteResult).toBe(true);
            const findResult = await repository.findById(created.id);
            (0, vitest_1.expect)(findResult).toBeNull();
        });
    });
});
