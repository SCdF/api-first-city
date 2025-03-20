"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicePatrolService = void 0;
const common_1 = require("@city-services/common");
/**
 * Service class responsible for handling PolicePatrol business logic.
 * Implements operations for managing PolicePatrols including CRUD operations
 * and data validation.
 *
 * @class PolicePatrolService
 */
class PolicePatrolService {
    /**
     * Creates an instance of PolicePatrolService.
     *
     * @constructor
     * @param {ResourceRepository} repository - The repository instance for data access
     */
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Retrieves a paginated list of PolicePatrols with optional filtering.
     *
     * @async
     * @param {GetPolicePatrolsOptions} [options] - Optional parameters for filtering and pagination
     * @returns {Promise<PolicePatrolList>} A promise that resolves to a paginated list of PolicePatrols
     */
    async getPolicePatrols(options) {
        return this.repository.findAll(options);
    }
    /**
     * Retrieves a single PolicePatrol by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the PolicePatrol
     * @returns {Promise<PolicePatrol>} A promise that resolves to the found PolicePatrol
     * @throws {NotFoundError} When the PolicePatrol with the given ID doesn't exist
     */
    async getPolicePatrolById(id) {
        const PolicePatrol = await this.repository.findById(id);
        if (!PolicePatrol) {
            throw new common_1.NotFoundError('PolicePatrol', id);
        }
        return PolicePatrol;
    }
    /**
     * Creates a new PolicePatrol with the provided data.
     *
     * @async
     * @param {PolicePatrolCreate} data - The data for creating a new PolicePatrol
     * @returns {Promise<PolicePatrol>} A promise that resolves to the newly created PolicePatrol
     */
    async createPolicePatrol(data) {
        return this.repository.create(data);
    }
    /**
     * Updates an existing PolicePatrol with the provided data.
     *
     * @async
     * @param {string} id - The unique identifier of the PolicePatrol to update
     * @param {PolicePatrolUpdate} data - The data to update the PolicePatrol with
     * @returns {Promise<PolicePatrol>} A promise that resolves to the updated PolicePatrol
     * @throws {NotFoundError} When the PolicePatrol with the given ID doesn't exist
     */
    async updatePolicePatrol(id, data) {
        const updatedPolicePatrol = await this.repository.update(id, data);
        if (!updatedPolicePatrol) {
            throw new common_1.NotFoundError('PolicePatrol', id);
        }
        return updatedPolicePatrol;
    }
    /**
     * Deletes a PolicePatrol by its unique identifier.
     *
     * @async
     * @param {string} id - The unique identifier of the PolicePatrol to delete
     * @returns {Promise<void>} A promise that resolves when the PolicePatrol is deleted
     * @throws {NotFoundError} When the PolicePatrol with the given ID doesn't exist
     */
    async deletePolicePatrol(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundError('PolicePatrol', id);
        }
    }
    /**
     * Seeds the repository with sample data for development/testing purposes.
     *
     * @async
     * @param {number} [count=10] - The number of sample PolicePatrols to create
     * @returns {Promise<void>} A promise that resolves when seeding is complete
     */
    async seedData(count = 10) {
        await this.repository.seed(count);
    }
}
exports.PolicePatrolService = PolicePatrolService;
