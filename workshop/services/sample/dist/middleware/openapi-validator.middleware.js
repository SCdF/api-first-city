"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOpenAPI = validateOpenAPI;
const common_1 = require("@city-services/common");
const zod_1 = require("zod");
// Import all generated Zod schemas
const schemas = __importStar(require("../generated/zod.gen"));
// Map of routes to their schema configurations
const routeSchemas = new Map([
    // GET /resources
    ['/resources:get', {
            method: 'get',
            path: '/resources',
            requestSchema: {
                query: zod_1.z.object({
                    page: zod_1.z.coerce.number().int().nonnegative().optional(),
                    page_size: zod_1.z.coerce.number().int().positive().optional(),
                    name: zod_1.z.string().optional(),
                }).strict(),
            },
            responseSchema: schemas.zListResourcesResponse,
        }],
    // POST /resources
    ['/resources:post', {
            method: 'post',
            path: '/resources',
            requestSchema: {
                body: schemas.zResourceCreate,
            },
            responseSchema: schemas.zCreateResourceResponse,
        }],
    // GET /resources/:id
    ['/resources/{id}:get', {
            method: 'get',
            path: '/resources/:id',
            requestSchema: {
                params: zod_1.z.object({ id: zod_1.z.string() }).strict(),
            },
            responseSchema: schemas.zGetResourceResponse,
        }],
    // PUT /resources/:id
    ['/resources/{id}:put', {
            method: 'put',
            path: '/resources/:id',
            requestSchema: {
                params: zod_1.z.object({ id: zod_1.z.string() }).strict(),
                body: schemas.zResourceUpdate,
            },
            responseSchema: schemas.zUpdateResourceResponse,
        }],
    // DELETE /resources/:id
    ['/resources/{id}:delete', {
            method: 'delete',
            path: '/resources/:id',
            requestSchema: {
                params: zod_1.z.object({ id: zod_1.z.string() }).strict(),
            },
            responseSchema: schemas.zDeleteResourceResponse,
        }],
    // GET /health
    ['/health:get', {
            method: 'get',
            path: '/health',
            responseSchema: schemas.zHealthCheckResponse,
        }],
]);
/**
 * Convert Express path to OpenAPI path format
 */
function expressPathToOpenAPI(path) {
    return path.replace(/:([^/]+)/g, '{$1}');
}
/**
 * Get route configuration for the current request
 */
function getRouteConfig(req) {
    const openAPIPath = expressPathToOpenAPI(req.route.path);
    const key = `${openAPIPath}:${req.method.toLowerCase()}`;
    return routeSchemas.get(key);
}
/**
 * Validate request data against schema
 */
async function validateRequestData(data, schema) {
    try {
        return await schema.parseAsync(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const details = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            throw new common_1.ValidationError(details);
        }
        throw error;
    }
}
/**
 * Middleware to validate requests and responses based on OpenAPI schemas
 */
function validateOpenAPI() {
    return async (req, res, next) => {
        const config = getRouteConfig(req);
        if (!config) {
            // No schema configuration found for this route
            return next();
        }
        try {
            // Validate request
            if (config.requestSchema) {
                if (config.requestSchema.body && Object.keys(req.body).length > 0) {
                    req.body = await validateRequestData(req.body, config.requestSchema.body);
                }
                if (config.requestSchema.query && Object.keys(req.query).length > 0) {
                    req.query = await validateRequestData(req.query, config.requestSchema.query);
                }
                if (config.requestSchema.params && Object.keys(req.params).length > 0) {
                    req.params = await validateRequestData(req.params, config.requestSchema.params);
                }
            }
            // Capture the response to validate it
            const originalJson = res.json;
            res.json = function (body) {
                if (config.responseSchema) {
                    try {
                        body = config.responseSchema.parse(body);
                    }
                    catch (error) {
                        if (error instanceof zod_1.z.ZodError) {
                            const details = error.errors.map(err => ({
                                path: err.path.join('.'),
                                message: err.message,
                            }));
                            next(new common_1.ValidationError(details));
                            return res;
                        }
                        next(error);
                        return res;
                    }
                }
                return originalJson.call(this, body);
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
