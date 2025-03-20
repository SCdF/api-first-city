"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const database_1 = require("./helpers/database");
const child_process_1 = require("child_process");
async function default_1() {
    console.log('🔄 Global teardown: cleaning up test database...');
    try {
        // Clean up the database
        await (0, database_1.teardownTestDatabase)();
        console.log('✅ Global teardown: database connection closed successfully');
        // Make sure the container is stopped and removed
        try {
            console.log('🔄 Global teardown: stopping and removing test container...');
            (0, child_process_1.execSync)('./scripts/teardown-test-db.sh', { stdio: 'inherit' });
            console.log('✅ Global teardown: test container removed successfully');
        }
        catch (containerError) {
            console.error('⚠️ Global teardown: error stopping container (may already be stopped):', containerError);
        }
    }
    catch (error) {
        console.error('❌ Global teardown: error cleaning up database:', error);
        // Even if the database cleanup fails, try to stop the container
        try {
            (0, child_process_1.execSync)('./scripts/teardown-test-db.sh', { stdio: 'inherit' });
        }
        catch (containerError) {
            console.error('❌ Global teardown: error stopping container:', containerError);
        }
    }
}
