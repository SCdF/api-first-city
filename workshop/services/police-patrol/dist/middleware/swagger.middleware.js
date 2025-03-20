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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwaggerUI = setupSwaggerUI;
const express_1 = __importDefault(require("express"));
const yaml = __importStar(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const swagger_ui_dist_1 = require("swagger-ui-dist");
const express_csp_header_1 = require("express-csp-header");
const common_1 = require("@city-services/common");
const config_1 = __importDefault(require("../config/config"));
const logger = new common_1.Logger({ service: config_1.default.serviceName });
/**
 * Sets up Swagger UI for the Express application
 *
 * @param app Express application
 * @param apiSpecPath Path to the OpenAPI YAML file
 * @returns void
 */
function setupSwaggerUI(app, apiSpecPath) {
    try {
        // Apply CSP middleware specifically for Swagger UI routes to allow necessary resources
        app.use(['/api-docs', '/api-spec.json'], (0, express_csp_header_1.expressCspHeader)({
            directives: {
                'default-src': [express_csp_header_1.SELF],
                'script-src': [express_csp_header_1.SELF, express_csp_header_1.INLINE],
                'style-src': [express_csp_header_1.SELF, express_csp_header_1.INLINE],
                'img-src': [express_csp_header_1.SELF, 'data:'],
                'font-src': [express_csp_header_1.SELF],
                'object-src': [express_csp_header_1.SELF],
                'connect-src': [express_csp_header_1.SELF],
            },
        }));
        // Create a route to serve the OpenAPI spec as JSON
        app.get('/api-spec.json', (_req, res) => {
            try {
                const yamlContent = fs_1.default.readFileSync(apiSpecPath, 'utf8');
                const jsonContent = yaml.load(yamlContent);
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(jsonContent));
            }
            catch (err) {
                res.status(500).send(`Error converting YAML to JSON: ${err}`);
            }
        });
        // This approach follows the recommended Swagger UI implementation from:
        // https://github.com/swagger-api/swagger-ui/blob/HEAD/docs/usage/installation.md
        // We're using swagger-ui-dist to serve the static assets and creating a custom
        // HTML page with our preferred configuration options.
        const swaggerUiAssetPath = (0, swagger_ui_dist_1.absolutePath)();
        // Create custom HTML for Swagger UI with advanced configuration options
        const swaggerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sample Service API Documentation</title>
      <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
      <link rel="stylesheet" type="text/css" href="./index.css" />
      <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
      <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
      <style>
        body {
          margin: 0;
          background: #fafafa;
        }
        .swagger-ui .topbar { 
          background-color: #1f2937;
        }
        .swagger-ui .info .title {
          font-size: 24px;
        }
        .swagger-ui .scheme-container {
          box-shadow: none;
        }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="./swagger-ui-bundle.js" charset="UTF-8"></script>
      <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"></script>
      <script>
        window.onload = function() {
          // Begin Swagger UI call region
          window.ui = SwaggerUIBundle({
            url: "/api-spec.json",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            docExpansion: "list",
            tagsSorter: "alpha",
            operationsSorter: "alpha",
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 3,
            displayRequestDuration: true,
            filter: true,
            supportedSubmitMethods: ["get", "put", "post", "delete", "options", "head", "patch"],
            tryItOutEnabled: true
          });
          // End Swagger UI call region
        }
      </script>
    </body>
    </html>
    `;
        // Serve Swagger UI assets
        app.use('/api-docs', express_1.default.static(swaggerUiAssetPath, { index: false }));
        // Serve customized Swagger UI index
        app.get('/api-docs', (_req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.send(swaggerHtml);
        });
        logger.info('API documentation available at /api-docs');
    }
    catch (error) {
        logger.error('Failed to set up API documentation:', error);
    }
}
