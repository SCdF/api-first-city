"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourceRouter = exports.ResourceController = void 0;
const express_1 = require("express");
const common_1 = require("@city-services/common");
const resource_service_1 = require("../services/resource-service");
const police_repository_1 = require("../repositories/police-repository");
const openapi_validator_middleware_1 = require("../middleware/openapi-validator.middleware");
/**
 * Controller for resource endpoints
 */
class ResourceController {
    constructor(service) {
        this.service = service;
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    /**
     * Set up controller routes
     */
    setupRoutes() {
        // Add validation middleware to all routes
        this.router.use((0, openapi_validator_middleware_1.validateOpenAPI)());
        // Get all resources
        this.router.get('/', this.getResources.bind(this));
        // Create a new resource
        this.router.post('/', this.createResource.bind(this));
        // Get a resource by ID
        this.router.get('/:id', this.getResourceById.bind(this));
        // Update a resource
        this.router.put('/:id', this.updateResource.bind(this));
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }
    /**
     * Handle GET /resources
     */
    async getResources(req, res, next) {
        try {
            const { name, page, page_size } = req.query;
            const resources = await this.service.getPolicePatrols({
                name: name,
                page: Number.parseInt(page),
                page_size: Number.parseInt(page_size),
            });
            res.json(resources);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle GET /resources/:id
     */
    async getResourceById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new common_1.ValidationError({ path: 'id', message: 'Resource ID is required' });
            }
            const resource = await this.service.getPolicePatrolById(id);
            res.json(resource);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle POST /resources
     */
    async createResource(req, res, next) {
        try {
            const newResource = await this.service.createPolicePatrol(req.body);
            res.status(common_1.HttpStatus.CREATED).json(newResource);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Handle PUT /resources/:id
     */
    async updateResource(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new common_1.ValidationError({ path: 'id', message: 'Resource ID is required' });
            }
            const updatedResource = await this.service.updatePolicePatrol(id, req.body);
            res.json(updatedResource);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ResourceController = ResourceController;
// Create router instance with service
const resourceService = new resource_service_1.PolicePatrolService(new police_repository_1.ResourceRepository());
const resourceController = new ResourceController(resourceService);
exports.resourceRouter = resourceController.getRouter();
