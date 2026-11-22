/**
 * JSDoc annotations for every route – consumed by swagger-jsdoc to generate OpenAPI paths.
 * This file is imported by swaggerSetup.js only for its JSDoc blocks; it exports nothing.
 */

// ─────────────────────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Service health check
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 status:  { type: string,  example: healthy }
 *                 timestamp: { type: string, format: date-time }
 *                 uptimeSeconds: { type: integer }
 *                 database: { type: string, example: connected }
 */

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new local user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: Alice Analyst }
 *               email:    { type: string, format: email, example: alice@example.com }
 *               password: { type: string, minLength: 8, example: MySecret@12345 }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:  { $ref: '#/components/schemas/UserPublic' }
 *                         token: { type: string }
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email, example: admin@test.com }
 *               password: { type: string, example: Admin@12345 }
 *     responses:
 *       200:
 *         description: Login successful; returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:  { $ref: '#/components/schemas/UserPublic' }
 *                         token: { type: string }
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorEnvelope' }
 */

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate via Google Identity Services ID token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string, description: Google credential JWT }
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:  { $ref: '#/components/schemas/UserPublic' }
 *                         token: { type: string }
 *       401:
 *         description: Invalid Google ID token
 */

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user object
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/UserPublic' }
 *       401:
 *         description: Missing or invalid JWT
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidates client-side token)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout acknowledged
 */

// ─────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's role (Admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the target user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *                 example: analyst
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/UserPublic' }
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */

