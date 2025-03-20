"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const express_1 = require("express");
/**
 * Controller for health check endpoint
 */
class HealthController {
    constructor(version = '1.0.0') {
        this.version = version;
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    /**
     * Set up controller routes
     */
    setupRoutes() {
        this.router.get('/', this.healthCheck.bind(this));
    }
    /**
     * Get the router instance
     */
    getRouter() {
        return this.router;
    }
    /**
     * Handle GET /health
     */
    healthCheck(_req, res) {
        res.json({
            status: 'ok',
            version: this.version,
            timestamp: new Date().toISOString(),
        });
    }
}
exports.HealthController = HealthController;
