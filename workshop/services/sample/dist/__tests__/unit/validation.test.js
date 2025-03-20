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
const vitest_1 = require("vitest");
const common_1 = require("@city-services/common");
const types_gen_1 = require("../../generated/types.gen");
// Import directly from the generated directory to use the real schemas
const zod = __importStar(require("../../generated/zod.gen"));
// Create test suite for validating resources using Zod schemas from generated files
(0, vitest_1.describe)('Resource Schema Validation', () => {
    (0, vitest_1.describe)('Resource Creation Schema', () => {
        (0, vitest_1.it)('should validate a valid resource creation payload', async () => {
            // Setup valid creation payload
            const validPayload = {
                name: 'Test Resource',
                description: 'Test Description',
                status: types_gen_1.ResourceStatus.ACTIVE,
                tags: ['test', 'validation']
            };
            // Use the real Zod schema for validation
            const result = await zod.zResourceCreate.parseAsync(validPayload);
            // Assertions
            (0, vitest_1.expect)(result).toEqual(validPayload);
        });
        (0, vitest_1.it)('should reject an invalid resource creation payload', async () => {
            // Setup invalid payload (missing required name)
            const invalidPayload = {
                status: types_gen_1.ResourceStatus.ACTIVE
            };
            // Validate using the real schema and expect it to throw
            await (0, vitest_1.expect)(zod.zResourceCreate.parseAsync(invalidPayload))
                .rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('Resource Update Schema', () => {
        (0, vitest_1.it)('should validate a valid resource update payload', async () => {
            // Setup valid update payload
            const validPayload = {
                name: 'Updated Resource',
                description: 'Updated Description',
                status: types_gen_1.ResourceStatus.INACTIVE
            };
            // Use the real Zod schema for validation
            const result = await zod.zResourceUpdate.parseAsync(validPayload);
            // Assertions
            (0, vitest_1.expect)(result).toEqual(validPayload);
        });
        (0, vitest_1.it)('should reject an invalid resource update payload', async () => {
            // Setup invalid payload (invalid status)
            const invalidPayload = {
                status: 'invalid-status' // Not a valid ResourceStatus
            };
            // Validate using the real schema and expect it to throw
            await (0, vitest_1.expect)(zod.zResourceUpdate.parseAsync(invalidPayload))
                .rejects.toThrow();
        });
    });
    (0, vitest_1.describe)('ValidationError', () => {
        (0, vitest_1.it)('should create a proper ValidationError object', () => {
            const error = new common_1.ValidationError({
                path: 'name',
                message: 'Name is required'
            });
            (0, vitest_1.expect)(error).toBeInstanceOf(common_1.ValidationError);
            (0, vitest_1.expect)(error.name).toBe('ValidationError');
            (0, vitest_1.expect)(error.statusCode).toBe(400);
            (0, vitest_1.expect)(error.details).toEqual({ path: 'name', message: 'Name is required' });
        });
    });
});
