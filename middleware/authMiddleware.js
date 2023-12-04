// Importing required modules
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Middleware to protect routes by verifying the JWT token.
 * This ensures that the route is accessed by an authenticated user.
 */
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header is present and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the authorization header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using jwt.verify and the secret from environment variables
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user based on the ID in the decoded token and attach the user object to the request
            // Exclude the password when attaching the user object
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware
            next();
        } catch (error) {
            // If token verification fails, send a 401 Unauthorized response
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // If no token is provided in the headers, send a 401 Unauthorized response
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * Middleware to check if the authenticated user is an admin.
 * This is used to protect routes that should only be accessible by admin users.
 */
const admin = (req, res, next) => {
    // Check if the user exists and has the role 'admin'
    if (req.user && req.user.role === 'admin') {
        // Proceed to the next middleware
        next();
    } else {
        // If the user is not an admin, send a 401 Unauthorized response
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

// Exporting the middleware functions to be used in other parts of the application
module.exports = { protect, admin };
