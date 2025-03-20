"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const database_1 = require("./helpers/database");
async function default_1() {
    console.log('🔄 Global setup: initializing test database...');
    try {
        // Set up the database once for all tests
        await (0, database_1.setupTestDatabase)();
        console.log('✅ Global setup: test database initialized successfully');
    }
    catch (error) {
        console.error('❌ Global setup: failed to initialize test database:', error);
        // Don't throw here, allow tests to continue and possibly skip if DB isn't available
    }
}
