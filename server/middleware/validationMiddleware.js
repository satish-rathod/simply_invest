// middleware/validationMiddleware.js
import { body, validationResult } from 'express-validator';

// Middleware to validate registration input
export const validateRegistration = [
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
    body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .customSanitizer(value => value.toLowerCase()), // Only convert to lowercase

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to validate login input
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .customSanitizer(value => value.toLowerCase()), // Only convert to lowercase

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Generic error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};