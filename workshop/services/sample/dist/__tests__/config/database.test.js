"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeTestDatabase = void 0;
const vitest_1 = require("vitest");
const typeorm_1 = require("typeorm");
const resource_entity_1 = require("../../models/resource.entity");
const database_1 = require("../helpers/database");
/**
 * Test database configuration that uses a separate database for testing.
 * This ensures tests don't interfere with development data.
 */
const testConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: `${process.env.DB_DATABASE || 'sample_service'}_test`,
    entities: [resource_entity_1.ResourceEntity],
    migrations: ['../../src/migrations/*.ts'],
    migrationsRun: true,
    dropSchema: true,
    synchronize: true,
    logging: true,
};
const testDataSource = new typeorm_1.DataSource(testConfig);
exports.default = testDataSource;
const initializeTestDatabase = async () => {
    if (!testDataSource.isInitialized) {
        await testDataSource.initialize();
    }
    return testDataSource;
};
exports.initializeTestDatabase = initializeTestDatabase;
(0, vitest_1.describe)('Database Configuration', () => {
    let dataSource;
    (0, vitest_1.beforeAll)(async () => {
        dataSource = await (0, database_1.setupTestDatabase)();
    });
    (0, vitest_1.afterAll)(async () => {
        await (0, database_1.teardownTestDatabase)();
    });
    (0, vitest_1.it)('should initialize database connection', () => {
        (0, vitest_1.expect)(dataSource.isInitialized).toBe(true);
    });
    (0, vitest_1.it)('should have correct configuration', () => {
        (0, vitest_1.expect)(dataSource.options.type).toBe('postgres');
        (0, vitest_1.expect)(dataSource.options.entities).toContain(resource_entity_1.ResourceEntity);
        (0, vitest_1.expect)(dataSource.options.migrations).toEqual(['src/migrations/*.ts']);
        (0, vitest_1.expect)(dataSource.options.migrationsRun).toBe(true);
        (0, vitest_1.expect)(dataSource.options.dropSchema).toBe(true);
        (0, vitest_1.expect)(dataSource.options.synchronize).toBe(false);
    });
    (0, vitest_1.it)('should have resource entity registered', () => {
        const entityMetadata = dataSource.entityMetadatas.find((metadata) => metadata.name === 'ResourceEntity');
        (0, vitest_1.expect)(entityMetadata).toBeDefined();
    });
    (0, vitest_1.it)('should clear test data successfully', async () => {
        // Create a test resource
        const repository = dataSource.getRepository(resource_entity_1.ResourceEntity);
        await repository.save({
            name: 'Test Resource',
            status: 'pending'
        });
        // Clear the data
        await (0, database_1.clearTestData)();
        // Verify the data is cleared
        const count = await repository.count();
        (0, vitest_1.expect)(count).toBe(0);
    });
});
