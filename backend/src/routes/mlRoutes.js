const express = require('express');
const mlController = require('../controllers/mlController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

// Admin only: Train or retrain model
router.post('/train', authorize('admin'), mlController.train);

// Analyst or Admin: Run anomaly detection on stored logs
router.post('/detect', authorize('admin', 'analyst'), mlController.detect);

// Analyst, Admin, Viewer: Inspect model metadata and status
router.get('/info', authorize('admin', 'analyst', 'viewer'), mlController.getModelInfo);
router.get('/health', authorize('admin', 'analyst', 'viewer'), mlController.getHealth);

module.exports = router;
