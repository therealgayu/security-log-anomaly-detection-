const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const {
  registerValidationRules,
  loginValidationRules,
  googleValidationRules
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', registerValidationRules, authController.register);
router.post('/login', loginValidationRules, authController.login);
router.post('/google', googleValidationRules, authController.googleLogin);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
