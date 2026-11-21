const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Query alerts and summary statistics
router.get('/', authorize('admin', 'analyst', 'viewer'), alertController.getAlerts);
router.get('/stats', authorize('admin', 'analyst', 'viewer'), alertController.getAlertStats);
router.get('/:id', authorize('admin', 'analyst', 'viewer'), alertController.getAlertById);

// Update alert triage status
router.patch('/:id/status', authorize('admin', 'analyst'), alertController.updateAlertStatus);

module.exports = router;
