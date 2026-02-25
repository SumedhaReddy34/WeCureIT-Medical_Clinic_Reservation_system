const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // Ensure this is defined in your .env file

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from Authorization header

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret); // Verify the token
        req.user = decoded; // Attach decoded token payload to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
