/**
 * Swagger UI setup – mounts /api/docs with full OpenAPI spec.
 * Call setupSwagger(app) in app.js BEFORE the 404 catch-all.
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('./swaggerDef');
const path = require('path');

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, 'swaggerDocs.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  // Serve the raw JSON spec at /api/docs.json
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve the interactive Swagger UI at /api/docs
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'SLADS API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        docExpansion: 'list',
      },
    })
  );

  console.log('[Swagger] API documentation available at /api/docs');
}

module.exports = { setupSwagger, swaggerSpec };
