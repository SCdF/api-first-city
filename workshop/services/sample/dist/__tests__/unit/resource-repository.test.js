"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resource_repository_1 = require("../../repositories/resource-repository");
const resource_entity_1 = require("../../models/resource.entity");
const types_gen_1 = require("../../generated/types.gen");
(0, vitest_1.describe)('ResourceRepository Unit Tests', () => {
    let repository;
    let mockDataSource;
    let mockTypeOrmRepository;
    let mockQueryBuilder;
    const sampleUuid = '123e4567-e89b-12d3-a456-426614174000';
    // Create sample entity data
    const resourceEntity = {
        id: sampleUuid,
        name: 'Test Resource',
        description: 'Test Description',
        status: types_gen_1.ResourceStatus.ACTIVE,
        tags: ['test', 'sample'],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    // Create sample resource data (API model)
    const resource = {
        id: resourceEntity.id,
        name: resourceEntity.name,
        description: resourceEntity.description,
        status: resourceEntity.status,
        tags: resourceEntity.tags,
        createdAt: resourceEntity.createdAt,
        updatedAt: resourceEntity.updatedAt
    };
    (0, vitest_1.beforeEach)(() => {
        // Mock QueryBuilder
        mockQueryBuilder = {
            where: vitest_1.vi.fn().mockReturnThis(),
            andWhere: vitest_1.vi.fn().mockReturnThis(),
            skip: vitest_1.vi.fn().mockReturnThis(),
            take: vitest_1.vi.fn().mockReturnThis(),
            getMany: vitest_1.vi.fn(),
            getManyAndCount: vitest_1.vi.fn(),
            getCount: vitest_1.vi.fn(),
            getOne: vitest_1.vi.fn(),
            execute: vitest_1.vi.fn(),
            orderBy: vitest_1.vi.fn().mockReturnThis()
        };
        // Mock Repository
        mockTypeOrmRepository = {
            createQueryBuilder: vitest_1.vi.fn().mockReturnValue(mockQueryBuilder),
            findOne: vitest_1.vi.fn(),
            findOneBy: vitest_1.vi.fn(),
            save: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            delete: vitest_1.vi.fn(),
            merge: vitest_1.vi.fn()
        };
        // Mock DataSource
        mockDataSource = {
            getRepository: vitest_1.vi.fn().mockReturnValue(mockTypeOrmRepository)
        };
        // Create repository instance with mocked dependencies
        repository = new resource_repository_1.ResourceRepository(mockDataSource);
    });
    (0, vitest_1.describe)('findAll', () => {
        (0, vitest_1.it)('should return empty list when no resources exist', async () => {
            // Mock empty result
            mockQueryBuilder.getMany.mockResolvedValue([]);
            mockQueryBuilder.getCount.mockResolvedValue(0);
            // Call method
            const result = await repository.findAll();
            // Assertions
            (0, vitest_1.expect)(mockDataSource.getRepository).toHaveBeenCalledWith(resource_entity_1.ResourceEntity);
            (0, vitest_1.expect)(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('resource');
            (0, vitest_1.expect)(result.items).toHaveLength(0);
            (0, vitest_1.expect)(result.total).toBe(0);
            (0, vitest_1.expect)(result.page).toBe(1);
            (0, vitest_1.expect)(result.page_size).toBe(20);
        });
        (0, vitest_1.it)('should filter resources by name', async () => {
            // Mock result with one entity
            mockQueryBuilder.getMany.mockResolvedValue([resourceEntity]);
            mockQueryBuilder.getCount.mockResolvedValue(1);
            // Important: mock where instead of andWhere for the first condition
            mockQueryBuilder.where.mockReturnThis();
            // Call method with name filter
            const result = await repository.findAll({ name: 'Test' });
            // Assertions
            (0, vitest_1.expect)(mockQueryBuilder.where).toHaveBeenCalledWith('resource.name ILIKE :name', { name: '%Test%' });
            (0, vitest_1.expect)(result.items).toHaveLength(1);
            (0, vitest_1.expect)(result.items[0].name).toBe('Test Resource');
        });
        (0, vitest_1.it)('should paginate results', async () => {
            // Mock result
            mockQueryBuilder.getMany.mockResolvedValue([resourceEntity]);
            mockQueryBuilder.getCount.mockResolvedValue(10);
            // Call method with pagination
            const result = await repository.findAll({ page: 2, page_size: 5 });
            // Assertions
            (0, vitest_1.expect)(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
            (0, vitest_1.expect)(mockQueryBuilder.take).toHaveBeenCalledWith(5);
            (0, vitest_1.expect)(result.page).toBe(2);
            (0, vitest_1.expect)(result.page_size).toBe(5);
            (0, vitest_1.expect)(result.total).toBe(10);
        });
    });
    (0, vitest_1.describe)('findById', () => {
        (0, vitest_1.it)('should return a resource when it exists', async () => {
            // Mock repository to return the entity
            mockTypeOrmRepository.findOneBy.mockResolvedValue(resourceEntity);
            // Call method
            const result = await repository.findById(sampleUuid);
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: sampleUuid });
            (0, vitest_1.expect)(result).toEqual(resource);
        });
        (0, vitest_1.it)('should return null when resource does not exist', async () => {
            // Mock repository to return null
            mockTypeOrmRepository.findOneBy.mockResolvedValue(null);
            // Call method
            const result = await repository.findById('non-existent-id');
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.findOneBy).toHaveBeenCalledWith({ id: 'non-existent-id' });
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create and return a new resource', async () => {
            // Create data for new resource
            const createData = {
                name: 'New Resource',
                status: types_gen_1.ResourceStatus.ACTIVE
            };
            // Mock TypeORM create and save
            const newEntity = {
                ...resourceEntity,
                name: 'New Resource',
                id: 'new-id'
            };
            mockTypeOrmRepository.create.mockReturnValue(newEntity);
            mockTypeOrmRepository.save.mockResolvedValue(newEntity);
            // Call method
            const result = await repository.create(createData);
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.create).toHaveBeenCalled();
            (0, vitest_1.expect)(mockTypeOrmRepository.save).toHaveBeenCalled();
            (0, vitest_1.expect)(result.name).toBe('New Resource');
            (0, vitest_1.expect)(result.id).toBe('new-id');
        });
    });
    (0, vitest_1.describe)('update', () => {
        (0, vitest_1.it)('should update and return an existing resource', async () => {
            // Update data
            const updateData = {
                name: 'Updated Resource',
                description: 'Updated Description'
            };
            // Mock findOne instead of findOneBy - this matches the actual implementation
            mockTypeOrmRepository.findOne.mockResolvedValue(resourceEntity);
            // Mock merge to return merged entity
            const mergedEntity = {
                ...resourceEntity,
                ...updateData,
                updatedAt: new Date()
            };
            mockTypeOrmRepository.merge.mockReturnValue(mergedEntity);
            // Mock save to return updated entity
            mockTypeOrmRepository.save.mockResolvedValue(mergedEntity);
            // Call method
            const result = await repository.update(sampleUuid, updateData);
            // Assertions - check if findOne was called with correct params
            (0, vitest_1.expect)(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: sampleUuid } });
            (0, vitest_1.expect)(mockTypeOrmRepository.merge).toHaveBeenCalled();
            (0, vitest_1.expect)(mockTypeOrmRepository.save).toHaveBeenCalled();
            (0, vitest_1.expect)(result?.name).toBe('Updated Resource');
            (0, vitest_1.expect)(result?.description).toBe('Updated Description');
        });
        (0, vitest_1.it)('should return null when updating non-existent resource', async () => {
            // Mock findOne to return null (not found)
            mockTypeOrmRepository.findOne.mockResolvedValue(null);
            // Call method
            const result = await repository.update('non-existent-id', { name: 'Test' });
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
            (0, vitest_1.expect)(mockTypeOrmRepository.save).not.toHaveBeenCalled();
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('delete', () => {
        (0, vitest_1.it)('should delete an existing resource and return true', async () => {
            // No need to mock findOneBy for delete based on the implementation
            // Mock delete to indicate success (affected rows > 0)
            mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: {} });
            // Call method
            const result = await repository.delete(sampleUuid);
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.delete).toHaveBeenCalledWith(sampleUuid);
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false when deleting non-existent resource', async () => {
            // Mock delete to indicate not found (affected rows = 0)
            mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: {} });
            // Call method
            const result = await repository.delete('non-existent-id');
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.delete).toHaveBeenCalledWith('non-existent-id');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return false when delete operation fails', async () => {
            // Mock delete to indicate failure (affected rows = 0)
            mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: {} });
            // Call method
            const result = await repository.delete(sampleUuid);
            // Assertions
            (0, vitest_1.expect)(mockTypeOrmRepository.delete).toHaveBeenCalledWith(sampleUuid);
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
});