// ─────────────────────────────────────────────────────────────
// LOGS
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /logs:
 *   post:
 *     tags: [Logs]
 *     summary: Ingest a single security log entry (analyst, admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LogEntry' }
 *     responses:
 *       201:
 *         description: Log ingested
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         log: { $ref: '#/components/schemas/LogEntry' }
 *       400:
 *         description: Validation failed
 *   get:
 *     tags: [Logs]
 *     summary: Retrieve paginated logs with optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: eventType
 *         schema: { type: string, enum: [login_success, login_failed, access_denied, file_access, privilege_change, system_error] }
 *       - in: query
 *         name: sourceIp
 *         schema: { type: string }
 *       - in: query
 *         name: username
 *         schema: { type: string }
 *       - in: query
 *         name: isAnomaly
 *         schema: { type: boolean }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Paginated log list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         logs: { type: array, items: { $ref: '#/components/schemas/LogEntry' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */

/**
 * @openapi
 * /logs/bulk:
 *   post:
 *     tags: [Logs]
 *     summary: Ingest a JSON array of log entries (analyst, admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/LogEntry' }
 *     responses:
 *       201:
 *         description: Bulk ingestion result
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalReceived: { type: integer }
 *                         acceptedCount: { type: integer }
 *                         rejectedCount: { type: integer }
 *                         rejections: { type: array, items: { type: object } }
 */

/**
 * @openapi
 * /logs/upload:
 *   post:
 *     tags: [Logs]
 *     summary: Upload a CSV or plain-text log file (analyst, admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: .csv or .log file
 *     responses:
 *       201:
 *         description: File processed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         filename: { type: string }
 *                         fileSize: { type: integer }
 *                         totalReceived: { type: integer }
 *                         acceptedCount: { type: integer }
 *                         rejectedCount: { type: integer }
 */

/**
 * @openapi
 * /logs/stats:
 *   get:
 *     tags: [Logs]
 *     summary: Aggregated log statistics
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics object
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalLogs: { type: integer }
 *                         totalAnomalies: { type: integer }
 *                         anomalyRate: { type: number }
 *                         uniqueIps: { type: integer }
 *                         uniqueUsers: { type: integer }
 *                         eventTypeDistribution: { type: object }
 *                         earliestTimestamp: { type: string, format: date-time, nullable: true }
 *                         latestTimestamp: { type: string, format: date-time, nullable: true }
 */

/**
 * @openapi
 * /logs/{id}:
 *   get:
 *     tags: [Logs]
 *     summary: Get a single log by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log object
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         log: { $ref: '#/components/schemas/LogEntry' }
 *       404:
 *         description: Log not found
 *   delete:
 *     tags: [Logs]
 *     summary: Delete a log entry (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Log deleted
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Log not found
 */

// ─────────────────────────────────────────────────────────────
// ML
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /ml/train:
 *   post:
 *     tags: [ML]
 *     summary: Trigger Isolation Forest model training from stored logs (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 5000
 *                 description: Maximum number of logs to train on (10–25000)
 *               contamination:
 *                 type: number
 *                 description: Expected anomaly fraction (0.001–0.5)
 *     responses:
 *       200:
 *         description: Training completed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         nSamples:          { type: integer }
 *                         anomaliesDetected: { type: integer }
 *                         contamination:     { type: number }
 *                         trainedAt:         { type: string }
 *                         features:          { type: array, items: { type: string } }
 *       400:
 *         description: Insufficient logs in database
 *       403:
 *         description: Admin role required
 */

/**
 * @openapi
 * /ml/detect:
 *   post:
 *     tags: [ML]
 *     summary: Run anomaly detection on stored logs, update scores and generate alerts (analyst, admin)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 1000
 *               unprocessedOnly:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Detection result
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalEvaluated:    { type: integer }
 *                         anomaliesDetected: { type: integer }
 *                         updatedCount:      { type: integer }
 *                         alertsCreated:     { type: integer }
 *                         deduplicatedCount: { type: integer }
 *       503:
 *         description: ML model not trained yet
 */

/**
 * @openapi
 * /ml/info:
 *   get:
 *     tags: [ML]
 *     summary: Get current model metadata
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Model info
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         isLoaded:  { type: boolean }
 *                         trainedAt: { type: string, nullable: true }
 *                         nSamples:  { type: integer, nullable: true }
 *                         features:  { type: array, items: { type: string } }
 *                         params:    { type: object }
 *                         modelPath: { type: string }
 */

/**
 * @openapi
 * /ml/health:
 *   get:
 *     tags: [ML]
 *     summary: Check ML service connectivity and model load status
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ML service health
 */

// ─────────────────────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /alerts:
 *   get:
 *     tags: [Alerts]
 *     summary: List alerts with filters and pagination
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: severity
 *         schema: { type: string, enum: [low, medium, high, critical] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, acknowledged, resolved] }
 *       - in: query
 *         name: sourceIp
 *         schema: { type: string }
 *       - in: query
 *         name: username
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Paginated alert list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         alerts: { type: array, items: { $ref: '#/components/schemas/Alert' } }
 *                         pagination: { $ref: '#/components/schemas/PaginationMeta' }
 */

/**
 * @openapi
 * /alerts/stats:
 *   get:
 *     tags: [Alerts]
 *     summary: Aggregated alert statistics and severity breakdown
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Alert statistics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalAlerts:         { type: integer }
 *                         openAlerts:          { type: integer }
 *                         acknowledgedAlerts:  { type: integer }
 *                         resolvedAlerts:      { type: integer }
 *                         last24hCount:        { type: integer }
 *                         averageAnomalyScore: { type: number }
 *                         severityBreakdown:   { type: object }
 */

/**
 * @openapi
 * /alerts/{id}:
 *   get:
 *     tags: [Alerts]
 *     summary: Get a single alert by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Alert object
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         alert: { $ref: '#/components/schemas/Alert' }
 *       404:
 *         description: Alert not found
 */

/**
 * @openapi
 * /alerts/{id}/status:
 *   patch:
 *     tags: [Alerts]
 *     summary: Update alert triage status (analyst, admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, acknowledged, resolved]
 *                 example: acknowledged
 *     responses:
 *       200:
 *         description: Alert status updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         alert: { $ref: '#/components/schemas/Alert' }
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Viewer role cannot change alert status
 *       404:
 *         description: Alert not found
 */

// ─────────────────────────────────────────────────────────────
// WEBHOOKS
// ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Register a new outbound webhook (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url, secret]
 *             properties:
 *               url:    { type: string, format: uri, example: 'https://hooks.slack.com/services/T00/B00/XXX' }
 *               secret: { type: string, example: my_webhook_secret }
 *               events: { type: array, items: { type: string }, example: [alert.critical, alert.high] }
 *               format: { type: string, enum: [standard, slack, discord], default: standard }
 *               active: { type: boolean, default: true }
 *     responses:
 *       201:
 *         description: Webhook registered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         webhook: { $ref: '#/components/schemas/Webhook' }
 *   get:
 *     tags: [Webhooks]
 *     summary: List all outbound webhooks (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Webhook list
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         webhooks: { type: array, items: { $ref: '#/components/schemas/Webhook' } }
 */

/**
 * @openapi
 * /webhooks/{id}:
 *   delete:
 *     tags: [Webhooks]
 *     summary: Delete an outbound webhook (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Webhook deleted
 *       404:
 *         description: Webhook not found
 */

/**
 * @openapi
 * /webhooks/{id}/test:
 *   post:
 *     tags: [Webhooks]
 *     summary: Send a test ping to a registered webhook (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Delivery result of the test ping
 */

/**
 * @openapi
 * /webhooks/inbound/logs:
 *   post:
 *     tags: [Webhooks]
 *     summary: Inbound webhook – forward external logs (authenticated by X-Webhook-Secret)
 *     security:
 *       - WebhookSecret: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/LogEntry' }
 *     responses:
 *       201:
 *         description: Logs ingested
 *       401:
 *         description: Invalid or missing X-Webhook-Secret header
 */
