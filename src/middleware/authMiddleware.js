/**
 * Authentication Middleware (authMiddleware.js)
 * ---------------------------------------------
 * This middleware is responsible for protecting routes that require
 * a user to be authenticated. It checks for a valid JSON Web Token (JWT)
 * in the request's Authorization header.
 */

const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT from the request header.
 * If the token is valid, it decodes the payload (containing user info)
 * and attaches it to the request object (`req.user`) for use in subsequent
 * controller functions. If the token is invalid or missing, it sends an
 * appropriate error response.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user payload to request object
        next(); // Proceed to the protected route
    } catch (err) {
        res.status(403).json({ message: 'Access Denied: Invalid or expired token.' });
    }
};
