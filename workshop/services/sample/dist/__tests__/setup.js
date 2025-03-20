"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./helpers/database");
const vitest_1 = require("vitest");
// Set up the database once before all tests
(0, vitest_1.beforeAll)(async () => {
    console.log('🔄 Setting up test database for all tests...');
    try {
        await (0, database_1.setupTestDatabase)();
        console.log('✅ Test database setup complete');
    }
    catch (error) {
        console.error('❌ Failed to set up test database:', error);
        // Don't throw, allow tests to handle missing database
    }
});
// Clear all data before each test to ensure isolation
(0, vitest_1.beforeEach)(async () => {
    console.log('🧹 Clearing test data before test...');
    try {
        await (0, database_1.clearTestData)();
        console.log('✅ Test data cleared');
    }
    catch (error) {
        console.error('❌ Failed to clear test data:', error);
    }
});
// Clean up after all tests are done
(0, vitest_1.afterAll)(async () => {
    console.log('🔄 Cleaning up test database...');
    try {
        await (0, database_1.teardownTestDatabase)();
        console.log('✅ Test database cleaned up successfully');
    }
    catch (error) {
        console.error('❌ Failed to clean up test database:', error);
    }
});
