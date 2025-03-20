import {
  PolicePatrolList,
  PolicePatrol,
  PolicePatrolCreate,
  PolicePatrolUpdate,
} from '@/generated';
import { ResourceRepository } from '@/repositories/police-repository';
import { NotFoundError } from '@city-services/common';

/**
 * Options for retrieving PolicePatrols with pagination and filtering.
 *
 * @interface GetPolicePatrolsOptions
 * @property {string} [name] - Optional filter to search PolicePatrols by name
 * @property {number} [page] - Page number for pagination (1-based indexing)
 * @property {number} [page_size] - Number of items per page
 */
interface GetPolicePatrolsOptions {
  name?: string;
  page?: number;
  page_size?: number;
}

/**
 * Service class responsible for handling PolicePatrol business logic.
 * Implements operations for managing PolicePatrols including CRUD operations
 * and data validation.
 *
 * @class PolicePatrolService
 */
export class PolicePatrolService {
  private repository: ResourceRepository;

  /**
   * Creates an instance of PolicePatrolService.
   *
   * @constructor
   * @param {ResourceRepository} repository - The repository instance for data access
   */
  constructor(repository: ResourceRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a paginated list of PolicePatrols with optional filtering.
   *
   * @async
   * @param {GetPolicePatrolsOptions} [options] - Optional parameters for filtering and pagination
   * @returns {Promise<PolicePatrolList>} A promise that resolves to a paginated list of PolicePatrols
   */
  async getPolicePatrols(options?: GetPolicePatrolsOptions): Promise<PolicePatrolList> {
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
  async getPolicePatrolById(id: string): Promise<PolicePatrol> {
    const PolicePatrol = await this.repository.findById(id);
    if (!PolicePatrol) {
      throw new NotFoundError('PolicePatrol', id);
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
  async createPolicePatrol(data: PolicePatrolCreate): Promise<PolicePatrol> {
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
  async updatePolicePatrol(id: string, data: PolicePatrolUpdate): Promise<PolicePatrol> {
    const updatedPolicePatrol = await this.repository.update(id, data);
    if (!updatedPolicePatrol) {
      throw new NotFoundError('PolicePatrol', id);
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
  async deletePolicePatrol(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('PolicePatrol', id);
    }
  }

  /**
   * Seeds the repository with sample data for development/testing purposes.
   *
   * @async
   * @param {number} [count=10] - The number of sample PolicePatrols to create
   * @returns {Promise<void>} A promise that resolves when seeding is complete
   */
  async seedData(count = 10): Promise<void> {
    await this.repository.seed(count);
  }
}
