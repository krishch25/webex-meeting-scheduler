/**
 * Authentication Controller (authController.js)
 * ---------------------------------------------
 * This file contains the core logic for handling authentication requests.
 * It orchestrates the authentication process by calling the ldapService,
 * and upon successful authentication, it generates and returns a JWT.
 */

const jwt = require('jsonwebtoken');
const ldapService = require('../services/ldapService');

/**
 * Handles the user login request.
 * 1. Validates input.
 * 2. Calls the ldapService to authenticate the user.
 * 3. Creates a JWT if authentication is successful.
 * 4. Sends the appropriate HTTP response.
 *
 * @param {object} req - Express request object, containing username and password in the body.
 * @param {object} res - Express response object.
 */
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Delegate the core authentication logic to the ldapService
        const userData = await ldapService.authenticate(username, password);

        // If authentication is successful, create the JWT payload
        const payload = {
            userId: username,
            email: userData.mail,
            name: userData.displayName || userData.cn || username
        };

        // Sign the token with the secret key and set an expiration time
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // Send a success response with user data and the token
        res.status(200).json({
            message: 'Login successful!',
            user: {
                name: userData.displayName || userData.cn || username,
                email: userData.mail
            },
            token: token
        });

    } catch (error) {
        // Catch errors thrown from the ldapService (e.g., User not found, Invalid credentials)
        console.error(`[AUTH_CONTROLLER_ERROR] ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message || 'An internal server error occurred.' });
    }
};
