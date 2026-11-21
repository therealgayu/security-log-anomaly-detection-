const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { updateRoleValidationRules } = require('../middleware/validationMiddleware');

const router = express.Router();

router.patch('/:id/role', authenticate, authorize('admin'), updateRoleValidationRules, userController.updateUserRole);

module.exports = router;
