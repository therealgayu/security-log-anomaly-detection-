/**
 * Swagger / OpenAPI 3.0 definition for SLADS Backend API
 * Security Log Anomaly Detection System – NIIT University Capstone II
 */
const config = require('../config/env');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Security Log Anomaly Detection System – API',
    version: '1.0.0',
    description:
      'REST API for the SLADS platform. Covers authentication, security-log ingestion & preprocessing, ' +
      'Isolation Forest anomaly detection, alert management, outbound/inbound webhook delivery, and user RBAC.',
    contact: {
      name: 'NIIT University Capstone II',
    },
  },
  servers: [
    { url: '/api', description: 'Default Gateway (Current Host / Docker Nginx)' },
    { url: 'https://localhost/api', description: 'Docker HTTPS Gateway' },
    { url: `http://localhost:${config.port}/api`, description: 'Direct Backend (Standalone Node)' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login or /auth/register',
      },
      ApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-KEY',
        description: 'ML service API key (used by backend ML proxy only)',
      },
      WebhookSecret: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Webhook-Secret',
        description: 'Shared secret for inbound webhook log forwarding',
      },
    },
    schemas: {
      /* ─── Generic ─── */
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Human-readable error message' },
          statusCode: { type: 'integer', example: 400 },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 250 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 13 },
        },
      },
      /* ─── User ─── */
      UserPublic: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665abc123def456789012345' },
          name: { type: 'string', example: 'Alice Analyst' },
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          role: { type: 'string', enum: ['admin', 'analyst', 'viewer'] },
          authProvider: { type: 'string', enum: ['local', 'google'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      /* ─── Log ─── */
      LogEntry: {
        type: 'object',
        required: ['timestamp', 'sourceIp', 'username', 'eventType'],
        properties: {
          _id: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-11-01T10:30:00Z' },
          sourceIp: { type: 'string', example: '192.168.1.100' },
          username: { type: 'string', example: 'jdoe' },
          eventType: {
            type: 'string',
            enum: ['login_success', 'login_failed', 'access_denied', 'file_access', 'privilege_change', 'system_error'],
          },
          resource: { type: 'string', example: '/api/users' },
          statusCode: { type: 'integer', example: 403 },
          userAgent: { type: 'string' },
          message: { type: 'string' },
          raw: { type: 'string' },
          anomalyScore: { type: 'number', nullable: true, example: 0.87 },
          isAnomaly: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      /* ─── Alert ─── */
      Alert: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          logId: { type: 'string' },
          sourceIp: { type: 'string' },
          username: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          status: { type: 'string', enum: ['open', 'acknowledged', 'resolved'] },
          reason: { type: 'string' },
          anomalyScore: { type: 'number', minimum: 0, maximum: 1 },
          resolvedBy: { type: 'string', nullable: true },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      /* ─── Webhook ─── */
      Webhook: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          events: { type: 'array', items: { type: 'string' }, example: ['alert.critical', 'alert.high'] },
          format: { type: 'string', enum: ['standard', 'slack', 'discord'] },
          active: { type: 'boolean' },
          createdBy: { $ref: '#/components/schemas/UserPublic' },
          deliveryLogs: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
};

module.exports = swaggerDefinition;
