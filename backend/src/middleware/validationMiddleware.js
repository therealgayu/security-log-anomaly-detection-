const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));
    return next(new AppError('Validation failed', 400, errorDetails));
  }
  next();
};

const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  handleValidationErrors
];

const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const googleValidationRules = [
  body('idToken')
    .notEmpty()
    .withMessage('Google idToken is required'),
  handleValidationErrors
];

const updateRoleValidationRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'analyst', 'viewer'])
    .withMessage("Role must be one of: 'admin', 'analyst', 'viewer'"),
  handleValidationErrors
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
  googleValidationRules,
  updateRoleValidationRules
};
