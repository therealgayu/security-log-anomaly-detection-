const express = require('express');
const webhookController = require('../controllers/webhookController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Inbound webhook for external log forwarders (shared secret authentication)
router.post('/inbound/logs', webhookController.handleInboundLogs);

// Outbound webhook management (Admin only)
router.post('/', authenticate, authorize('admin'), webhookController.createWebhook);
router.get('/', authenticate, authorize('admin'), webhookController.getWebhooks);
router.delete('/:id', authenticate, authorize('admin'), webhookController.deleteWebhook);
router.post('/:id/test', authenticate, authorize('admin'), webhookController.testWebhook);

module.exports = router;
