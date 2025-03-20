"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.dataSource = exports.dataSourceOptions = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const resource_entity_1 = require("../models/resource.entity");
const config_1 = __importDefault(require("./config"));
const common_1 = require("@city-services/common");
const logger = new common_1.Logger({ service: config_1.default.serviceName });
exports.dataSourceOptions = {
    type: 'postgres',
    host: config_1.default.db.host,
    port: config_1.default.db.port,
    username: config_1.default.db.username,
    password: config_1.default.db.password,
    database: config_1.default.db.database,
    synchronize: config_1.default.environment === 'development',
    logging: config_1.default.environment === 'development',
    entities: [resource_entity_1.ResourceEntity],
    migrations: ['../../migrations/*.{ts,js}'],
    migrationsRun: true
};
exports.dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
// export default dataSource;
const initializeDatabase = async () => {
    try {
        logger.info(`Attempting to connect to database at ${config_1.default.db.host}:${config_1.default.db.port}/${config_1.default.db.database}`);
        logger.info(`Database connection details: Host=${config_1.default.db.host}, Port=${config_1.default.db.port}, User=${config_1.default.db.username}, Database=${config_1.default.db.database}`);
        if (!exports.dataSource.isInitialized) {
            await exports.dataSource.initialize();
            logger.info('Database connection established successfully');
        }
        return exports.dataSource;
    }
    catch (error) {
        logger.error('Error connecting to database', error instanceof Error ? error : new Error(String(error)));
        logger.error('Please ensure PostgreSQL is running and the connection details are correct in .env file');
        logger.info('You can run the database using: docker-compose up sample-service-db');
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
