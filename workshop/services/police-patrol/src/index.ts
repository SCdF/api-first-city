import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';
import errorHandler from './middleware/error-handler';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(json());

// Serve OpenAPI spec
app.use('/api-docs', express.static(join(__dirname, '../api')));

// OpenAPI validation middleware
app.use(
  OpenAPIValidator.middleware({
    apiSpec: join(__dirname, '../api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true,
  })
);

// Routes will be added here

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(
    `🚀 ${process.env.SERVICE_NAME || 'Your service'} running at http://localhost:${port}`
  );
  console.log(`📚 API documentation at http://localhost:${port}/api-docs`);
});
