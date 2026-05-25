const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, me, refresh } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['candidate', 'recruiter']).withMessage('Role must be candidate or recruiter')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.post('/logout', logout);

router.get('/me', authenticate, me);

router.post('/refresh', refresh);

module.exports = router;
