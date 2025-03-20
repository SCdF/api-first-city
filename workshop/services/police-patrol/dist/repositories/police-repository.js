"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRepository = void 0;
const database_1 = require("../config/database");
const resource_entity_1 = require("../models/resource.entity");
/**
 * Repository class for managing resource entities in the database.
 * Provides data access methods and implements TypeORM repository pattern.
 *
 * @class ResourceRepository
 */
class ResourceRepository {
    /**
     * Creates an instance of ResourceRepository.
     * Initializes the TypeORM repository for PolicePatrolEntity.
     *
     * @constructor
     * @param {DataSource} [customDataSource] - Optional custom data source for testing
     */
    constructor(customDataSource) {
        this.dataSource = customDataSource || database_1.dataSource;
        this.repository = this.dataSource.getRepository(resource_entity_1.PolicePatrolEntity);
    }
    /**
     * Gets the repository instance for the current transaction context.
     * If no transaction is provided, returns the default repository.
     *
     * @private
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Repository<PolicePatrolEntity>} The repository instance to use
     */
    getRepository(queryRunner) {
        return queryRunner ? queryRunner.manager.getRepository(resource_entity_1.PolicePatrolEntity) : this.repository;
    }
    /**
     * Maps a PolicePatrolEntity to a Resource type.
     *
     * @private
     * @param {PolicePatrolEntity} entity - The entity to map
     * @returns {Resource} The mapped resource
     */
    mapEntityToResource(entity) {
        return {
            id: entity.id,
            caseId: entity.caseId,
            location: entity.location,
            startedAt: entity.startedAt instanceof Date ? entity.startedAt : new Date(entity.startedAt),
            endedAt: entity.endedAt
                ? entity.endedAt instanceof Date
                    ? entity.endedAt
                    : new Date(entity.endedAt)
                : undefined,
            patrolType: entity.patrolType,
            callType: entity.callType,
            createdAt: entity.createdAt instanceof Date ? entity.createdAt : new Date(entity.createdAt),
            updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt : new Date(entity.updatedAt),
        };
    }
    /**
     * Retrieves a paginated list of resources with optional filtering.
     *
     * @async
     * @param {FindAllOptions} [options] - Optional parameters for filtering and pagination
     * @returns {Promise<ResourceList>} A promise that resolves to a paginated list of resources
     */
    async findAll(options) {
        const page = options?.page ?? 1;
        const page_size = options?.page_size ?? 20;
        // Create query builder
        const queryBuilder = this.repository.createQueryBuilder('resource');
        // Apply filters
        if (options?.name) {
            queryBuilder.where('resource.name ILIKE :name', { name: `%${options.name}%` });
        }
        // Get total count
        const total = await queryBuilder.getCount();
        // Apply pagination
        const skip = (page - 1) * page_size;
        queryBuilder.skip(skip).take(page_size);
        // Order by created date
        queryBuilder.orderBy('resource.createdAt', 'DESC');
        // Execute query
        const items = await queryBuilder.getMany();
        return {
            items: items,
            total,
            page,
            page_size,
        };
    }
    /**
     * Finds a resource by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the resource
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Promise<Resource | null>} A promise that resolves to the found resource or null if not found
     */
    async findById(id, queryRunner) {
        const repository = this.getRepository(queryRunner);
        const entity = await repository.findOneBy({ id });
        return entity;
    }
    /**
     * Creates a new resource within an optional transaction.
     *
     * @async
     * @param {ResourceCreate} data - The resource data to create
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Promise<Resource>} A promise that resolves to the created resource
     */
    async create(data, queryRunner) {
        const repository = this.getRepository(queryRunner);
        const entity = repository.create({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const saved = await repository.save(entity);
        return this.mapEntityToResource(saved);
    }
    /**
     * Updates an existing resource within an optional transaction.
     *
     * @async
     * @param {string} id - The ID of the resource to update
     * @param {ResourceUpdate} data - The update data
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Promise<Resource | null>} A promise that resolves to the updated resource or null if not found
     */
    async update(id, data, queryRunner) {
        const repository = this.getRepository(queryRunner);
        const existing = await repository.findOne({ where: { id } });
        if (!existing) {
            return null;
        }
        const updated = repository.merge(existing, {
            ...data,
            updatedAt: new Date(),
        });
        const saved = await repository.save(updated);
        return this.mapEntityToResource(saved);
    }
    /**
     * Deletes a resource within an optional transaction.
     *
     * @async
     * @param {string} id - The ID of the resource to delete
     * @param {QueryRunner} [queryRunner] - Optional query runner for transaction context
     * @returns {Promise<boolean>} A promise that resolves to true if the resource was deleted
     */
    async delete(id, queryRunner) {
        const repository = this.getRepository(queryRunner);
        const result = await repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
    /**
     * Seeds the repository with sample data for development/testing purposes.
     *
     * @async
     * @param {number} [count=10] - The number of sample resources to create
     * @returns {Promise<void>} A promise that resolves when seeding is complete
     */
    async seed(count = 10) {
        for (let i = 0; i < count; i++) {
            const partialEntity = {
                caseId: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
                location: `Location ${i + 1}`,
                startedAt: new Date(),
                endedAt: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 10000000) : undefined,
                patrolType: Math.random() > 0.5 ? 'foot' : 'car',
                callType: Math.random() > 0.5 ? 'suspicious youths' : 'sporting event gone wrong',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const entity = this.repository.create(partialEntity);
            await this.repository.save(entity);
        }
    }
}
exports.ResourceRepository = ResourceRepository;
