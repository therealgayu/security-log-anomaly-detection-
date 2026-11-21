const express = require('express');
const logController = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All log endpoints require authentication
router.use(authenticate);

// Ingestion endpoints: accessible by admin and analyst
router.post('/', authorize('admin', 'analyst'), logController.createLog);
router.post('/bulk', authorize('admin', 'analyst'), logController.createBulkLogs);
router.post('/upload', authorize('admin', 'analyst'), upload.single('file'), logController.uploadLogs);

// Query & Analytics: accessible by admin, analyst, and viewer
router.get('/', authorize('admin', 'analyst', 'viewer'), logController.getLogs);
router.get('/stats', authorize('admin', 'analyst', 'viewer'), logController.getLogStats);
router.get('/:id', authorize('admin', 'analyst', 'viewer'), logController.getLogById);

// Deletion: Admin only
router.delete('/:id', authorize('admin'), logController.deleteLog);

module.exports = router;
