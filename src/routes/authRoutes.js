/**
 * Authentication Routes (authRoutes.js)
 * -------------------------------------
 * This file defines the API endpoints related to user authentication.
 * It uses an Express router to map HTTP requests (e.g., POST /login)
 * to the corresponding controller functions that handle the logic.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user via LDAP credentials. On success, it returns
 * user information and a JSON Web Token (JWT) for session management.
 * @access  Public
 */
router.post('/login', authController.loginUser);

module.exports = router;
